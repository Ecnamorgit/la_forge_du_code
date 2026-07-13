import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";
import { getDocEntry } from "@/data/docs";

const EXPECTED: Record<string, string> = {
  "chapitre-1": "css/style",
  "chapitre-2": "css/selecteurs",
  "chapitre-3": "css/box-model",
  "chapitre-4": "css/flexbox",
  "chapitre-5": "css/grid",
  "chapitre-6": "css/position",
  "chapitre-7": "css/pseudo-classes",
  "chapitre-8": "css/media-queries",
  "chapitre-9": "css/transition",
  "chapitre-10": "css/variables",
};

describe("docRefs du cursus CSS", () => {
  for (const [chapter, docId] of Object.entries(EXPECTED)) {
    it(`${chapter} : l'étape 1 référence ${docId} et il résout`, () => {
      const data = getChapterData("css", chapter);
      expect(data).not.toBeNull();
      const refs = data!.steps[0].docRefs ?? [];
      expect(refs).toContain(docId);
      expect(getDocEntry(docId)).toBeDefined();
    });
  }
});
