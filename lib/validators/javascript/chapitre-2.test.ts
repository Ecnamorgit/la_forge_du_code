import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 2 — opérateurs et conditions.
 *
 * Ces validateurs jugent une exécution : on leur fournit les `logs` que le bac
 * à sable aurait produits. Un cas passant doit donc être cohérent, le code
 * soumis comme la sortie qu'il produirait réellement.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 2 — etape 1 (arithmetique)", () => {
  const valider = validators[0];

  it("valide un calcul dont la console affiche 56", () => {
    const code = "const carburant = 80; const conso = 12; console.log(carburant - conso * 2);";
    expect(valider(code, ctx(["56"])).ok).toBe(true);
  });

  it("refuse un 56 ecrit en dur, sans operateur", () => {
    // Échec ciblé : la sortie est bonne, le calcul n'a pas eu lieu.
    expect(valider('console.log("56")', ctx(["56"])).ok).toBe(false);
  });

  it("refuse un calcul dont le resultat n'est pas 56", () => {
    const code = "const carburant = 80; const conso = 12; console.log(carburant - conso);";
    expect(valider(code, ctx(["68"])).ok).toBe(false);
  });

  it("remonte une erreur d'execution", () => {
    const r = valider("console.log(x - 1)", ctx([], "ReferenceError: x is not defined"));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Erreur d'execution/);
  });

  it("refuse l'absence de contexte d'execution", () => {
    expect(valider("console.log(80 - 12 * 2)").ok).toBe(false);
  });
});

describe("JS chapitre 2 — etape 2 (comparaison)", () => {
  const valider = validators[1];

  it("valide une comparaison qui affiche false", () => {
    expect(valider("console.log(10 > 20)", ctx(["false"])).ok).toBe(true);
  });

  it("refuse un false ecrit en dur", () => {
    expect(valider('console.log("false")', ctx(["false"])).ok).toBe(false);
  });

  it("refuse une comparaison qui affiche true", () => {
    // Échec ciblé : l'opérateur est là, le résultat attendu est false.
    expect(valider("console.log(20 > 10)", ctx(["true"])).ok).toBe(false);
  });
});

describe("JS chapitre 2 — etape 3 (if / else)", () => {
  const valider = validators[2];

  const OK = `const niveauBouclier = 25;
if (niveauBouclier < 30) {
  console.log("ALERTE");
} else {
  console.log("OK");
}`;

  it("valide une condition sur niveauBouclier qui declenche l'alerte", () => {
    expect(valider(OK, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("refuse une condition constante qui ignore le bouclier", () => {
    // Échec ciblé : la sortie est bonne mais rien n'a été testé.
    const code = `if (true) { console.log("ALERTE"); } else { console.log("OK"); }`;
    expect(valider(code, ctx(["ALERTE"])).ok).toBe(false);
  });

  it("refuse un if sans branche else", () => {
    const code = `const niveauBouclier = 25;
if (niveauBouclier < 30) { console.log("ALERTE"); }`;
    expect(valider(code, ctx(["ALERTE"])).ok).toBe(false);
  });

  it("refuse une execution qui affiche les deux branches", () => {
    // Échec ciblé : avec un bouclier à 25, seul ALERTE doit sortir.
    expect(valider(OK, ctx(["ALERTE", "OK"])).ok).toBe(false);
  });
});

describe("JS chapitre 2 — etape 4 (else if)", () => {
  const valider = validators[3];

  const OK = `const temperature = 72;
if (temperature > 90) {
  console.log("CRITIQUE");
} else if (temperature > 50) {
  console.log("OK");
} else {
  console.log("FROID");
}`;

  it("valide trois zones et marque l'etape comme finale", () => {
    const r = valider(OK, ctx(["OK"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse deux branches seulement, sans else if", () => {
    const code = `const temperature = 72;
if (temperature > 50) { console.log("OK"); } else { console.log("FROID"); }`;
    expect(valider(code, ctx(["OK"])).ok).toBe(false);
  });

  it("refuse une sortie autre que OK", () => {
    expect(valider(OK, ctx(["CRITIQUE"])).ok).toBe(false);
  });

  it("refuse un else if sans branche else finale", () => {
    const code = `const temperature = 72;
if (temperature > 90) {
  console.log("CRITIQUE");
} else if (temperature > 50) {
  console.log("OK");
}`;
    const r = valider(code, ctx(["OK"]));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/else finale/);
  });

  it("accepte un else final collé à l'accolade", () => {
    const code = OK.replace("} else {", "}else{");
    expect(valider(code, ctx(["OK"])).ok).toBe(true);
  });
});
