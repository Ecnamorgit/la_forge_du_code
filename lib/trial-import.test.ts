import { describe, expect, it } from "vitest";

import { filterTrialCinematics, filterTrialSteps } from "./trial-import";
import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";

const valid = { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex: 0 };

describe("filterTrialSteps", () => {
  it("keeps a step from the trial chapter", () => {
    expect(filterTrialSteps([valid])).toEqual([valid]);
  });

  it("rejects an out-of-scope chapter from the same course", () => {
    expect(
      filterTrialSteps([{ course: TRIAL_COURSE, chapter: "chapitre-4", stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejects another course", () => {
    expect(
      filterTrialSteps([{ course: "javascript", chapter: TRIAL_CHAPTERS[0], stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejects a negative or non-integer index", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: -1 }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: 1.5 }])).toEqual([]);
  });

  it("rejects malformed entries without crashing", () => {
    expect(filterTrialSteps([null, 42, "x", {}, { course: TRIAL_COURSE }])).toEqual([]);
  });

  it("rejects a non-array input", () => {
    expect(filterTrialSteps("pas un tableau")).toEqual([]);
    expect(filterTrialSteps(undefined)).toEqual([]);
  });

  it("deduplicates", () => {
    expect(filterTrialSteps([valid, valid])).toEqual([valid]);
  });

  it("caps the number of accepted steps", () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...valid, stepIndex: i }));
    expect(filterTrialSteps(many).length).toBeLessThanOrEqual(50);
  });

  it("puts the steps back in journey order", () => {
    // The server only grants a step after the previous one (lib/step-order.ts).
    const shuffled = [
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[1], stepIndex: 0 },
      { ...valid, stepIndex: 1 },
      valid,
    ];
    expect(filterTrialSteps(shuffled)).toEqual([
      valid,
      { ...valid, stepIndex: 1 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[1], stepIndex: 0 },
    ]);
  });

  it("keeps only what the allowlist makes reachable", () => {
    const mixed = [valid, { course: "css", chapter: "chapitre-1", stepIndex: 0 }];
    expect(filterTrialSteps(mixed)).toEqual([valid]);
  });

  // Hostile inputs: these tests pin down the expected behavior.

  it("rejects a prototype-pollution-shaped payload", () => {
    // Valid fields slipped under "__proto__": JSON.parse turns it into a plain
    // data key, so the entry has no useful own properties. It must be
    // rejected without touching the global prototype.
    const polluted = JSON.parse(
      `{"__proto__": {"course": "${TRIAL_COURSE}", "chapter": "${TRIAL_CHAPTERS[0]}", "stepIndex": 0}}`
    );
    expect(filterTrialSteps([polluted])).toEqual([]);
    expect((Object.prototype as Record<string, unknown>).course).toBeUndefined();
  });

  it("rejects an array used in place of an object entry", () => {
    expect(filterTrialSteps([[TRIAL_COURSE, TRIAL_CHAPTERS[0], 0]])).toEqual([]);
  });

  it("rejects stepIndex given as a string", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: "0" }])).toEqual([]);
  });

  it("rejects NaN and Infinity as stepIndex", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: NaN }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: Infinity }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: -Infinity }])).toEqual([]);
  });
});

describe("filterTrialSteps multi-chapter", () => {
  it("accepts the three trial chapters", () => {
    const kept = filterTrialSteps([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 1 },
      { course: "html", chapter: "chapitre-3", stepIndex: 2 },
    ]);
    expect(kept).toHaveLength(3);
    expect(kept[1]).toEqual({ course: "html", chapter: "chapitre-2", stepIndex: 1 });
  });

  it("still rejects out-of-scope chapters and per-chapter duplicates", () => {
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
  it("keeps only legitimate trial ids, rebuilt from hard-coded values", () => {
    expect(
      filterTrialCinematics([
        "html:intro",
        "html:chapter:chapitre-2",
        "html:finale",              // never reachable in the trial
        "html:chapter:chapitre-8",  // out of scope
        "css:intro",                // another course
        42,
        { toString: () => "html:intro" },
      ])
    ).toEqual(["html:intro", "html:chapter:chapitre-2"]);
  });

  it("non-array input → empty", () => {
    for (const v of [null, undefined, "html:intro", {}]) {
      expect(filterTrialCinematics(v)).toEqual([]);
    }
  });
});
