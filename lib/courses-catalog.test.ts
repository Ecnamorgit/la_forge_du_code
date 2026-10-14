import { describe, it, expect } from "vitest";
import {
  getCourseStatus,
  COURSE_COMPLETE_MIN_CHAPTERS,
  COURSES_CATALOG,
} from "./courses-catalog";
import { CHAPTER_SUMMARIES } from "./chapter-summaries";

describe("getCourseStatus", () => {
  it("classifies a course with enough chapters as complete", () => {
    expect(getCourseStatus("html")).toBe("complete");
    expect(getCourseStatus("javascript")).toBe("complete");
  });

  it("classifies a pilot course (few chapters) as preview", () => {
    expect(getCourseStatus("git")).toBe("preview");
    expect(getCourseStatus("python")).toBe("preview");
  });

  it("treats an unknown slug as preview (0 chapters)", () => {
    expect(getCourseStatus("inconnu")).toBe("preview");
  });

  it("uses the exported threshold as the boundary (>= threshold => complete)", () => {
    expect(COURSE_COMPLETE_MIN_CHAPTERS).toBe(4);
    // No course sits near the threshold: pilot courses (including typescript)
    // have one chapter, complete courses (including react) at least eight.
    expect(getCourseStatus("typescript")).toBe("preview");
    expect(getCourseStatus("react")).toBe("complete");
  });

  it("exposes at least one complete course and one preview course in the catalog", () => {
    const statuses = COURSES_CATALOG.map((c) => getCourseStatus(c.slug));
    expect(statuses).toContain("complete");
    expect(statuses).toContain("preview");
  });
});

/**
 * A React chapter can exist in data/courses without being wired into
 * courses-registry, its validators or its summary: the catalog would count it
 * while the page fails to open.
 */
describe("React course integrity", () => {
  it("resolves every declared chapter, with its validators and badge", async () => {
    const { getChapterData } = await import("./courses-registry");
    const { VALIDATORS_BY_CHAPTER } = await import("./validators/react");
    const { getBadgeForChapter } = await import("./courses-meta");
    const { getBadge } = await import("./badges-catalog");

    // Chapter count taken from CHAPTER_SUMMARIES.react: an added chapter
    // will be covered without changing this test.
    const reactChapterCount = CHAPTER_SUMMARIES.react.length;
    expect(reactChapterCount).toBeGreaterThan(0);

    for (let n = 1; n <= reactChapterCount; n++) {
      const slug = `chapitre-${n}`;
      const data = getChapterData("react", slug);
      expect(data, `${slug} missing from the registry`).not.toBeNull();
      expect(data!.steps.length, `${slug} does not have 4 steps`).toBe(4);

      const validators = VALIDATORS_BY_CHAPTER[slug];
      expect(validators, `${slug} has no validators`).toBeDefined();
      expect(validators!.length, `${slug}: one validator per step`).toBe(
        data!.steps.length
      );

      const badgeId = getBadgeForChapter("react", slug);
      expect(badgeId, `${slug} has no declared badge`).not.toBeNull();
      expect(getBadge(badgeId!), `badge ${badgeId} missing from the catalog`).toBeDefined();
    }

    // The React course must stay "complete" as the catalog defines it.
    expect(reactChapterCount).toBeGreaterThanOrEqual(COURSE_COMPLETE_MIN_CHAPTERS);
    // Explicit timeout: the dynamic import of `courses-registry` loads the
    // content of every chapter, which comes close to vitest's default 5 s
    // under the load of the full suite.
  }, 20_000);
});
