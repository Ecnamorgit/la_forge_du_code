import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-10";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 10 — localStorage : écrire, sérialiser, effacer, initialiser.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 10 — etape 1 (ecrire et relire)", () => {
  const validate = validators[0];

  const CODE = `localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));`;

  it("valide un setItem suivi d'un getItem", () => {
    expect(validate(CODE, ctx(["dark"])).ok).toBe(true);
  });

  it("refuse une valeur relue depuis une variable au lieu du stockage", () => {
    // Échec ciblé : la sortie est bonne, rien n'a été relu.
    const code = `const theme = "dark";
localStorage.setItem("theme", theme);
console.log(theme);`;
    expect(validate(code, ctx(["dark"])).ok).toBe(false);
  });

  it("refuse une valeur autre que dark", () => {
    expect(validate(CODE, ctx(["light"])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 2 (serialiser un objet)", () => {
  const validate = validators[1];

  const CODE = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
const relu = JSON.parse(localStorage.getItem("pilote"));
console.log(relu.nom);
console.log(relu.niveau);`;

  it("valide un aller-retour stringify / parse", () => {
    expect(validate(CODE, ctx(["Luna", "8"])).ok).toBe(true);
  });

  it("refuse un objet stocke sans serialisation", () => {
    // Échec ciblé : localStorage ne stocke que des chaînes.
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", pilote);
console.log(pilote.nom);
console.log(pilote.niveau);`;
    expect(validate(code, ctx(["Luna", "8"])).ok).toBe(false);
  });

  it("refuse une relecture sans parse", () => {
    const code = `const pilote = { nom: "Luna", niveau: 8 };
localStorage.setItem("pilote", JSON.stringify(pilote));
console.log(localStorage.getItem("pilote"));`;
    expect(validate(code, ctx(['{"nom":"Luna","niveau":8}'])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 3 (effacer)", () => {
  const validate = validators[2];

  const CODE = `localStorage.removeItem("theme");
console.log(localStorage.getItem("theme"));`;

  it("valide un removeItem dont la relecture donne null", () => {
    expect(validate(CODE, ctx(["null"])).ok).toBe(true);
  });

  it("refuse une valeur vide ecrite a la place d'une suppression", () => {
    // Échec ciblé : écraser n'est pas supprimer.
    const code = `localStorage.setItem("theme", "");
console.log(localStorage.getItem("theme"));`;
    expect(validate(code, ctx([""])).ok).toBe(false);
  });

  it("refuse une suppression dont on ne verifie pas l'effet", () => {
    expect(validate(CODE, ctx([])).ok).toBe(false);
  });
});

describe("JS chapitre 10 — etape 4 (valeur par defaut)", () => {
  const validate = validators[3];

  const CODE = `function loadOrInit() {
  const v = localStorage.getItem("volume");
  return v === null ? 80 : Number(v);
}
console.log(loadOrInit());`;

  it("valide une fonction de repli et marque l'etape finale", () => {
    const r = validate(CODE, ctx(["80"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse une valeur par defaut sans lecture du stockage", () => {
    const code = `function loadOrInit() { return 80; }
console.log(loadOrInit());`;
    expect(validate(code, ctx(["80"])).ok).toBe(false);
  });

  it("refuse un repli sur une autre valeur", () => {
    expect(validate(CODE, ctx(["50"])).ok).toBe(false);
  });
});
