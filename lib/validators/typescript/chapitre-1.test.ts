import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * TypeScript chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("TypeScript — etape 2 (typer une fonction)", () => {
  const valider = validators[1];

  it("accepte des parametres et un retour types", () => {
    const code = `function calculerXp(niveau: number, bonus: number): number {
  return niveau * 100 + bonus;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse des parametres types sans type de retour", () => {
    // Echec cible : l'etape demande les deux.
    const code = `function calculerXp(niveau: number, bonus: number) {
  return niveau * 100 + bonus;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un parametre laisse sans type", () => {
    const code = `function calculerXp(niveau: number, bonus): number {
  return niveau * 100 + bonus;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("TypeScript — etape 3 (interface et constante typee)", () => {
  const valider = validators[2];

  const INTERFACE = `interface Pilote {
  id: number;
  nom: string;
  niveau: number;
  actif: boolean;
}`;

  it("accepte une interface complete et une constante typee", () => {
    const code = `${INTERFACE}
const lia: Pilote = { id: 1, nom: 'Lia', niveau: 5, actif: true };`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une constante non annotee", () => {
    // Echec cible : l'interface existe, la constante ne s'y rattache pas.
    const code = `${INTERFACE}
const lia = { id: 1, nom: 'Lia', niveau: 5, actif: true };`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une interface a laquelle il manque un champ", () => {
    const code = `interface Pilote {
  id: number;
  nom: string;
  niveau: number;
}
const lia: Pilote = { id: 1, nom: 'Lia', niveau: 5 };`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("TypeScript — etape 4 (type union)", () => {
  const valider = validators[3];

  const UNION = `type Statut = 'en_vol' | 'en_base' | 'detruit';`;

  it("accepte une union de trois litteraux et un parametre type", () => {
    const code = `${UNION}
function afficher(statut: Statut) {
  console.log(statut);
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une union amputee d'un litteral", () => {
    const code = `type Statut = 'en_vol' | 'en_base';
function afficher(statut: Statut) {
  console.log(statut);
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un parametre type string au lieu de l'union", () => {
    // Echec cible : c'est le typage du parametre qui donne sa valeur a l'union.
    const code = `${UNION}
function afficher(statut: string) {
  console.log(statut);
}`;
    expect(valider(code).ok).toBe(false);
  });
});
