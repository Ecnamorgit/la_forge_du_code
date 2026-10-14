import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 4 — arrays and loops.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 4 — step 1 (declare an array)", () => {
  const validate = validators[0];

  const CODE = `const flotte = ["Aigle", "Faucon", "Corbeau"];
console.log(flotte);`;

  it("passes a three-element array printed to the console", () => {
    expect(validate(CODE, ctx(['["Aigle","Faucon","Corbeau"]'])).ok).toBe(true);
  });

  it("rejects a two-element array", () => {
    const code = `const flotte = ["Aigle", "Faucon"];
console.log(flotte);`;
    expect(validate(code, ctx(['["Aigle","Faucon"]'])).ok).toBe(false);
  });

  it("rejects an array declared but never printed", () => {
    // Targeted failure: without output, nothing proves the array exists.
    expect(validate(CODE, ctx([])).ok).toBe(false);
  });

  it("rejects an output that is not an array", () => {
    expect(validate(CODE, ctx(["Aigle, Faucon, Corbeau"])).ok).toBe(false);
  });
});

describe("JS chapter 4 — step 2 (add an element)", () => {
  const validate = validators[1];

  it("passes a push followed by the new length", () => {
    const code = `const flotte = ["Aigle", "Faucon", "Corbeau"];
flotte.push("Vautour");
console.log(flotte.length);`;
    expect(validate(code, ctx(["4"])).ok).toBe(true);
  });

  it("rejects adding by index, without push", () => {
    // Targeted failure: the length is right, but the taught method is missing.
    const code = `const flotte = ["Aigle", "Faucon", "Corbeau"];
flotte[3] = "Vautour";
console.log(flotte.length);`;
    expect(validate(code, ctx(["4"])).ok).toBe(false);
  });

  it("rejects a length other than 4", () => {
    const code = `const flotte = ["Aigle", "Faucon"];
flotte.push("Vautour");
console.log(flotte.length);`;
    expect(validate(code, ctx(["3"])).ok).toBe(false);
  });
});

describe("JS chapter 4 — step 3 (iterate)", () => {
  const validate = validators[2];

  const CODE = `const flotte = ["Aigle", "Faucon", "Corbeau", "Vautour"];
for (let i = 0; i < flotte.length; i++) {
  console.log(flotte[i]);
}`;

  it("passes a loop that produces four lines", () => {
    expect(
      validate(CODE, ctx(["Aigle", "Faucon", "Corbeau", "Vautour"])).ok
    ).toBe(true);
  });

  it("rejects a loop that produces only three lines", () => {
    expect(validate(CODE, ctx(["Aigle", "Faucon", "Corbeau"])).ok).toBe(false);
  });

  it("rejects four console.log calls written by hand, without a loop", () => {
    // Targeted failure: the output is identical, but the loop is missing.
    const code = `console.log("Aigle");
console.log("Faucon");
console.log("Corbeau");
console.log("Vautour");`;
    expect(
      validate(code, ctx(["Aigle", "Faucon", "Corbeau", "Vautour"])).ok
    ).toBe(false);
  });
});

describe("JS chapter 4 — step 4 (accumulate)", () => {
  const validate = validators[3];

  const CODE = `const charges = [200, 210, 220, 230];
let total = 0;
for (let i = 0; i < charges.length; i++) {
  total += charges[i];
}
console.log(total);`;

  it("passes a sum computed in a loop and marks the final step", () => {
    const r = validate(CODE, ctx(["860"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a hard-coded total", () => {
    expect(validate("console.log(860)", ctx(["860"])).ok).toBe(false);
  });

  it("rejects a wrong sum", () => {
    expect(validate(CODE, ctx(["850"])).ok).toBe(false);
  });
});
