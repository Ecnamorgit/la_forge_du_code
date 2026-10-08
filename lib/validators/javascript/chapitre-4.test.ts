import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 4 — tableaux et boucles.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 4 — etape 1 (declarer un tableau)", () => {
  const valider = validators[0];

  const CODE = `const flotte = ["Aigle", "Faucon", "Corbeau"];
console.log(flotte);`;

  it("valide un tableau de trois elements affiche en console", () => {
    expect(valider(CODE, ctx(['["Aigle","Faucon","Corbeau"]'])).ok).toBe(true);
  });

  it("refuse un tableau de deux elements", () => {
    const code = `const flotte = ["Aigle", "Faucon"];
console.log(flotte);`;
    expect(valider(code, ctx(['["Aigle","Faucon"]'])).ok).toBe(false);
  });

  it("refuse un tableau declare mais jamais affiche", () => {
    // Échec ciblé : sans sortie, rien ne prouve que le tableau existe.
    expect(valider(CODE, ctx([])).ok).toBe(false);
  });

  it("refuse une sortie qui n'est pas un tableau", () => {
    expect(valider(CODE, ctx(["Aigle, Faucon, Corbeau"])).ok).toBe(false);
  });
});

describe("JS chapitre 4 — etape 2 (ajouter un element)", () => {
  const valider = validators[1];

  it("valide un push suivi de la nouvelle longueur", () => {
    const code = `const flotte = ["Aigle", "Faucon", "Corbeau"];
flotte.push("Vautour");
console.log(flotte.length);`;
    expect(valider(code, ctx(["4"])).ok).toBe(true);
  });

  it("refuse un ajout par index, sans push", () => {
    // Échec ciblé : la longueur est bonne, la méthode enseignée est absente.
    const code = `const flotte = ["Aigle", "Faucon", "Corbeau"];
flotte[3] = "Vautour";
console.log(flotte.length);`;
    expect(valider(code, ctx(["4"])).ok).toBe(false);
  });

  it("refuse une longueur qui n'est pas 4", () => {
    const code = `const flotte = ["Aigle", "Faucon"];
flotte.push("Vautour");
console.log(flotte.length);`;
    expect(valider(code, ctx(["3"])).ok).toBe(false);
  });
});

describe("JS chapitre 4 — etape 3 (parcourir)", () => {
  const valider = validators[2];

  const CODE = `const flotte = ["Aigle", "Faucon", "Corbeau", "Vautour"];
for (let i = 0; i < flotte.length; i++) {
  console.log(flotte[i]);
}`;

  it("valide une boucle qui produit quatre lignes", () => {
    expect(
      valider(CODE, ctx(["Aigle", "Faucon", "Corbeau", "Vautour"])).ok
    ).toBe(true);
  });

  it("refuse une boucle qui ne produit que trois lignes", () => {
    expect(valider(CODE, ctx(["Aigle", "Faucon", "Corbeau"])).ok).toBe(false);
  });

  it("refuse quatre console.log ecrits a la main, sans boucle", () => {
    // Échec ciblé : la sortie est identique, la boucle manque.
    const code = `console.log("Aigle");
console.log("Faucon");
console.log("Corbeau");
console.log("Vautour");`;
    expect(
      valider(code, ctx(["Aigle", "Faucon", "Corbeau", "Vautour"])).ok
    ).toBe(false);
  });
});

describe("JS chapitre 4 — etape 4 (accumuler)", () => {
  const valider = validators[3];

  const CODE = `const charges = [200, 210, 220, 230];
let total = 0;
for (let i = 0; i < charges.length; i++) {
  total += charges[i];
}
console.log(total);`;

  it("valide une somme calculee en boucle et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["860"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un total ecrit en dur", () => {
    expect(valider("console.log(860)", ctx(["860"])).ok).toBe(false);
  });

  it("refuse une somme erronee", () => {
    expect(valider(CODE, ctx(["850"])).ok).toBe(false);
  });
});
