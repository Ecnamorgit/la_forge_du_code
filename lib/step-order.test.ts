import { describe, it, expect } from "vitest";

import { getChaptersMeta } from "./courses-meta";
import { getChapterData, listChapterSlugs, listCourseSlugs } from "./courses-registry";
import { checkStepOrder, type DoneStep } from "./step-order";

const CHAPTERS = [
  { slug: "chapitre-1", totalSteps: 3 },
  { slug: "chapitre-2", totalSteps: 2 },
];

const doneSteps = (...steps: [string, number][]): DoneStep[] =>
  steps.map(([chapter, stepIndex]) => ({ chapter, stepIndex }));

describe("checkStepOrder", () => {
  it("accepts the first step of the first chapter", () => {
    expect(checkStepOrder(CHAPTERS, [], "chapitre-1", 0)).toEqual({ ok: true });
  });

  it("accepts the step that follows a completed step", () => {
    expect(checkStepOrder(CHAPTERS, doneSteps(["chapitre-1", 0]), "chapitre-1", 1).ok).toBe(true);
  });

  it("rejects a step whose previous step is missing", () => {
    expect(checkStepOrder(CHAPTERS, doneSteps(["chapitre-1", 0]), "chapitre-1", 2).ok).toBe(false);
  });

  it("rejects the start of a chapter while the previous one is not finished", () => {
    const done = doneSteps(["chapitre-1", 0], ["chapitre-1", 1]);
    expect(checkStepOrder(CHAPTERS, done, "chapitre-2", 0).ok).toBe(false);
  });

  it("accepts the start of a chapter once the previous one is finished", () => {
    const done = doneSteps(["chapitre-1", 0], ["chapitre-1", 1], ["chapitre-1", 2]);
    expect(checkStepOrder(CHAPTERS, done, "chapitre-2", 0).ok).toBe(true);
  });

  it("does not confuse chapitre-1 with chapitre-10", () => {
    const journey = [
      { slug: "chapitre-1", totalSteps: 1 },
      { slug: "chapitre-10", totalSteps: 1 },
      { slug: "chapitre-11", totalSteps: 1 },
    ];
    expect(checkStepOrder(journey, doneSteps(["chapitre-1", 0]), "chapitre-11", 0).ok).toBe(false);
  });

  it("rejects a chapter missing from the journey", () => {
    expect(checkStepOrder(CHAPTERS, [], "chapitre-9", 0).ok).toBe(false);
  });
});

/**
 * The server orders chapters by `getChaptersMeta` (the chapterMap) and
 * counts steps from the content registry: if they diverged, it would reject
 * steps the UI offers. The invariant is derived from the registries, so it
 * covers newly added chapters.
 */
describe("the map and the registry describe the same journey", () => {
  it.each(listCourseSlugs())("%s", (course) => {
    const chapterMap = getChaptersMeta(course);
    expect(chapterMap.map((c) => c.slug)).toEqual(listChapterSlugs(course));
    for (const c of chapterMap) {
      expect(c.totalSteps, `${course}/${c.slug}`).toBe(getChapterData(course, c.slug)!.steps.length);
    }
  });
});
