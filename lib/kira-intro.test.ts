import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

// Nombre de chapitres par cursus complet concerné.
const COURSES: Record<string, number> = { html: 8, css: 10 };

describe("Kira incarnée en tête du 1er briefing (HTML + CSS)", () => {
  for (const [course, count] of Object.entries(COURSES)) {
    for (let n = 1; n <= count; n++) {
      const slug = `chapitre-${n}`;
      it(`${course}/${slug} — le premier briefing cite Kira`, () => {
        const data = getChapterData(course, slug);
        expect(data, `${course}/${slug} introuvable`).not.toBeNull();
        const content = data!.steps[0].briefing?.content ?? "";
        expect(content).toContain("Kira");
      });
    }
  }
});
