import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-10";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 10 — localStorage : ecrire, serialiser, effacer, initialiser.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 10 — etape 1 (ecrire et relire)", () => {
  const valider = validators[0];

  const CODE = `localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));`;

  it("valide un setItem suivi d'un getItem", () => {
    expect(valider(CODE, ctx(["dark"])).ok).toBe(true);
  });

  it("refuse une valeur relue depuis une variable au lieu du stockage", () => {
    // Echec cible : la sortie est bonne, rien n'a ete relu.
    const code = `const theme = "dark";
localStorage.setItem("theme", theme);
console.log(theme);`;
    expect(valider(code, ctx(["dark"])).ok).toBe(false);
  });

  it("refuse une valeur autre que dark", () => {
    expect(valider(CODE, ctx(["light"])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 2 (serialiser un objet)", () => {
  const valider = validators[1];

  const CODE = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
const relu = JSON.parse(localStorage.getItem("pilote"));
console.log(relu.nom);
console.log(relu.niveau);`;

  it("valide un aller-retour stringify / parse", () => {
    expect(valider(CODE, ctx(["Luna", "8"])).ok).toBe(true);
  });

  it("refuse un objet stocke sans serialisation", () => {
    // Echec cible : localStorage ne stocke que des chaines.
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", pilote);
console.log(pilote.nom);
console.log(pilote.niveau);`;
    expect(valider(code, ctx(["Luna", "8"])).ok).toBe(false);
  });

  it("refuse une relecture sans parse", () => {
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
console.log(localStorage.getItem("pilote"));`;
    expect(valider(code, ctx(['{"nom":"Luna","niveau":8}'])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 3 (effacer)", () => {
  const valider = validators[2];

  const CODE = `localStorage.removeItem("theme");
console.log(localStorage.getItem("theme"));`;

  it("valide un removeItem dont la relecture donne null", () => {
    expect(valider(CODE, ctx(["null"])).ok).toBe(true);
  });

  it("refuse une valeur vide ecrite a la place d'une suppression", () => {
    // Echec cible : ecraser n'est pas supprimer.
    const code = `localStorage.setItem("theme", "");
console.log(localStorage.getItem("theme"));`;
    expect(valider(code, ctx([""])).ok).toBe(false);
  });

  it("refuse une suppression dont on ne verifie pas l'effet", () => {
    expect(valider(CODE, ctx([])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 4 (valeur par defaut)", () => {
  const valider = validators[3];

  const CODE = `function loadOrInit() {
  const v = localStorage.getItem("volume");
  return v === null ? 80 : Number(v);
}
console.log(loadOrInit());`;

  it("valide une fonction de repli et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["80"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse une valeur par defaut sans lecture du stockage", () => {
    const code = `function loadOrInit() { return 80; }
console.log(loadOrInit());`;
    expect(valider(code, ctx(["80"])).ok).toBe(false);
  });

  it("refuse un repli sur une autre valeur", () => {
    expect(valider(CODE, ctx(["50"])).ok).toBe(false);
  });
});
