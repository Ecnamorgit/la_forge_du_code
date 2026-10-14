import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";
import type { ValidatorContext } from "@/data/courses/html/types";

const ctx = (
  logs: string[],
  error: string | null = null
): ValidatorContext => ({ logs, error, lastValue: undefined });

describe("JS chapter 1 — step 1 (console.log)", () => {
  const v = validators[0];

  it("passes a console.log printing the exact expected text", () => {
    const r = v('console.log("Bonjour, station Nebula")', ctx(["Bonjour, station Nebula"]));
    expect(r.ok).toBe(true);
  });

  it("fails when there is no console.log", () => {
    expect(v("const x = 1", ctx([])).ok).toBe(false);
  });

  it("reports a runtime error", () => {
    const r = v("console.log(y)", ctx([], "ReferenceError: y is not defined"));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Erreur d'exécution/);
  });

  it("requires the exact text in the console", () => {
    expect(v('console.log("autre chose")', ctx(["autre chose"])).ok).toBe(false);
  });

  it("rejects a missing run context", () => {
    expect(v('console.log("Bonjour, station Nebula")').ok).toBe(false);
  });
});

describe("JS chapter 1 — step 2 (let + logging the variable)", () => {
  const v = validators[1];

  it("passes a let variable that is actually logged", () => {
    expect(v("let n = 5;\nconsole.log(n)", ctx(["5"])).ok).toBe(true);
  });

  it("fails when let is not used", () => {
    expect(v("const n = 5; console.log(n)", ctx(["5"])).ok).toBe(false);
  });
});

describe("JS chapter 1 — step 4 (template literal, final step)", () => {
  const v = validators[3];

  it("passes and marks the step as final", () => {
    const code =
      'const a = "Cadet"; const b = "SELENE"; console.log(`${a} de ${b}`)';
    const r = v(code, ctx(["Cadet de SELENE"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a template literal without enough interpolations", () => {
    expect(v("console.log(`coucou`)", ctx(["coucou"])).ok).toBe(false);
  });
});
