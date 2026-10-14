import { describe, it, expect } from "vitest";

import { getChapterData, listChapterSlugs, listCourseSlugs } from "@/lib/courses-registry";

/**
 * Hints are rendered as plain text (audit EXE-04): an HTML entity would show
 * up verbatim ("&lt;"), so angle brackets are written literally.
 * The test walks the registries, so it covers any new chapter too.
 */

const HTML_ENTITY = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i;

const CHAPTERS = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("hints rendered as text", () => {
  it.each(CHAPTERS)("$course / $chapter: no HTML entity", ({ course, chapter }) => {
    getChapterData(course, chapter)!.steps.forEach((step, i) => {
      expect(HTML_ENTITY.test(step.hint), `step ${i + 1}: ${step.hint}`).toBe(false);
    });
  });
});
