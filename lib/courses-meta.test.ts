import { describe, it, expect } from "vitest";
import { getCompletionStats } from "./courses-meta";
import { DEFAULT_USER, type UserState } from "./user-store";

// typescript and git are pilot courses with a single 4-step chapter
// (lib/chapter-summaries.ts): minimal, stable fixtures to check the counting
// without depending on the size of the complete courses.
function withCompletedSteps(steps: Record<string, number[]>): UserState {
  return { ...DEFAULT_USER, completedSteps: steps };
}

describe("getCompletionStats", () => {
  it("counts nothing for a blank state", () => {
    expect(getCompletionStats(DEFAULT_USER, ["typescript", "git"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });

  it("counts a chapter and its course as finished when every step is done", () => {
    const state = withCompletedSteps({ "typescript/chapitre-1": [0, 1, 2, 3] });
    expect(getCompletionStats(state, ["typescript", "git"])).toEqual({
      coursesComplete: 1,
      chaptersComplete: 1,
    });
  });

  it("does not count a chapter that is started but not finished", () => {
    const state = withCompletedSteps({ "typescript/chapitre-1": [0, 1] });
    expect(getCompletionStats(state, ["typescript"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });

  it("accumulates across several courses independently", () => {
    const state = withCompletedSteps({
      "typescript/chapitre-1": [0, 1, 2, 3],
      "git/chapitre-1": [0, 1],
    });
    expect(getCompletionStats(state, ["typescript", "git"])).toEqual({
      coursesComplete: 1,
      chaptersComplete: 1,
    });
  });

  it("ignores an unknown slug (0 chapters) without crashing", () => {
    expect(getCompletionStats(DEFAULT_USER, ["inconnu"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });
});
