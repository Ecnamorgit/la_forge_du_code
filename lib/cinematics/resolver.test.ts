import { describe, expect, it } from "vitest";

import { cinematicId } from "./types";
import { getCinematic, isLastChapter } from "./resolver";

describe("cinematicId", () => {
  it("construit des identifiants stables", () => {
    expect(cinematicId("html", { kind: "intro" })).toBe("html:intro");
    expect(cinematicId("html", { kind: "chapter", chapter: "chapitre-3" })).toBe(
      "html:chapter:chapitre-3"
    );
    expect(cinematicId("css", { kind: "finale" })).toBe("css:finale");
  });
});

describe("getCinematic — repli générique", () => {
  it("fournit toujours une cinématique, même pour un cursus sans arc", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.id).toBe("css:intro");
    expect(intro.scenes.length).toBeGreaterThanOrEqual(2);
    // Chaque scène porte un vrai texte.
    for (const s of intro.scenes) expect(s.narration.length).toBeGreaterThan(10);
  });

  it("outro générique : déterministe pour un même chapitre", () => {
    const a = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const b = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    expect(a).toEqual(b);
    expect(a.id).toBe("css:chapter:chapitre-2");
    expect(a.scenes.length).toBeLessThanOrEqual(3);
  });

  it("outro générique : varie d'un chapitre à l'autre (rotation)", () => {
    const c2 = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const c3 = getCinematic("css", { kind: "chapter", chapter: "chapitre-3" });
    expect(c2.scenes[0].narration).not.toBe(c3.scenes[0].narration);
  });

  it("mentionne le titre du cursus dans l'intro générique", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.scenes.map((s) => s.narration).join(" ")).toContain("CSS");
  });

  it("respecte les tailles de la spec (intro 3-4, outro 2-3, finale 5-7)", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.scenes.length).toBeGreaterThanOrEqual(3);
    expect(intro.scenes.length).toBeLessThanOrEqual(4);
    const outro = getCinematic("css", { kind: "chapter", chapter: "chapitre-1" });
    expect(outro.scenes.length).toBeGreaterThanOrEqual(2);
    expect(outro.scenes.length).toBeLessThanOrEqual(3);
    const finale = getCinematic("css", { kind: "finale" });
    expect(finale.scenes.length).toBeGreaterThanOrEqual(5);
    expect(finale.scenes.length).toBeLessThanOrEqual(7);
  });
});

describe("isLastChapter", () => {
  it("vrai uniquement pour le dernier chapitre du cursus", () => {
    expect(isLastChapter("html", "chapitre-8")).toBe(true);
    expect(isLastChapter("html", "chapitre-3")).toBe(false);
  });

  it("faux pour un cursus inconnu", () => {
    expect(isLastChapter("inconnu", "chapitre-1")).toBe(false);
  });
});
