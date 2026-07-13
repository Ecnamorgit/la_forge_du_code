import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";
import { getDocEntry } from "@/data/docs";

const EXPECTED: Record<string, string> = {
  "chapitre-1": "js/console",
  "chapitre-2": "js/conditions",
  "chapitre-3": "js/fonctions",
  "chapitre-4": "js/tableaux",
  "chapitre-5": "js/objets",
  "chapitre-6": "js/array-methods",
  "chapitre-7": "js/dom",
  "chapitre-8": "js/events",
  "chapitre-9": "js/async",
  "chapitre-10": "js/localstorage",
  "chapitre-11": "js/fetch",
  "chapitre-12": "js/rest",
};

describe("docRefs du cursus JS", () => {
  for (const [chapter, docId] of Object.entries(EXPECTED)) {
    it(`${chapter} : l'étape 1 référence ${docId} et il résout`, () => {
      const data = getChapterData("javascript", chapter);
      expect(data).not.toBeNull();
      const refs = data!.steps[0].docRefs ?? [];
      expect(refs).toContain(docId);
      expect(getDocEntry(docId)).toBeDefined();
    });
  }
});
