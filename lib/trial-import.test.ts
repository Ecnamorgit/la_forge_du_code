import { describe, expect, it } from "vitest";

import { filterTrialSteps } from "./trial-import";
import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";

const valid = { course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex: 0 };

describe("filterTrialSteps", () => {
  it("garde une étape du chapitre d'essai", () => {
    expect(filterTrialSteps([valid])).toEqual([valid]);
  });

  it("rejette un autre chapitre du même cursus", () => {
    expect(
      filterTrialSteps([{ course: TRIAL_COURSE, chapter: "chapitre-2", stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejette un autre cursus", () => {
    expect(
      filterTrialSteps([{ course: "javascript", chapter: TRIAL_CHAPTER, stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejette un index négatif ou non entier", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: -1 }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: 1.5 }])).toEqual([]);
  });

  it("rejette les entrées malformées sans planter", () => {
    expect(filterTrialSteps([null, 42, "x", {}, { course: TRIAL_COURSE }])).toEqual([]);
  });

  it("rejette une entrée non tableau", () => {
    expect(filterTrialSteps("pas un tableau")).toEqual([]);
    expect(filterTrialSteps(undefined)).toEqual([]);
  });

  it("déduplique", () => {
    expect(filterTrialSteps([valid, valid])).toEqual([valid]);
  });

  it("borne le nombre d'étapes acceptées", () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...valid, stepIndex: i }));
    expect(filterTrialSteps(many).length).toBeLessThanOrEqual(50);
  });

  it("ne garde que ce qui est atteignable par l'allowlist", () => {
    const mixed = [valid, { course: "css", chapter: "chapitre-1", stepIndex: 0 }];
    expect(filterTrialSteps(mixed)).toEqual([valid]);
  });
});
