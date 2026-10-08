import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Python chapitre 1 — étapes 2 à 4.
 *
 * L'étape 1 est déjà couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Python — etape 2 (fonction et appel)", () => {
  const valider = validators[1];

  it("accepte une fonction definie, appelee et affichee", () => {
    const code = `def calculer_xp(niveau, bonus):
    return niveau * 100 + bonus

resultat = calculer_xp(5, 20)
print(resultat)`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une signature qui n'est pas celle demandee", () => {
    const code = `def calculer_xp(niveau):
    return niveau * 100

print(calculer_xp(5))`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une fonction definie mais jamais appelee", () => {
    // Échec ciblé : la déclaration contient déjà « calculer_xp( » ; une
    // recherche naïve de ce motif la prendrait pour un appel.
    const code = `def calculer_xp(niveau, bonus):
    return niveau * 100 + bonus

print("rien a signaler")`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Python — etape 3 (liste et enumerate)", () => {
  const valider = validators[2];

  it("accepte une liste parcourue avec enumerate", () => {
    const code = `pilotes = ['Lia', 'Max', 'Eva']
for i, nom in enumerate(pilotes):
    print(i, nom)`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une boucle for classique sans enumerate", () => {
    const code = `pilotes = ['Lia', 'Max', 'Eva']
for nom in pilotes:
    print(nom)`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une liste incomplete", () => {
    const code = `pilotes = ['Lia', 'Max']
for i, nom in enumerate(pilotes):
    print(i, nom)`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Python — etape 4 (dictionnaire)", () => {
  const valider = validators[3];

  it("accepte un dictionnaire lu, enrichi et parcouru", () => {
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
pilote['badge'] = 'gold'
for cle, valeur in pilote.items():
    print(cle, valeur)`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un dictionnaire jamais enrichi d'un badge", () => {
    // Échec ciblé : lecture et itération présentes, ajout de clé absent.
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
for cle, valeur in pilote.items():
    print(cle, valeur)`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une iteration sans .items()", () => {
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
pilote['badge'] = 'gold'
for cle in pilote:
    print(cle)`;
    expect(valider(code).ok).toBe(false);
  });
});
