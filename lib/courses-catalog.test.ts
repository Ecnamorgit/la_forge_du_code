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
    // react a exactement le seuil de chapitres attendu pour basculer en complet.
    expect(COURSE_COMPLETE_MIN_CHAPTERS).toBe(4);
    expect(getCourseStatus("react")).toBe("complete");
  });

  it("expose au moins un cursus complet et un cursus aperçu dans le catalogue", () => {
    const statuses = COURSES_CATALOG.map((c) => getCourseStatus(c.slug));
    expect(statuses).toContain("complete");
    expect(statuses).toContain("preview");
  });
});
