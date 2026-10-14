import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 3 — functions: declaration, parameters, arrow, thresholds.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 3 — step 1 (first function)", () => {
  const validate = validators[0];

  it("passes a greet function that returns a message", () => {
    const code = `function greet(nom) { return "Bonjour, " + nom; }
console.log(greet("Cadet"));`;
    expect(validate(code, ctx(["Bonjour, Cadet"])).ok).toBe(true);
  });

  it("accepts the const greet = () => ... form", () => {
    const code = `const greet = (nom) => { return "Bonjour, " + nom; };
console.log(greet("Cadet"));`;
    expect(validate(code, ctx(["Bonjour, Cadet"])).ok).toBe(true);
  });

  it("rejects a function that prints instead of returning", () => {
    // Targeted failure: the step teaches return, not an inner console.log.
    const code = `function greet(nom) { console.log("Bonjour, " + nom); }
greet("Cadet");`;
    expect(validate(code, ctx(["Bonjour, Cadet"])).ok).toBe(false);
  });

  it("rejects a message that does not mention Cadet", () => {
    const code = `function greet(nom) { return "Bonjour, " + nom; }
console.log(greet("Pilote"));`;
    expect(validate(code, ctx(["Bonjour, Pilote"])).ok).toBe(false);
  });
});

describe("JS chapter 3 — step 2 (two parameters)", () => {
  const validate = validators[1];

  const OK = `function addXp(base, bonus) { return base + bonus; }
console.log(addXp(120, 50));`;

  it("passes an addition that is returned and printed", () => {
    expect(validate(OK, ctx(["170"])).ok).toBe(true);
  });

  it("accepts a concise arrow, whose return is implicit", () => {
    const code = `const addXp = (base, bonus) => base + bonus;
console.log(addXp(120, 50));`;
    expect(validate(code, ctx(["170"])).ok).toBe(true);
  });

  it("rejects a function that logs instead of returning", () => {
    // Targeted failure: the output is correct, but the function returns nothing.
    const code = `function addXp(base, bonus) { console.log(base + bonus); }
addXp(120, 50);`;
    expect(validate(code, ctx(["170"])).ok).toBe(false);
  });

  it("rejects a call with values other than 120 and 50", () => {
    const code = `function addXp(base, bonus) { return base + bonus; }
console.log(addXp(100, 70));`;
    expect(validate(code, ctx(["170"])).ok).toBe(false);
  });

  it("rejects a function with a single parameter", () => {
    const code = `function addXp(base) { return base + 50; }
console.log(addXp(120, 50));`;
    expect(validate(code, ctx(["170"])).ok).toBe(false);
  });
});

describe("JS chapter 3 — step 3 (arrow function)", () => {
  const validate = validators[2];

  it("passes an arrow called with 7", () => {
    const code = `const double = (n) => n * 2;
console.log(double(7));`;
    expect(validate(code, ctx(["14"])).ok).toBe(true);
  });

  it("rejects a classic function where the arrow is taught", () => {
    const code = `function double(n) { return n * 2; }
console.log(double(7));`;
    expect(validate(code, ctx(["14"])).ok).toBe(false);
  });

  it("rejects a call with another value", () => {
    // Targeted failure: the arrow is correct, the requested call is not.
    const code = `const double = (n) => n * 2;
console.log(double(5));`;
    expect(validate(code, ctx(["10"])).ok).toBe(false);
  });
});

describe("JS chapter 3 — step 4 (progressive thresholds)", () => {
  const validate = validators[3];

  const OK = `function status(level) {
  if (level < 5) return "Cadet";
  if (level < 10) return "Pilote";
  return "Capitaine";
}
console.log(status(7));`;

  it("passes three ranks and marks the step as final", () => {
    const r = validate(OK, ctx(["Pilote"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a rank returned without a condition", () => {
    // Targeted failure: the output is right but the parameter is ignored.
    const code = `function status(level) { return "Pilote"; }
console.log(status(7));`;
    expect(validate(code, ctx(["Pilote"])).ok).toBe(false);
  });

  it("rejects reversed comparisons", () => {
    const code = `function status(level) {
  if (5 > level) return "Cadet";
  if (10 > level) return "Pilote";
  return "Capitaine";
}
console.log(status(7));`;
    expect(validate(code, ctx(["Pilote"])).ok).toBe(false);
  });

  it("rejects a function missing a rank", () => {
    const code = `function status(level) {
  if (level < 5) return "Cadet";
  if (level < 10) return "Pilote";
  return "Pilote";
}
console.log(status(7));`;
    expect(validate(code, ctx(["Pilote"])).ok).toBe(false);
  });
});
