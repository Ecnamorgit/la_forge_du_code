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
  it("ajoute une étape et attribue l'XP de lib/xp", () => {
    const next = applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], 0, 3);
    expect(next.state.chapters[TRIAL_CHAPTERS[0]]).toEqual([0]);
    expect(next.state.xp).toBe(xpForStep(3));
    expect(next.awardedXp).toBe(xpForStep(3));
    expect(next.alreadyDone).toBe(false);
  });

  it("est idempotent : rejouer une étape n'attribue rien", () => {
    const first = applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], 0, 3);
    const second = applyTrialStep(first.state, TRIAL_CHAPTERS[0], 0, 3);
    expect(second.state.chapters[TRIAL_CHAPTERS[0]]).toEqual([0]);
    expect(second.state.xp).toBe(first.state.xp);
    expect(second.awardedXp).toBe(0);
    expect(second.alreadyDone).toBe(true);
  });

  it("garde les étapes triées", () => {
    let s = emptyTrialState();
    s = applyTrialStep(s, TRIAL_CHAPTERS[0], 2, 1).state;
    s = applyTrialStep(s, TRIAL_CHAPTERS[0], 0, 1).state;
    expect(s.chapters[TRIAL_CHAPTERS[0]]).toEqual([0, 2]);
  });

  it("rejette un index d'étape négatif", () => {
    expect(() => applyTrialStep(emptyTrialState(), TRIAL_CHAPTERS[0], -1, 1)).toThrow();
  });
});

describe("parseTrialState", () => {
  const EMPTY = { chapters: {}, xp: 0 };

  it("retourne l'état par défaut quand rien n'est stocké", () => {
    expect(parseTrialState(null)).toEqual(EMPTY);
    expect(parseTrialState("")).toEqual(EMPTY);
  });

  it("décode un état valide", () => {
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] }, xp: 66 }))
    ).toEqual({
      chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] },
      xp: 66,
    });
  });

  it("retombe sur l'état par défaut si le JSON est corrompu", () => {
    expect(parseTrialState("{ pas du json")).toEqual(EMPTY);
  });

  it("retombe sur l'état par défaut si la forme est invalide", () => {
    expect(parseTrialState(JSON.stringify({ xp: "beaucoup" }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ chapters: "0", xp: 1 }))).toEqual(EMPTY);
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0, "1"] }, xp: 1 }))
    ).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify([1, 2, 3]))).toEqual(EMPTY);
    expect(parseTrialState("null")).toEqual(EMPTY);
  });

  it("ne partage pas la référence du tableau décodé", () => {
    const parsed = parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0] }, xp: 25 }));
    parsed.chapters[TRIAL_CHAPTERS[0]].push(99);
    expect(
      parseTrialState(JSON.stringify({ chapters: { [TRIAL_CHAPTERS[0]]: [0] }, xp: 25 })).chapters[
        TRIAL_CHAPTERS[0]
      ]
    ).toEqual([0]);
  });

  it("ne partage pas l'état entre deux appels sur un chemin par défaut", () => {
    // Mute l'état renvoyé par un premier appel « état par défaut » (JSON
    // corrompu) : un second appel « état par défaut » (raw absent) ne doit
    // jamais voir cette mutation, sans quoi les deux chemins partagent le
    // même littéral d'état vide.
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
  it("projette dans la forme UserState attendue par les composants", () => {
    const user = trialStateToUserState({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 1] }, xp: 80 });
    expect(user.totalXp).toBe(80);
    expect(user.completedSteps[`${TRIAL_COURSE}/${TRIAL_CHAPTERS[0]}`]).toEqual([0, 1]);
    expect(user.username).toBe("Cadet");
  });

  it("ne partage pas la référence `badges` avec le singleton DEFAULT_USER", () => {
    const user = trialStateToUserState(emptyTrialState());
    expect(user.badges).not.toBe(DEFAULT_USER.badges);
    user.badges.push("badge-triche");
    expect(DEFAULT_USER.badges).toEqual([]);
  });
});

describe("trialCompletedSteps", () => {
  it("liste les étapes au format attendu par l'import", () => {
    expect(trialCompletedSteps({ chapters: { [TRIAL_CHAPTERS[0]]: [0, 2] }, xp: 0 })).toEqual([
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 0 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 2 },
    ]);
  });
});

describe("TrialState multi-chapitres", () => {
  it("migre l'ancienne forme sans perte", () => {
    const legacy = JSON.stringify({ completedSteps: [0, 2], xp: 45 });
    expect(parseTrialState(legacy)).toEqual({
      chapters: { "chapitre-1": [0, 2] },
      xp: 45,
    });
  });

  it("accepte la forme neuve telle quelle", () => {
    const fresh = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
    expect(parseTrialState(fresh)).toEqual({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
  });

  it("rejette les formes corrompues vers l'état vide", () => {
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

  it("ignore les chapitres hors périmètre à la migration comme à l'écriture", () => {
    const smuggled = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-7": [0, 1] },
      xp: 10,
    });
    expect(parseTrialState(smuggled).chapters["chapitre-7"]).toBeUndefined();
    expect(() =>
      applyTrialStep(emptyTrialState(), "chapitre-7", 0, 2)
    ).toThrow();
  });

  it("applyTrialStep crédite par chapitre et reste idempotent", () => {
    const s1 = applyTrialStep(emptyTrialState(), "chapitre-2", 0, 2);
    expect(s1.alreadyDone).toBe(false);
    expect(s1.state.chapters["chapitre-2"]).toEqual([0]);
    const s2 = applyTrialStep(s1.state, "chapitre-2", 0, 2);
    expect(s2.alreadyDone).toBe(true);
    expect(s2.state.xp).toBe(s1.state.xp);
  });

  it("trialStateToUserState expose chaque chapitre d'essai", () => {
    const state = { chapters: { "chapitre-1": [0], "chapitre-3": [1] }, xp: 25 };
    const user = trialStateToUserState(state);
    expect(user.completedSteps["html/chapitre-1"]).toEqual([0]);
    expect(user.completedSteps["html/chapitre-3"]).toEqual([1]);
    expect(user.totalXp).toBe(25);
  });

  it("trialCompletedSteps aplatit tous les chapitres", () => {
    const state = { chapters: { "chapitre-1": [0, 1], "chapitre-2": [0] }, xp: 0 };
    expect(trialCompletedSteps(state)).toEqual([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 1 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
  });
});
