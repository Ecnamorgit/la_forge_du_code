import { describe, it, expect } from "vitest";

import { getChapterData, listCourseSlugs, listChapterSlugs } from "@/lib/courses-registry";
import { getValidators, listValidatorCourses } from "./index";
import { RUNTIME_CHAPTERS } from "./runtime";

/**
 * Structural sweep of the whole learning path.
 *
 * The per-chapter tests check that a validator judges correctly. This one checks
 * that it exists, that it is wired in, and that the step it guards is not empty.
 * Everything is derived from the two registries: a new chapter is covered without
 * touching this file.
 */

/**
 * Chapters judged on an execution (see `runtime.ts`): without a context, their
 * validators fail whatever the startCode, so the invariant would prove
 * nothing. Dedicated tests cover them with a real context.
 */
const RUNTIME_STEPS = RUNTIME_CHAPTERS;

/** One (course, chapter) pair per chapter declared in the content registry. */
const CHAPTERS = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("content and validator registries", () => {
  it("declare exactly the same courses", () => {
    expect([...listValidatorCourses()].sort()).toEqual([...listCourseSlugs()].sort());
  });

  it("expose at least one chapter", () => {
    expect(CHAPTERS.length).toBeGreaterThan(0);
  });
});

describe("every chapter can be validated", () => {
  describe.each(CHAPTERS)("$course / $chapter", ({ course, chapter }) => {
    it("has as many validators as steps", () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} missing from the content registry`).not.toBeNull();

      const validators = getValidators(course, chapter);

      // A step without a validator can never be validated: the learner is stuck
      // with no way out. A validator without a step will never run.
      expect(
        validators.length,
        `${course}/${chapter} : ${validators.length} validateur(s) pour ` +
          `${data!.steps.length} étape(s).`
      ).toBe(data!.steps.length);
    });
  });
});

describe("the start code never validates its own step", () => {
  const testable = CHAPTERS.filter(
    ({ course, chapter }) => !RUNTIME_STEPS.has(`${course}/${chapter}`)
  );

  describe.each(testable)("$course / $chapter", ({ course, chapter }) => {
    const data = getChapterData(course, chapter)!;
    const validators = getValidators(course, chapter);

    data.steps.forEach((step, i) => {
      it(`step ${i + 1}`, () => {
        const validate = validators[i];
        expect(validate, `no validator for step ${i + 1}`).toBeTypeOf("function");

        // If the startCode already passes, the step is empty: the learner clicks
        // "check" and succeeds without writing anything. Nothing else flags it.
        expect(
          validate(step.startCode).ok,
          `${course}/${chapter} step ${i + 1}: the start code already passes. ` +
            `The learner has nothing to do.`
        ).toBe(false);
      });
    });
  });
});
