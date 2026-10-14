import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 6 — array methods: map, filter, reduce, find.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 6 — step 1 (map)", () => {
  const validate = validators[0];

  const CODE = `const xp = [50, 120, 80, 200, 30];
console.log(xp.map((v) => v * 2));`;

  it("passes a map that doubles the values", () => {
    expect(validate(CODE, ctx(["[ 100, 240, 160, 400, 60 ]"])).ok).toBe(true);
  });

  it("rejects a for loop instead of map", () => {
    // Targeted failure: the result is identical, but the taught method is missing.
    const code = `const xp = [50, 120, 80, 200, 30];
const doubles = [];
for (let i = 0; i < xp.length; i++) { doubles.push(xp[i] * 2); }
console.log(doubles);`;
    expect(validate(code, ctx(["[ 100, 240, 160, 400, 60 ]"])).ok).toBe(false);
  });

  it("rejects a map that does not double", () => {
    const code = `const xp = [50, 120, 80, 200, 30];
console.log(xp.map((v) => v + 1));`;
    expect(validate(code, ctx(["[ 51, 121, 81, 201, 31 ]"])).ok).toBe(false);
  });
});

describe("JS chapter 6 — step 2 (filter)", () => {
  const validate = validators[1];

  const CODE = `const elites = equipage.filter((m) => m.niveau >= 5);
console.log(elites);`;

  it("passes a filter on the level", () => {
    expect(validate(CODE, ctx(["[ Luna, Mars, Phobos ]"])).ok).toBe(true);
  });

  it("rejects a filter that lets a too-low level through", () => {
    // Targeted failure: the threshold is wrong, Io (level 3) stays in the output.
    const code = `const elites = equipage.filter((m) => m.niveau >= 5);
console.log(elites);`;
    expect(validate(code, ctx(["[ Luna, Mars, Phobos, Io ]"])).ok).toBe(false);
  });

  it("rejects a condition on another threshold", () => {
    const code = `const elites = equipage.filter((m) => m.niveau >= 3);
console.log(elites);`;
    expect(validate(code, ctx(["[ Luna, Mars, Phobos ]"])).ok).toBe(false);
  });
});

describe("JS chapter 6 — step 3 (reduce)", () => {
  const validate = validators[2];

  const CODE = `const total = cargo.reduce((somme, c) => somme + c.masse, 0);
console.log(total);`;

  it("passes a sum computed with reduce", () => {
    expect(validate(CODE, ctx(["400"])).ok).toBe(true);
  });

  it("rejects a sum computed with a loop", () => {
    const code = `let total = 0;
for (const c of cargo) { total += c.masse; }
console.log(total);`;
    expect(validate(code, ctx(["400"])).ok).toBe(false);
  });

  it("rejects a wrong total", () => {
    expect(validate(CODE, ctx(["390"])).ok).toBe(false);
  });
});

describe("JS chapter 6 — step 4 (find)", () => {
  const validate = validators[3];

  const CODE = `const vaisseau = ships.find((s) => s.statut === "maintenance");
console.log(vaisseau.id);`;

  it("passes a find and marks the final step", () => {
    const r = validate(CODE, ctx(["NEB-02"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a filter where a single element is expected", () => {
    // Targeted failure: filter returns an array, find returns the element.
    const code = `const vaisseau = ships.filter((s) => s.statut === "maintenance");
console.log(vaisseau[0].id);`;
    expect(validate(code, ctx(["NEB-02"])).ok).toBe(false);
  });

  it("rejects an id other than the expected one", () => {
    expect(validate(CODE, ctx(["NEB-03"])).ok).toBe(false);
  });
});
