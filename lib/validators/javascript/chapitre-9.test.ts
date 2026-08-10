import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-9";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 9 — asynchrone : Promise, async/await, try/catch, Promise.all.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 9 — etape 1 (creer une promesse)", () => {
  const valider = validators[0];

  const CODE = `const p = new Promise((resolve) => setTimeout(() => resolve("OK"), 10));
p.then((v) => console.log(v));`;

  it("valide une promesse consommee par then", () => {
    expect(valider(CODE, ctx(["OK"])).ok).toBe(true);
  });

  it("refuse un setTimeout sans promesse", () => {
    // Echec cible : le differe est la, l'objet Promise n'y est pas.
    const code = `setTimeout(() => console.log("OK"), 10);`;
    expect(valider(code, ctx(["OK"])).ok).toBe(false);
  });

  it("refuse une promesse creee mais jamais consommee", () => {
    const code = `const p = new Promise((resolve) => resolve("OK"));
console.log("OK");`;
    expect(valider(code, ctx(["OK"])).ok).toBe(false);
  });
});

describe("JS chapitre 9 — etape 2 (async / await)", () => {
  const valider = validators[1];

  const CODE = `async function lancer() {
  const mission = await Promise.resolve("Mission lunaire");
  console.log(mission);
}
lancer();`;

  it("valide une fonction async qui attend sa valeur", () => {
    expect(valider(CODE, ctx(["Mission lunaire"])).ok).toBe(true);
  });

  it("refuse un then a la place de await", () => {
    // Echec cible : l'etape enseigne await, pas le chainage.
    const code = `Promise.resolve("Mission lunaire").then((m) => console.log(m));`;
    expect(valider(code, ctx(["Mission lunaire"])).ok).toBe(false);
  });

  it("refuse une sortie differente", () => {
    expect(valider(CODE, ctx(["Mission martienne"])).ok).toBe(false);
  });
});

describe("JS chapitre 9 — etape 3 (intercepter une erreur)", () => {
  const valider = validators[2];

  const CODE = `async function lancer() {
  try {
    await Promise.reject(new Error("timeout"));
  } catch (e) {
    console.log("Echec : " + e.message);
  }
}
lancer();`;

  it("valide un try/catch autour d'un await", () => {
    expect(valider(CODE, ctx(["Echec : timeout"])).ok).toBe(true);
  });

  it("refuse un catch de promesse sans try", () => {
    const code = `Promise.reject(new Error("timeout")).catch((e) => console.log(e.message));`;
    expect(valider(code, ctx(["timeout"])).ok).toBe(false);
  });

  it("refuse un try/catch sans await a l'interieur", () => {
    // Echec cible : le bloc existe mais ne protege rien d'asynchrone.
    const code = `try {
  throw new Error("timeout");
} catch (e) {
  console.log(e.message);
}`;
    expect(valider(code, ctx(["timeout"])).ok).toBe(false);
  });
});

describe("JS chapitre 9 — etape 4 (paralleliser)", () => {
  const valider = validators[3];

  const CODE = `async function lancer() {
  const r = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]);
  console.log(r);
}
lancer();`;

  it("valide un Promise.all et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["[ 1, 2, 3 ]"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse trois await successifs, qui ne parallelisent pas", () => {
    const code = `async function lancer() {
  const a = await Promise.resolve(1);
  const b = await Promise.resolve(2);
  const c = await Promise.resolve(3);
  console.log([a, b, c]);
}
lancer();`;
    expect(valider(code, ctx(["[ 1, 2, 3 ]"])).ok).toBe(false);
  });

  it("refuse un resultat incomplet", () => {
    expect(valider(CODE, ctx(["[ 1, 2 ]"])).ok).toBe(false);
  });
});
