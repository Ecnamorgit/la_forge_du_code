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

  // Pins de régression pour les cas adverses envisagés à la revue mais non
  // encore couverts : le comportement est déjà correct aujourd'hui, ces tests
  // ne font que l'épingler.

  it("rejette une charge utile en forme de pollution de prototype", () => {
    // Les champs valides sont glissés sous "__proto__" plutôt qu'en
    // propriétés propres de l'entrée. JSON.parse crée "__proto__" comme une
    // simple clé de données (pas comme le setter de prototype), donc
    // l'entrée n'a réellement aucune propriété propre course/chapter/
    // stepIndex : elle doit être rejetée, et le prototype global ne doit pas
    // être touché.
    const polluted = JSON.parse(
      `{"__proto__": {"course": "${TRIAL_COURSE}", "chapter": "${TRIAL_CHAPTER}", "stepIndex": 0}}`
    );
    expect(filterTrialSteps([polluted])).toEqual([]);
    expect((Object.prototype as Record<string, unknown>).course).toBeUndefined();
  });

  it("rejette un tableau utilisé à la place d'une entrée objet", () => {
    expect(filterTrialSteps([[TRIAL_COURSE, TRIAL_CHAPTER, 0]])).toEqual([]);
  });

  it("rejette stepIndex fourni sous forme de chaîne", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: "0" }])).toEqual([]);
  });

  it("rejette NaN et Infinity comme stepIndex", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: NaN }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: Infinity }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: -Infinity }])).toEqual([]);
  });
});
