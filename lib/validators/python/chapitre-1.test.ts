import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Python chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("Python — step 2 (function and call)", () => {
  const validate = validators[1];

  it("accepts a function that is defined, called and printed", () => {
    const code = `def calculer_xp(niveau, bonus):
    return niveau * 100 + bonus

resultat = calculer_xp(5, 20)
print(resultat)`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a signature other than the one requested", () => {
    const code = `def calculer_xp(niveau):
    return niveau * 100

print(calculer_xp(5))`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a function that is defined but never called", () => {
    // Targeted failure: the declaration already contains "calculer_xp("; a
    // naive search for that pattern would mistake it for a call.
    const code = `def calculer_xp(niveau, bonus):
    return niveau * 100 + bonus

print("rien a signaler")`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Python — step 3 (list and enumerate)", () => {
  const validate = validators[2];

  it("accepts a list iterated with enumerate", () => {
    const code = `pilotes = ['Lia', 'Max', 'Eva']
for i, nom in enumerate(pilotes):
    print(i, nom)`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a plain for loop without enumerate", () => {
    const code = `pilotes = ['Lia', 'Max', 'Eva']
for nom in pilotes:
    print(nom)`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an incomplete list", () => {
    const code = `pilotes = ['Lia', 'Max']
for i, nom in enumerate(pilotes):
    print(i, nom)`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Python — step 4 (dictionary)", () => {
  const validate = validators[3];

  it("accepts a dictionary that is read, extended and iterated", () => {
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
pilote['badge'] = 'gold'
for cle, valeur in pilote.items():
    print(cle, valeur)`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a dictionary never given a badge", () => {
    // Targeted failure: reading and iteration are present, adding the key is missing.
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
for cle, valeur in pilote.items():
    print(cle, valeur)`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an iteration without .items()", () => {
    const code = `pilote = {'nom': 'Lia', 'niveau': 5}
print(pilote['niveau'])
pilote['badge'] = 'gold'
for cle in pilote:
    print(cle)`;
    expect(validate(code).ok).toBe(false);
  });
});
