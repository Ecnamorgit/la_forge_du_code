import { describe, it, expect } from "vitest";
import {
  getCourseStatus,
  COURSE_COMPLETE_MIN_CHAPTERS,
  COURSES_CATALOG,
} from "./courses-catalog";
import { CHAPTER_SUMMARIES } from "./chapter-summaries";

describe("getCourseStatus", () => {
  it("classe un cursus avec assez de chapitres comme complet", () => {
    expect(getCourseStatus("html")).toBe("complete");
    expect(getCourseStatus("javascript")).toBe("complete");
  });

  it("classe un cursus pilote (peu de chapitres) comme aperçu", () => {
    expect(getCourseStatus("git")).toBe("preview");
    expect(getCourseStatus("python")).toBe("preview");
  });

  it("traite un slug inconnu comme aperçu (0 chapitre)", () => {
    expect(getCourseStatus("inconnu")).toBe("preview");
  });

  it("utilise le seuil exporté comme frontière (>= seuil => complet)", () => {
    expect(COURSE_COMPLETE_MIN_CHAPTERS).toBe(4);
    // Aucun cursus ne frôle le seuil : les cursus pilotes (dont typescript)
    // ont un chapitre, les cursus complets (dont react) au moins huit.
    expect(getCourseStatus("typescript")).toBe("preview");
    expect(getCourseStatus("react")).toBe("complete");
  });

  it("expose au moins un cursus complet et un cursus aperçu dans le catalogue", () => {
    const statuses = COURSES_CATALOG.map((c) => getCourseStatus(c.slug));
    expect(statuses).toContain("complete");
    expect(statuses).toContain("preview");
  });
});

/**
 * Un chapitre React peut exister dans data/courses sans être branché dans
 * courses-registry, ses validateurs ou son résumé : le catalogue le compterait
 * sans que la page s'ouvre.
 */
describe("integrite du cursus React", () => {
  it("resout tous les chapitres declares, avec leurs validateurs et leur badge", async () => {
    const { getChapterData } = await import("./courses-registry");
    const { VALIDATORS_BY_CHAPTER } = await import("./validators/react");
    const { getBadgeForChapter } = await import("./courses-meta");
    const { getBadge } = await import("./badges-catalog");

    // Nombre de chapitres tiré de CHAPTER_SUMMARIES.react : un chapitre ajouté
    // sera couvert sans modifier ce test.
    const reactChapterCount = CHAPTER_SUMMARIES.react.length;
    expect(reactChapterCount).toBeGreaterThan(0);

    for (let n = 1; n <= reactChapterCount; n++) {
      const slug = `chapitre-${n}`;
      const data = getChapterData("react", slug);
      expect(data, `${slug} absent du registre`).not.toBeNull();
      expect(data!.steps.length, `${slug} n'a pas 4 etapes`).toBe(4);

      const validators = VALIDATORS_BY_CHAPTER[slug];
      expect(validators, `${slug} sans validateurs`).toBeDefined();
      expect(validators!.length, `${slug} : un validateur par etape`).toBe(
        data!.steps.length
      );

      const badgeId = getBadgeForChapter("react", slug);
      expect(badgeId, `${slug} sans badge declare`).not.toBeNull();
      expect(getBadge(badgeId!), `badge ${badgeId} absent du catalogue`).toBeDefined();
    }

    // Le cursus React doit rester « complet » au sens du catalogue.
    expect(reactChapterCount).toBeGreaterThanOrEqual(COURSE_COMPLETE_MIN_CHAPTERS);
    // Délai explicite : l'import dynamique de `courses-registry` charge le
    // contenu de tous les chapitres, ce qui frôle les 5 s par défaut de vitest
    // sous la charge de la suite complète.
  }, 20_000);
});
