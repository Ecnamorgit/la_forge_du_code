import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

// Number of chapters for each complete course covered here.
const COURSES: Record<string, number> = { html: 8, css: 10 };

describe("Kira appears in person at the top of the 1st briefing (HTML + CSS)", () => {
  for (const [course, count] of Object.entries(COURSES)) {
    for (let n = 1; n <= count; n++) {
      const slug = `chapitre-${n}`;
      it(`${course}/${slug} — the first briefing mentions Kira`, () => {
        const data = getChapterData(course, slug);
        expect(data, `${course}/${slug} not found`).not.toBeNull();
        const content = data!.steps[0].briefing?.content ?? "";
        expect(content).toContain("Kira");
      });
    }
  }
});
