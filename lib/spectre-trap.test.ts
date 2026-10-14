import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

/** Steps turned into Spectre traps (course, chapter, step index). */
const TRAPS: Array<[string, string, number]> = [
  ["html", "chapitre-2", 0],
  ["css", "chapitre-4", 0],
  ["javascript", "chapitre-1", 0],
  ["react", "chapitre-6", 0],
];

describe("Spectre trap steps", () => {
  for (const [course, chapter, step] of TRAPS) {
    it(`${course}/${chapter} step ${step + 1} carries a non-empty spectreTrap`, () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} not found`).not.toBeNull();
      const trap = data!.steps[step]?.spectreTrap;
      expect(typeof trap).toBe("string");
      expect((trap ?? "").trim().length).toBeGreaterThan(0);
    });
  }
});
