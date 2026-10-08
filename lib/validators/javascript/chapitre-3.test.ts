import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 3 — fonctions : déclaration, paramètres, arrow, seuils.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 3 — etape 1 (premiere fonction)", () => {
  const valider = validators[0];

  it("valide une fonction greet qui retourne un message", () => {
    const code = `function greet(nom) { return "Bonjour, " + nom; }
console.log(greet("Cadet"));`;
    expect(valider(code, ctx(["Bonjour, Cadet"])).ok).toBe(true);
  });

  it("accepte la forme const greet = () => ...", () => {
    const code = `const greet = (nom) => { return "Bonjour, " + nom; };
console.log(greet("Cadet"));`;
    expect(valider(code, ctx(["Bonjour, Cadet"])).ok).toBe(true);
  });

  it("refuse une fonction qui affiche au lieu de retourner", () => {
    // Échec ciblé : l'étape enseigne le return, pas le console.log interne.
    const code = `function greet(nom) { console.log("Bonjour, " + nom); }
greet("Cadet");`;
    expect(valider(code, ctx(["Bonjour, Cadet"])).ok).toBe(false);
  });

  it("refuse un message qui ne mentionne pas Cadet", () => {
    const code = `function greet(nom) { return "Bonjour, " + nom; }
console.log(greet("Pilote"));`;
    expect(valider(code, ctx(["Bonjour, Pilote"])).ok).toBe(false);
  });
});

describe("JS chapitre 3 — etape 2 (deux parametres)", () => {
  const valider = validators[1];

  const OK = `function addXp(base, bonus) { return base + bonus; }
console.log(addXp(120, 50));`;

  it("valide une addition retournee et affichee", () => {
    expect(valider(OK, ctx(["170"])).ok).toBe(true);
  });

  it("accepte une arrow concise, dont le return est implicite", () => {
    const code = `const addXp = (base, bonus) => base + bonus;
console.log(addXp(120, 50));`;
    expect(valider(code, ctx(["170"])).ok).toBe(true);
  });

  it("refuse une fonction qui logue au lieu de retourner", () => {
    // Échec ciblé : la sortie est correcte, mais la fonction ne renvoie rien.
    const code = `function addXp(base, bonus) { console.log(base + bonus); }
addXp(120, 50);`;
    expect(valider(code, ctx(["170"])).ok).toBe(false);
  });

  it("refuse un appel avec d'autres valeurs que 120 et 50", () => {
    const code = `function addXp(base, bonus) { return base + bonus; }
console.log(addXp(100, 70));`;
    expect(valider(code, ctx(["170"])).ok).toBe(false);
  });

  it("refuse une fonction a un seul parametre", () => {
    const code = `function addXp(base) { return base + 50; }
console.log(addXp(120, 50));`;
    expect(valider(code, ctx(["170"])).ok).toBe(false);
  });
});

describe("JS chapitre 3 — etape 3 (arrow function)", () => {
  const valider = validators[2];

  it("valide une arrow appelee avec 7", () => {
    const code = `const double = (n) => n * 2;
console.log(double(7));`;
    expect(valider(code, ctx(["14"])).ok).toBe(true);
  });

  it("refuse une fonction classique la ou l'arrow est enseignee", () => {
    const code = `function double(n) { return n * 2; }
console.log(double(7));`;
    expect(valider(code, ctx(["14"])).ok).toBe(false);
  });

  it("refuse un appel avec une autre valeur", () => {
    // Échec ciblé : l'arrow est correcte, l'appel demandé ne l'est pas.
    const code = `const double = (n) => n * 2;
console.log(double(5));`;
    expect(valider(code, ctx(["10"])).ok).toBe(false);
  });
});

describe("JS chapitre 3 — etape 4 (seuils progressifs)", () => {
  const valider = validators[3];

  const OK = `function status(level) {
  if (level < 5) return "Cadet";
  if (level < 10) return "Pilote";
  return "Capitaine";
}
console.log(status(7));`;

  it("valide trois rangs et marque l'etape comme finale", () => {
    const r = valider(OK, ctx(["Pilote"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un rang retourne sans condition", () => {
    // Échec ciblé : la sortie est bonne mais le paramètre est ignoré.
    const code = `function status(level) { return "Pilote"; }
console.log(status(7));`;
    expect(valider(code, ctx(["Pilote"])).ok).toBe(false);
  });

  it("refuse des comparaisons inversees", () => {
    const code = `function status(level) {
  if (5 > level) return "Cadet";
  if (10 > level) return "Pilote";
  return "Capitaine";
}
console.log(status(7));`;
    expect(valider(code, ctx(["Pilote"])).ok).toBe(false);
  });

  it("refuse une fonction a laquelle il manque un rang", () => {
    const code = `function status(level) {
  if (level < 5) return "Cadet";
  if (level < 10) return "Pilote";
  return "Pilote";
}
console.log(status(7));`;
    expect(valider(code, ctx(["Pilote"])).ok).toBe(false);
  });
});
