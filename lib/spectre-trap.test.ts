import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

/** Étapes converties en pièges du Spectre (course, chapter, index d'étape). */
const TRAPS: Array<[string, string, number]> = [
  ["html", "chapitre-2", 0],
  ["css", "chapitre-4", 0],
  ["javascript", "chapitre-1", 0],
  ["react", "chapitre-6", 0],
];

describe("Étapes-pièges du Spectre", () => {
  for (const [course, chapter, step] of TRAPS) {
    it(`${course}/${chapter} étape ${step + 1} porte un spectreTrap non vide`, () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} introuvable`).not.toBeNull();
      const trap = data!.steps[step]?.spectreTrap;
      expect(typeof trap).toBe("string");
      expect((trap ?? "").trim().length).toBeGreaterThan(0);
    });
  }
});
