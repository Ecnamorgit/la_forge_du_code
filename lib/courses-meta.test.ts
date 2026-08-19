import { describe, it, expect } from "vitest";
import { getCompletionStats } from "./courses-meta";
import { DEFAULT_USER, type UserState } from "./user-store";

// typescript et git sont des cursus pilotes à un seul chapitre de 4 étapes
// (lib/chapter-summaries.ts) : fixtures minimales et stables pour vérifier
// le comptage sans dépendre du volume des cursus complets.
function withCompletedSteps(steps: Record<string, number[]>): UserState {
  return { ...DEFAULT_USER, completedSteps: steps };
}

describe("getCompletionStats", () => {
  it("ne compte rien pour un état vierge", () => {
    expect(getCompletionStats(DEFAULT_USER, ["typescript", "git"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });

  it("compte un chapitre et son cursus bouclés quand toutes les étapes sont faites", () => {
    const state = withCompletedSteps({ "typescript/chapitre-1": [0, 1, 2, 3] });
    expect(getCompletionStats(state, ["typescript", "git"])).toEqual({
      coursesComplete: 1,
      chaptersComplete: 1,
    });
  });

  it("ne compte pas un chapitre entamé mais pas terminé", () => {
    const state = withCompletedSteps({ "typescript/chapitre-1": [0, 1] });
    expect(getCompletionStats(state, ["typescript"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });

  it("cumule sur plusieurs cursus indépendamment", () => {
    const state = withCompletedSteps({
      "typescript/chapitre-1": [0, 1, 2, 3],
      "git/chapitre-1": [0, 1],
    });
    expect(getCompletionStats(state, ["typescript", "git"])).toEqual({
      coursesComplete: 1,
      chaptersComplete: 1,
    });
  });

  it("ignore un slug inconnu (0 chapitre) sans planter", () => {
    expect(getCompletionStats(DEFAULT_USER, ["inconnu"])).toEqual({
      coursesComplete: 0,
      chaptersComplete: 0,
    });
  });
});
