import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * MongoDB chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("MongoDB — etape 2 (filtre, projection, limite)", () => {
  const valider = validators[1];

  it("accepte un filtre $gte avec projection et limite", () => {
    const code = `const r = await db.collection('pilotes')
  .find({ niveau: { $gte: 5 } })
  .project({ _id: 0, nom: 1, niveau: 1 })
  .limit(10)
  .toArray();`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un filtre sans projection ni limite", () => {
    const code = `const r = await db.collection('pilotes').find({ niveau: { $gte: 5 } }).toArray();`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un seuil different de celui demande", () => {
    const code = `const r = await db.collection('pilotes')
  .find({ niveau: { $gte: 3 } })
  .project({ _id: 0, nom: 1 })
  .limit(10)
  .toArray();`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("MongoDB — etape 3 (mise a jour ciblee)", () => {
  const valider = validators[2];

  it("accepte updateOne avec $set sur deux champs", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { niveau: 6, badge: 'gold' } }
);`;
    expect(valider(code).ok).toBe(true);
  });

  it("accepte les deux champs dans l'ordre inverse", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { badge: 'gold', niveau: 6 } }
);`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un $set qui ne touche qu'un seul champ", () => {
    // Echec cible : l'etape demande explicitement niveau ET badge.
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { niveau: 6 } }
);`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un remplacement sans $set, qui ecrase le document", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { niveau: 6, badge: 'gold' }
);`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("MongoDB — etape 4 (agregation)", () => {
  const valider = validators[3];

  it("accepte un pipeline qui groupe et compte", () => {
    const code = `const r = await db.collection('pilotes').aggregate([
  { $group: { _id: '$vaisseau.classe', total: { $sum: 1 } } }
]).toArray();`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un pipeline qui groupe sans compter", () => {
    // Echec cible : le $group est la, le comptage manque.
    const code = `const r = await db.collection('pilotes').aggregate([
  { $group: { _id: '$vaisseau.classe' } }
]).toArray();`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un simple find a la place de l'agregation", () => {
    const code = `const r = await db.collection('pilotes').find({}).toArray();`;
    expect(valider(code).ok).toBe(false);
  });
});
