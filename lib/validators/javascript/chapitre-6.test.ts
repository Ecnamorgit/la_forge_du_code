import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 6 — méthodes de tableau : map, filter, reduce, find.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 6 — etape 1 (map)", () => {
  const valider = validators[0];

  const CODE = `const xp = [50, 120, 80, 200, 30];
console.log(xp.map((v) => v * 2));`;

  it("valide un map qui double les valeurs", () => {
    expect(valider(CODE, ctx(["[ 100, 240, 160, 400, 60 ]"])).ok).toBe(true);
  });

  it("refuse une boucle for a la place de map", () => {
    // Échec ciblé : le résultat est identique, la méthode enseignée est absente.
    const code = `const xp = [50, 120, 80, 200, 30];
const doubles = [];
for (let i = 0; i < xp.length; i++) { doubles.push(xp[i] * 2); }
console.log(doubles);`;
    expect(valider(code, ctx(["[ 100, 240, 160, 400, 60 ]"])).ok).toBe(false);
  });

  it("refuse un map qui ne double pas", () => {
    const code = `const xp = [50, 120, 80, 200, 30];
console.log(xp.map((v) => v + 1));`;
    expect(valider(code, ctx(["[ 51, 121, 81, 201, 31 ]"])).ok).toBe(false);
  });
});

describe("JS chapitre 6 — etape 2 (filter)", () => {
  const valider = validators[1];

  const CODE = `const elites = equipage.filter((m) => m.niveau >= 5);
console.log(elites);`;

  it("valide un filtre sur le niveau", () => {
    expect(valider(CODE, ctx(["[ Luna, Mars, Phobos ]"])).ok).toBe(true);
  });

  it("refuse un filtre qui laisse passer un niveau trop bas", () => {
    // Échec ciblé : le seuil est mal posé, Io (niveau 3) reste dans la sortie.
    const code = `const elites = equipage.filter((m) => m.niveau >= 5);
console.log(elites);`;
    expect(valider(code, ctx(["[ Luna, Mars, Phobos, Io ]"])).ok).toBe(false);
  });

  it("refuse une condition sur un autre seuil", () => {
    const code = `const elites = equipage.filter((m) => m.niveau >= 3);
console.log(elites);`;
    expect(valider(code, ctx(["[ Luna, Mars, Phobos ]"])).ok).toBe(false);
  });
});

describe("JS chapitre 6 — etape 3 (reduce)", () => {
  const valider = validators[2];

  const CODE = `const total = cargo.reduce((somme, c) => somme + c.masse, 0);
console.log(total);`;

  it("valide une somme calculee par reduce", () => {
    expect(valider(CODE, ctx(["400"])).ok).toBe(true);
  });

  it("refuse une somme calculee par boucle", () => {
    const code = `let total = 0;
for (const c of cargo) { total += c.masse; }
console.log(total);`;
    expect(valider(code, ctx(["400"])).ok).toBe(false);
  });

  it("refuse un total errone", () => {
    expect(valider(CODE, ctx(["390"])).ok).toBe(false);
  });
});

describe("JS chapitre 6 — etape 4 (find)", () => {
  const valider = validators[3];

  const CODE = `const vaisseau = ships.find((s) => s.statut === "maintenance");
console.log(vaisseau.id);`;

  it("valide un find et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["NEB-02"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un filter la ou un seul element est attendu", () => {
    // Échec ciblé : filter renvoie un tableau, find renvoie l'élément.
    const code = `const vaisseau = ships.filter((s) => s.statut === "maintenance");
console.log(vaisseau[0].id);`;
    expect(valider(code, ctx(["NEB-02"])).ok).toBe(false);
  });

  it("refuse un identifiant different de celui attendu", () => {
    expect(valider(CODE, ctx(["NEB-03"])).ok).toBe(false);
  });
});
