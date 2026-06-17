import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";
import type { ValidatorContext } from "@/data/courses/html/types";

const ctx = (
  logs: string[],
  error: string | null = null
): ValidatorContext => ({ logs, error, lastValue: undefined });

describe("JS chapitre 1 — étape 1 (console.log)", () => {
  const v = validators[0];

  it("valide un console.log affichant le texte exact attendu", () => {
    const r = v('console.log("Bonjour, station Nebula")', ctx(["Bonjour, station Nebula"]));
    expect(r.ok).toBe(true);
  });

  it("échoue en l'absence de console.log", () => {
    expect(v("const x = 1", ctx([])).ok).toBe(false);
  });

  it("remonte une erreur d'exécution", () => {
    const r = v("console.log(y)", ctx([], "ReferenceError: y is not defined"));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Erreur d'execution/);
  });

  it("exige le texte exact dans la console", () => {
    expect(v('console.log("autre chose")', ctx(["autre chose"])).ok).toBe(false);
  });

  it("refuse l'absence de contexte d'exécution", () => {
    expect(v('console.log("Bonjour, station Nebula")').ok).toBe(false);
  });
});

describe("JS chapitre 1 — étape 2 (let + log de la variable)", () => {
  const v = validators[1];

  it("valide une variable let effectivement loguée", () => {
    expect(v("let n = 5;\nconsole.log(n)", ctx(["5"])).ok).toBe(true);
  });

  it("échoue si on n'utilise pas let", () => {
    expect(v("const n = 5; console.log(n)", ctx(["5"])).ok).toBe(false);
  });
});

describe("JS chapitre 1 — étape 4 (template literal, étape finale)", () => {
  const v = validators[3];

  it("valide et marque l'étape comme finale", () => {
    const code =
      'const a = "Cadet"; const b = "SELENE"; console.log(`${a} de ${b}`)';
    const r = v(code, ctx(["Cadet de SELENE"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un template literal sans assez d'interpolations", () => {
    expect(v("console.log(`coucou`)", ctx(["coucou"])).ok).toBe(false);
  });
});
