import { describe, expect, it } from "vitest";

import {
  applyTrialStep,
  emptyTrialState,
  parseTrialState,
  readTrialState,
  trialCompletedSteps,
  trialStateToUserState,
} from "./trial-user";
import { xpForStep } from "./xp";
import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER } from "./user-store";

describe("applyTrialStep", () => {
  it("adds a step and awards the XP from lib/xp", () => {
    const next = applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], 0, 3);
    expect(next.state.chapters[TRIAL_CHAPTERS[0]]).toEqual([0]);
    expect(next.state.xp).toBe(xpForStep(3));
    expect(next.awardedXp).toBe(xpForStep(3));
    expect(next.alreadyDone).toBe(false);
  });

  it("is idempotent: replaying a step awards nothing", () => {
    const first = applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], 0, 3);
    const second = applyTrialStep(first.state, TRIAL_CHAPTERS[0], 0, 3);
    expect(second.state.chapters[TRIAL_CHAPTERS[0]]).toEqual([0]);
    expect(second.state.xp).toBe(first.state.xp);
    expect(second.awardedXp).toBe(0);
    expect(second.alreadyDone).toBe(true);
  });

  it("keeps the steps sorted", () => {
    let s = emptyTrialState();
    s = applyTrialStep(s, TRIAL_CHAPTERS[0], 2, 1).state;
    s = applyTrialStep(s, TRIAL_CHAPTERS[0], 0, 1).state;
    expect(s.chapters[TRIAL_CHAPTERS[0]]).toEqual([0, 2]);
  });

  it("rejects a negative step index", () => {
    expect(() => applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], -1, 1)).toThrow();
  });
});

describe("parseTrialState", () => {
  const EMPTY = { chapters: {}, xp: 0 };

  it("returns the default state when nothing is stored", () => {
    expect(parseTrialState(null)).toEqual(EMPTY);
    expect(parseTrialState("")).toEqual(EMPTY);
  });

  it("decodes a valid state", () => {
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] }, xp: 66 }))
    ).toEqual({
      chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] },
      xp: 66,
    });
  });

  it("falls back to the default state if the JSON is corrupted", () => {
    expect(parseTrialState("{ pas du json")).toEqual(EMPTY);
  });

  it("falls back to the default state if the shape is invalid", () => {
    expect(parseTrialState(JSON.stringify({ xp: "beaucoup" }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ chapters: "0", xp: 1 }))).toEqual(EMPTY);
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0, "1"] }, xp: 1 }))
    ).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify([1, 2, 3]))).toEqual(EMPTY);
    expect(parseTrialState("null")).toEqual(EMPTY);
  });

  it("does not share the reference of the decoded array", () => {
    const parsed = parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0] }, xp: 25 }));
    parsed.chapters[TRIAL_CHAPTERS[0]].push(99);
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0] }, xp: 25 })).chapters[
        TRIAL_CHAPTERS[0]
      ]
    ).toEqual([0]);
  });

  it("does not share state between two calls on a default path", () => {
    // Mutating the state returned by a default path must not be visible
    // from another call.
    const corrupted = parseTrialState("{ pas du json");
    corrupted.chapters[TRIAL_CHAPTERS[0]] = [999];
    expect(parseTrialState(null).chapters).toEqual({});

    const invalidShape = parseTrialState(JSON.stringify({ xp: "beaucoup" }));
    invalidShape.chapters[TRIAL_CHAPTERS[0]] = [999];
    expect(parseTrialState("").chapters).toEqual({});
    expect(readTrialState().chapters).toEqual({});
  });
});

describe("trialStateToUserState", () => {
  it("projects into the UserState shape expected by the components", () => {
    const user = trialStateToUserState({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] }, xp: 80 });
    expect(user.totalXp).toBe(80);
    expect(user.completedSteps[`${TRIAL_COURSE}/${TRIAL_CHAPTERS[0]}`]).toEqual([0, 1]);
    expect(user.username).toBe("Cadet");
  });

  it("does not share the `badges` reference with the DEFAULT_USER singleton", () => {
    const user = trialStateToUserState(emptyTrialState());
    expect(user.badges).not.toBe(DEFAULT_USER.badges);
    user.badges.push("badge-triche");
    expect(DEFAULT_USER.badges).toEqual([]);
  });
});

describe("trialCompletedSteps", () => {
  it("lists the steps in the format expected by the import", () => {
    expect(trialCompletedSteps({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 2] }, xp: 0 })).toEqual([
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 0 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 2 },
    ]);
  });
});

describe("TrialState multi-chapter", () => {
  it("migrates the legacy shape without loss", () => {
    const legacy = JSON.stringify({ completedSteps: [0, 2], xp: 45 });
    expect(parseTrialState(legacy)).toEqual({
      chapters: { "chapitre-1": [0, 2] },
      xp: 45,
    });
  });

  it("accepts the new shape as is", () => {
    const fresh = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
    expect(parseTrialState(fresh)).toEqual({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
  });

  it("rejects corrupted shapes to the empty state", () => {
    for (const raw of [
      null,
      "",
      "{",
      "[]",
      JSON.stringify({ chapters: "x", xp: 1 }),
      JSON.stringify({ chapters: { c: ["a"] }, xp: 1 }),
    ]) {
      expect(parseTrialState(raw)).toEqual({ chapters: {}, xp: 0 });
    }
  });

  it("ignores out-of-scope chapters on migration as well as on write", () => {
    const smuggled = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-7": [0, 1] },
      xp: 10,
    });
    expect(parseTrialState(smuggled).chapters["chapitre-7"]).toBeUndefined();
    expect(() =>
      applyTrialStep(emptyTrialState(), "chapitre-7", 0, 2)
    ).toThrow();
  });

  it("applyTrialStep credits per chapter and stays idempotent", () => {
    const s1 = applyTrialStep(emptyTrialState(), "chapitre-2", 0, 2);
    expect(s1.alreadyDone).toBe(false);
    expect(s1.state.chapters["chapitre-2"]).toEqual([0]);
    const s2 = applyTrialStep(s1.state, "chapitre-2", 0, 2);
    expect(s2.alreadyDone).toBe(true);
    expect(s2.state.xp).toBe(s1.state.xp);
  });

  it("trialStateToUserState exposes each trial chapter", () => {
    const state = { chapters: { "chapitre-1": [0], "chapitre-3": [1] }, xp: 25 };
    const user = trialStateToUserState(state);
    expect(user.completedSteps["html/chapitre-1"]).toEqual([0]);
    expect(user.completedSteps["html/chapitre-3"]).toEqual([1]);
    expect(user.totalXp).toBe(25);
  });

  it("trialCompletedSteps flattens all chapters", () => {
    const state = { chapters: { "chapitre-1": [0, 1], "chapitre-2": [0] }, xp: 0 };
    expect(trialCompletedSteps(state)).toEqual([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 1 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
  });
});
