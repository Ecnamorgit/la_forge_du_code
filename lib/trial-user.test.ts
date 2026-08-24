import { describe, expect, it } from "vitest";

import {
  applyTrialStep,
  parseTrialState,
  readTrialState,
  trialCompletedSteps,
  trialStateToUserState,
} from "./trial-user";
import { xpForStep } from "./xp";
import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER } from "./user-store";

describe("applyTrialStep", () => {
  it("ajoute une étape et attribue l'XP de lib/xp", () => {
    const next = applyTrialStep({ completedSteps: [], xp: 0 }, 0, 3);
    expect(next.state.completedSteps).toEqual([0]);
    expect(next.state.xp).toBe(xpForStep(3));
    expect(next.awardedXp).toBe(xpForStep(3));
    expect(next.alreadyDone).toBe(false);
  });

  it("est idempotent : rejouer une étape n'attribue rien", () => {
    const first = applyTrialStep({ completedSteps: [], xp: 0 }, 0, 3);
    const second = applyTrialStep(first.state, 0, 3);
    expect(second.state.completedSteps).toEqual([0]);
    expect(second.state.xp).toBe(first.state.xp);
    expect(second.awardedXp).toBe(0);
    expect(second.alreadyDone).toBe(true);
  });

  it("garde les étapes triées", () => {
    let s = { completedSteps: [] as number[], xp: 0 };
    s = applyTrialStep(s, 2, 1).state;
    s = applyTrialStep(s, 0, 1).state;
    expect(s.completedSteps).toEqual([0, 2]);
  });

  it("rejette un index d'étape négatif", () => {
    expect(() => applyTrialStep({ completedSteps: [], xp: 0 }, -1, 1)).toThrow();
  });
});

describe("parseTrialState", () => {
  const EMPTY = { completedSteps: [], xp: 0 };

  it("retourne l'état par défaut quand rien n'est stocké", () => {
    expect(parseTrialState(null)).toEqual(EMPTY);
    expect(parseTrialState("")).toEqual(EMPTY);
  });

  it("décode un état valide", () => {
    expect(parseTrialState(JSON.stringify({ completedSteps: [0, 1], xp: 66 }))).toEqual({
      completedSteps: [0, 1],
      xp: 66,
    });
  });

  it("retombe sur l'état par défaut si le JSON est corrompu", () => {
    expect(parseTrialState("{ pas du json")).toEqual(EMPTY);
  });

  it("retombe sur l'état par défaut si la forme est invalide", () => {
    expect(parseTrialState(JSON.stringify({ xp: "beaucoup" }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ completedSteps: "0", xp: 1 }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ completedSteps: [0, "1"], xp: 1 }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify([1, 2, 3]))).toEqual(EMPTY);
    expect(parseTrialState("null")).toEqual(EMPTY);
  });

  it("ne partage pas la référence du tableau décodé", () => {
    const parsed = parseTrialState(JSON.stringify({ completedSteps: [0], xp: 25 }));
    parsed.completedSteps.push(99);
    expect(parseTrialState(JSON.stringify({ completedSteps: [0], xp: 25 })).completedSteps).toEqual([0]);
  });

  it("ne partage pas le tableau `completedSteps` entre deux appels sur un chemin par défaut", () => {
    // Mute le tableau renvoyé par un premier appel « état par défaut » (JSON
    // corrompu) : un second appel « état par défaut » (raw absent) ne doit
    // jamais voir cette mutation, sans quoi les deux chemins partagent le
    // même singleton `EMPTY.completedSteps`.
    const corrupted = parseTrialState("{ pas du json");
    corrupted.completedSteps.push(999);
    expect(parseTrialState(null).completedSteps).toEqual([]);

    const invalidShape = parseTrialState(JSON.stringify({ xp: "beaucoup" }));
    invalidShape.completedSteps.push(999);
    expect(parseTrialState("").completedSteps).toEqual([]);
    expect(readTrialState().completedSteps).toEqual([]);
  });
});

describe("trialStateToUserState", () => {
  it("projette dans la forme UserState attendue par les composants", () => {
    const user = trialStateToUserState({ completedSteps: [0, 1], xp: 80 });
    expect(user.totalXp).toBe(80);
    expect(user.completedSteps[`${TRIAL_COURSE}/${TRIAL_CHAPTERS[0]}`]).toEqual([0, 1]);
    expect(user.username).toBe("Cadet");
  });

  it("ne partage pas la référence `badges` avec le singleton DEFAULT_USER", () => {
    const user = trialStateToUserState({ completedSteps: [], xp: 0 });
    expect(user.badges).not.toBe(DEFAULT_USER.badges);
    user.badges.push("badge-triche");
    expect(DEFAULT_USER.badges).toEqual([]);
  });
});

describe("trialCompletedSteps", () => {
  it("liste les étapes au format attendu par l'import", () => {
    expect(trialCompletedSteps({ completedSteps: [0, 2], xp: 0 })).toEqual([
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 0 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 2 },
    ]);
  });
});
