import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-9";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 9 — async: Promise, async/await, try/catch, Promise.all.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 9 — step 1 (create a promise)", () => {
  const validate = validators[0];

  const CODE = `const p = new Promise((resolve) => setTimeout(() => resolve("OK"), 10));
p.then((v) => console.log(v));`;

  it("passes a promise consumed with then", () => {
    expect(validate(CODE, ctx(["OK"])).ok).toBe(true);
  });

  it("rejects a setTimeout without a promise", () => {
    // Targeted failure: the delay is there, but the Promise object is not.
    const code = `setTimeout(() => console.log("OK"), 10);`;
    expect(validate(code, ctx(["OK"])).ok).toBe(false);
  });

  it("rejects a promise created but never consumed", () => {
    const code = `const p = new Promise((resolve) => resolve("OK"));
console.log("OK");`;
    expect(validate(code, ctx(["OK"])).ok).toBe(false);
  });
});

describe("JS chapter 9 — step 2 (async / await)", () => {
  const validate = validators[1];

  const CODE = `async function lancer() {
  const mission = await Promise.resolve("Mission lunaire");
  console.log(mission);
}
lancer();`;

  it("passes an async function that awaits its value", () => {
    expect(validate(CODE, ctx(["Mission lunaire"])).ok).toBe(true);
  });

  it("rejects a then instead of await", () => {
    // Targeted failure: the step teaches await, not chaining.
    const code = `Promise.resolve("Mission lunaire").then((m) => console.log(m));`;
    expect(validate(code, ctx(["Mission lunaire"])).ok).toBe(false);
  });

  it("rejects a different output", () => {
    expect(validate(CODE, ctx(["Mission martienne"])).ok).toBe(false);
  });
});

describe("JS chapter 9 — step 3 (catch an error)", () => {
  const validate = validators[2];

  const CODE = `async function lancer() {
  try {
    await Promise.reject(new Error("timeout"));
  } catch (e) {
    console.log("Echec : " + e.message);
  }
}
lancer();`;

  it("passes a try/catch around an await", () => {
    expect(validate(CODE, ctx(["Echec : timeout"])).ok).toBe(true);
  });

  it("rejects a promise catch without try", () => {
    const code = `Promise.reject(new Error("timeout")).catch((e) => console.log(e.message));`;
    expect(validate(code, ctx(["timeout"])).ok).toBe(false);
  });

  it("rejects a try/catch without an await inside", () => {
    // Targeted failure: the block exists but protects nothing asynchronous.
    const code = `try {
  throw new Error("timeout");
} catch (e) {
  console.log(e.message);
}`;
    expect(validate(code, ctx(["timeout"])).ok).toBe(false);
  });
});

describe("JS chapter 9 — step 4 (parallelize)", () => {
  const validate = validators[3];

  const CODE = `async function lancer() {
  const r = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]);
  console.log(r);
}
lancer();`;

  it("passes a Promise.all and marks the final step", () => {
    const r = validate(CODE, ctx(["[ 1, 2, 3 ]"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects three successive awaits, which do not parallelize", () => {
    const code = `async function lancer() {
  const a = await Promise.resolve(1);
  const b = await Promise.resolve(2);
  const c = await Promise.resolve(3);
  console.log([a, b, c]);
}
lancer();`;
    expect(validate(code, ctx(["[ 1, 2, 3 ]"])).ok).toBe(false);
  });

  it("rejects an incomplete result", () => {
    expect(validate(CODE, ctx(["[ 1, 2 ]"])).ok).toBe(false);
  });
});
