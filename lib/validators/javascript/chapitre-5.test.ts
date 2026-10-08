import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 5 — objets, propriétés, méthodes de chaîne, this.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 5 — etape 1 (declarer un objet)", () => {
  const valider = validators[0];

  const CODE = `const pilote = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(pilote);`;

  it("valide un objet de trois proprietes affiche en console", () => {
    expect(valider(CODE, ctx(['{ name: "Cadet", level: 5, ship: "NEB-01" }'])).ok).toBe(
      true
    );
  });

  it("refuse un objet de deux proprietes", () => {
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote);`;
    expect(valider(code, ctx(['{ name: "Cadet", level: 5 }'])).ok).toBe(false);
  });

  it("refuse un objet declare mais jamais affiche", () => {
    // Échec ciblé : la déclaration est bonne, la sortie manque.
    expect(valider(CODE, ctx([])).ok).toBe(false);
  });

  it("refuse une variable qui n'est pas nommee pilote", () => {
    const code = `const cadet = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(cadet);`;
    expect(valider(code, ctx(['{ name: "Cadet" }'])).ok).toBe(false);
  });
});

describe("JS chapitre 5 — etape 2 (lire et modifier)", () => {
  const valider = validators[1];

  const CODE = `const pilote = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(pilote.name);
pilote.level = 8;
console.log(pilote);`;

  it("valide une lecture par point suivie d'une affectation", () => {
    expect(valider(CODE, ctx(["Cadet", '{ name: "Cadet", level: 8 }'])).ok).toBe(true);
  });

  it("refuse une lecture par crochets", () => {
    // Échec ciblé : l'étape enseigne la notation point.
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote["name"]);
pilote.level = 8;
console.log(pilote);`;
    expect(valider(code, ctx(["Cadet", "{ level: 8 }"])).ok).toBe(false);
  });

  it("refuse un niveau porte a une autre valeur que 8", () => {
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote.name);
pilote.level = 9;
console.log(pilote);`;
    expect(valider(code, ctx(["Cadet", "{ level: 9 }"])).ok).toBe(false);
  });
});

describe("JS chapitre 5 — etape 3 (methodes de chaine)", () => {
  const valider = validators[2];

  const CODE = `const code = "nebula-7";
console.log(code.toUpperCase());
console.log(code.length);`;

  it("valide toUpperCase et length", () => {
    expect(valider(CODE, ctx(["NEBULA-7", "8"])).ok).toBe(true);
  });

  it("refuse une majuscule ecrite en dur", () => {
    // Échec ciblé : la sortie est bonne, la méthode n'a pas été employée.
    const code = `console.log("NEBULA-7");
console.log("nebula-7".length);`;
    expect(valider(code, ctx(["NEBULA-7", "8"])).ok).toBe(false);
  });

  it("refuse l'absence de la longueur", () => {
    const code = `const code = "nebula-7";
console.log(code.toUpperCase());
console.log(code.length);`;
    expect(valider(code, ctx(["NEBULA-7"])).ok).toBe(false);
  });
});

describe("JS chapitre 5 — etape 4 (methode et this)", () => {
  const valider = validators[3];

  const CODE = `const pilote = {
  name: "Cadet",
  greet() { return "Salut " + this.name; }
};
console.log(pilote.greet());`;

  it("valide une methode qui utilise this et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["Salut Cadet"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse une methode qui ignore this", () => {
    // Échec ciblé : la sortie est bonne, mais le nom est figé.
    const code = `const pilote = {
  name: "Cadet",
  greet() { return "Salut Cadet"; }
};
console.log(pilote.greet());`;
    expect(valider(code, ctx(["Salut Cadet"])).ok).toBe(false);
  });

  it("refuse une fonction externe a l'objet", () => {
    const code = `const pilote = { name: "Cadet" };
function saluer(p) { return "Salut " + p.name; }
console.log(saluer(pilote));`;
    expect(valider(code, ctx(["Salut Cadet"])).ok).toBe(false);
  });
});
