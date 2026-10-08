import { describe, it, expect } from "vitest";

import { getChapterData, listChapterSlugs, listCourseSlugs } from "@/lib/courses-registry";

/**
 * Les indices sont affichés comme du texte (audit EXE-04) : une entité HTML y
 * apparaîtrait telle quelle (« &lt; »), les chevrons s'écrivent donc en clair.
 * Le test parcourt les registres, et couvre ainsi tout nouveau chapitre.
 */

const ENTITE_HTML = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i;

const CHAPITRES = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("indices affichés en texte", () => {
  it.each(CHAPITRES)("$course / $chapter : aucune entité HTML", ({ course, chapter }) => {
    getChapterData(course, chapter)!.steps.forEach((step, i) => {
      expect(ENTITE_HTML.test(step.hint), `étape ${i + 1} : ${step.hint}`).toBe(false);
    });
  });
});
