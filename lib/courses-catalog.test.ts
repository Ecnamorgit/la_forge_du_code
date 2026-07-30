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
    // Aucun cursus du catalogue ne se trouve actuellement PRES de cette
    // frontière : les cursus pilotes (dont typescript) n'ont qu'1 chapitre,
    // et tous les cursus complets (dont react) en ont au moins 8. typescript
    // sert donc ici seulement d'exemple de cursus pilote — pas d'un cas qui
    // frôlerait le seuil de 4.
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
 * Cablage des 8 chapitres React. Un chapitre peut exister dans data/courses
 * sans etre branche dans courses-registry, ses validateurs ou son resume : le
 * catalogue le compterait alors sans que la page s'ouvre. Ce test attrape ce
 * decalage.
 */
describe("integrite du cursus React", () => {
  it("resout tous les chapitres declares, avec leurs validateurs et leur badge", async () => {
    const { getChapterData } = await import("./courses-registry");
    const { VALIDATORS_BY_CHAPTER } = await import("./validators/react");
    const { getBadgeForChapter } = await import("./courses-meta");
    const { getBadge } = await import("./badges-catalog");

    // Derive du nombre de chapitres declares dans CHAPTER_SUMMARIES.react
    // plutot qu'une borne codee en dur : un chapitre-9 ajoute plus tard sera
    // automatiquement couvert par cette boucle, sans qu'il faille se
    // souvenir de remonter un "8" quelque part dans ce fichier.
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

    // Le cursus React doit rester "complet" au sens du catalogue : un
    // reglage independant du nombre exact de chapitres, contrairement a
    // l'ancien `toHaveLength(8)` qui aurait fige cette valeur.
    expect(reactChapterCount).toBeGreaterThanOrEqual(COURSE_COMPLETE_MIN_CHAPTERS);
  });
});
