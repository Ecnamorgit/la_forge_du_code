import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * TypeScript chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("TypeScript — step 2 (typing a function)", () => {
  const validate = validators[1];

  it("accepts typed parameters and a typed return value", () => {
    const code = `function calculerXp(niveau: number, bonus: number): number {
  return niveau * 100 + bonus;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects typed parameters without a return type", () => {
    // Targeted failure: the step asks for both.
    const code = `function calculerXp(niveau: number, bonus: number) {
  return niveau * 100 + bonus;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a parameter left untyped", () => {
    const code = `function calculerXp(niveau: number, bonus): number {
  return niveau * 100 + bonus;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("TypeScript — step 3 (interface and typed constant)", () => {
  const validate = validators[2];

  const INTERFACE = `interface Pilote {
  id: number;
  nom: string;
  niveau: number;
  actif: boolean;
}`;

  it("accepts a complete interface and a typed constant", () => {
    const code = `${INTERFACE}
const lia: Pilote = { id: 1, nom: 'Lia', niveau: 5, actif: true };`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an unannotated constant", () => {
    // Targeted failure: the interface exists, but the constant is not tied to it.
    const code = `${INTERFACE}
const lia = { id: 1, nom: 'Lia', niveau: 5, actif: true };`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an interface that is missing a field", () => {
    const code = `interface Pilote {
  id: number;
  nom: string;
  niveau: number;
}
const lia: Pilote = { id: 1, nom: 'Lia', niveau: 5 };`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("TypeScript — step 4 (union type)", () => {
  const validate = validators[3];

  const UNION = `type Statut = 'en_vol' | 'en_base' | 'detruit';`;

  it("accepts a union of three literals and a typed parameter", () => {
    const code = `${UNION}
function afficher(statut: Statut) {
  console.log(statut);
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a union missing one literal", () => {
    const code = `type Statut = 'en_vol' | 'en_base';
function afficher(statut: Statut) {
  console.log(statut);
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a parameter typed string instead of the union", () => {
    // Targeted failure: typing the parameter is what gives the union its value.
    const code = `${UNION}
function afficher(statut: string) {
  console.log(statut);
}`;
    expect(validate(code).ok).toBe(false);
  });
});
