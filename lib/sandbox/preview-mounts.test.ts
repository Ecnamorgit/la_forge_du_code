import { describe, expect, it } from "vitest";

import { CHAPTER_SUMMARIES } from "@/lib/chapter-summaries";
import { getChapterData } from "@/lib/courses-registry";
import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";
import { PREVIEW_EXEMPT } from "./preview-exemptions";

/**
 * Every React step has a valid `previewMount`, or its chapter is exempted
 * with a written reason. Without this test, an oversight would leave an empty preview.
 */
describe("previewMount of the React curriculum", () => {
  const slugs = CHAPTER_SUMMARIES.react.map((c) => c.slug);

  it("covers every step, or exempts it explicitly", () => {
    for (const slug of slugs) {
      const exempt = PREVIEW_EXEMPT[`react/${slug}`];
      const data = getChapterData("react", slug);
      expect(data, `${slug} missing from the registry`).not.toBeNull();

      data!.steps.forEach((step, i) => {
        const ref = `react/${slug} step ${i + 1}`;
        if (exempt) {
          expect(step.previewMount, `${ref}: exempt chapter, unexpected previewMount`).toBeUndefined();
          return;
        }
        expect(step.previewMount, `${ref}: missing previewMount`).toBeDefined();
        expect(
          PREVIEW_MOUNT_NAME_RE.test(step.previewMount!),
          `${ref}: "${step.previewMount}" is not a valid identifier`
        ).toBe(true);
      });
    }
  });

  /**
   * A previewMount may name a component the step does not declare. Since the
   * `hint` is the reference solution, it must contain its declaration.
   */
  it("names a component declared in the step's hint", () => {
    for (const slug of slugs) {
      if (PREVIEW_EXEMPT[`react/${slug}`]) continue;
      const data = getChapterData("react", slug)!;

      data.steps.forEach((step, i) => {
        const mountName = step.previewMount!;
        const declare = new RegExp(
          `(?:function\\s+${mountName}\\s*\\(|(?:const|let|var)\\s+${mountName}\\s*=)`
        ).test(step.hint);
        expect(
          declare,
          `react/${slug} step ${i + 1}: "${mountName}" is not declared in the hint`
        ).toBe(true);
      });
    }
  });

  it("every exemption has a non-empty reason", () => {
    for (const [key, reason] of Object.entries(PREVIEW_EXEMPT)) {
      expect(reason.trim().length, `${key}: empty reason`).toBeGreaterThan(20);
    }
  });
});
