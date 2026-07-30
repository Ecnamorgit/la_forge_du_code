import { describe, it, expect } from "vitest";
import {
  getCourseStatus,
  COURSE_COMPLETE_MIN_CHAPTERS,
  COURSES_CATALOG,
} from "./courses-catalog";

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
    // typescript est le cursus pilote qui frôle le seuil sans l'atteindre.
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
  it("resout les 8 chapitres, avec leurs validateurs et leur badge", async () => {
    const { getChapterData } = await import("./courses-registry");
    const { VALIDATORS_BY_CHAPTER } = await import("./validators/react");
    const { getBadgeForChapter } = await import("./courses-meta");
    const { CHAPTER_SUMMARIES } = await import("./chapter-summaries");
    const { getBadge } = await import("./badges-catalog");

    for (let n = 1; n <= 8; n++) {
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

    expect(CHAPTER_SUMMARIES.react).toHaveLength(8);
  });
});
