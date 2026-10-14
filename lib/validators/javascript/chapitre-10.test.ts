import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-10";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 10 — localStorage: write, serialize, clear, initialize.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 10 — step 1 (write and read back)", () => {
  const validate = validators[0];

  const CODE = `localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));`;

  it("passes a setItem followed by a getItem", () => {
    expect(validate(CODE, ctx(["dark"])).ok).toBe(true);
  });

  it("rejects a value read back from a variable instead of storage", () => {
    // Targeted failure: the output is right, but nothing was read back.
    const code = `const theme = "dark";
localStorage.setItem("theme", theme);
console.log(theme);`;
    expect(validate(code, ctx(["dark"])).ok).toBe(false);
  });

  it("rejects a value other than dark", () => {
    expect(validate(CODE, ctx(["light"])).ok).toBe(false);
  });
});

describe("JS chapter 10 — step 2 (serialize an object)", () => {
  const validate = validators[1];

  const CODE = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
const relu = JSON.parse(localStorage.getItem("pilote"));
console.log(relu.nom);
console.log(relu.niveau);`;

  it("passes a stringify / parse round trip", () => {
    expect(validate(CODE, ctx(["Luna", "8"])).ok).toBe(true);
  });

  it("rejects an object stored without serialization", () => {
    // Targeted failure: localStorage only stores strings.
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", pilote);
console.log(pilote.nom);
console.log(pilote.niveau);`;
    expect(validate(code, ctx(["Luna", "8"])).ok).toBe(false);
  });

  it("rejects reading back without parse", () => {
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
console.log(localStorage.getItem("pilote"));`;
    expect(validate(code, ctx(['{"nom":"Luna","niveau":8}'])).ok).toBe(false);
  });
});

describe("JS chapter 10 — step 3 (clear)", () => {
  const validate = validators[2];

  const CODE = `localStorage.removeItem("theme");
console.log(localStorage.getItem("theme"));`;

  it("passes a removeItem whose read-back gives null", () => {
    expect(validate(CODE, ctx(["null"])).ok).toBe(true);
  });

  it("rejects an empty value written instead of a removal", () => {
    // Targeted failure: overwriting is not removing.
    const code = `localStorage.setItem("theme", "");
console.log(localStorage.getItem("theme"));`;
    expect(validate(code, ctx([""])).ok).toBe(false);
  });

  it("rejects a removal whose effect is not checked", () => {
    expect(validate(CODE, ctx([])).ok).toBe(false);
  });
});

describe("JS chapter 10 — step 4 (default value)", () => {
  const validate = validators[3];

  const CODE = `function loadOrInit() {
  const v = localStorage.getItem("volume");
  return v === null ? 80 : Number(v);
}
console.log(loadOrInit());`;

  it("passes a fallback function and marks the final step", () => {
    const r = validate(CODE, ctx(["80"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a default value without reading storage", () => {
    const code = `function loadOrInit() { return 80; }
console.log(loadOrInit());`;
    expect(validate(code, ctx(["80"])).ok).toBe(false);
  });

  it("rejects a fallback to another value", () => {
    expect(validate(CODE, ctx(["50"])).ok).toBe(false);
  });
});
