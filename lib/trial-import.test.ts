import { describe, expect, it } from "vitest";

import { filterTrialCinematics, filterTrialSteps } from "./trial-import";
import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";

const valid = { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 0 };

describe("filterTrialSteps", () => {
  it("garde une étape du chapitre d'essai", () => {
    expect(filterTrialSteps([valid])).toEqual([valid]);
  });

  it("rejette un chapitre hors périmètre du même cursus", () => {
    expect(
      filterTrialSteps([{ course: TRIAL_COURSE, chapter: "chapitre-4", stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejette un autre cursus", () => {
    expect(
      filterTrialSteps([{ course: "javascript", chapter: TRIAL_CHAPTERS[0], stepIndex: 0 }])
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

  it("remet les étapes dans l'ordre du parcours", () => {
    // Le serveur n'accorde une étape qu'après la précédente (lib/step-order.ts).
    const desordre = [
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[1], stepIndex: 0 },
      { ...valid, stepIndex: 1 },
      valid,
    ];
    expect(filterTrialSteps(desordre)).toEqual([
      valid,
      { ...valid, stepIndex: 1 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[1], stepIndex: 0 },
    ]);
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
      `{"__proto__": {"course": "${TRIAL_COURSE}", "chapter": "${TRIAL_CHAPTERS[0]}", "stepIndex": 0}}`
    );
    expect(filterTrialSteps([polluted])).toEqual([]);
    expect((Object.prototype as Record<string, unknown>).course).toBeUndefined();
  });

  it("rejette un tableau utilisé à la place d'une entrée objet", () => {
    expect(filterTrialSteps([[TRIAL_COURSE, TRIAL_CHAPTERS[0], 0]])).toEqual([]);
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

describe("filterTrialSteps multi-chapitres", () => {
  it("accepte les trois chapitres d'essai", () => {
    const kept = filterTrialSteps([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 1 },
      { course: "html", chapter: "chapitre-3", stepIndex: 2 },
    ]);
    expect(kept).toHaveLength(3);
    expect(kept[1]).toEqual({ course: "html", chapter: "chapitre-2", stepIndex: 1 });
  });

  it("rejette toujours les chapitres hors périmètre et les doublons par chapitre", () => {
    const kept = filterTrialSteps([
      { course: "html", chapter: "chapitre-4", stepIndex: 0 },
      { course: "css", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
    expect(kept).toEqual([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
  });
});

describe("filterTrialCinematics", () => {
  it("ne retient que les ids d'essai légitimes, reconstruits en dur", () => {
    expect(
      filterTrialCinematics([
        "html:intro",
        "html:chapter:chapitre-2",
        "html:finale",              // jamais accessible en essai
        "html:chapter:chapitre-8",  // hors périmètre
        "css:intro",                // autre cursus
        42,
        { toString: () => "html:intro" },
      ])
    ).toEqual(["html:intro", "html:chapter:chapitre-2"]);
  });

  it("entrée non-tableau → vide", () => {
    for (const v of [null, undefined, "html:intro", {}]) {
      expect(filterTrialCinematics(v)).toEqual([]);
    }
  });
});
