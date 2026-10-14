import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * MongoDB chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("MongoDB — step 2 (filter, projection, limit)", () => {
  const validate = validators[1];

  it("accepts a $gte filter with projection and limit", () => {
    const code = `const r = await db.collection('pilotes')
  .find({ niveau: { $gte: 5 } })
  .project({ _id: 0, nom: 1, niveau: 1 })
  .limit(10)
  .toArray();`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a filter with neither projection nor limit", () => {
    const code = `const r = await db.collection('pilotes').find({ niveau: { $gte: 5 } }).toArray();`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a threshold other than the one requested", () => {
    const code = `const r = await db.collection('pilotes')
  .find({ niveau: { $gte: 3 } })
  .project({ _id: 0, nom: 1 })
  .limit(10)
  .toArray();`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("MongoDB — step 3 (targeted update)", () => {
  const validate = validators[2];

  it("accepts updateOne with $set on two fields", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { niveau: 6, badge: 'gold' } }
);`;
    expect(validate(code).ok).toBe(true);
  });

  it("accepts the two fields in reverse order", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { badge: 'gold', niveau: 6 } }
);`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a $set that touches only one field", () => {
    // Targeted failure: the step explicitly asks for niveau and badge.
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { $set: { niveau: 6 } }
);`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a replacement without $set, which overwrites the document", () => {
    const code = `await db.collection('pilotes').updateOne(
  { nom: 'Lia' },
  { niveau: 6, badge: 'gold' }
);`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("MongoDB — step 4 (aggregation)", () => {
  const validate = validators[3];

  it("accepts a pipeline that groups and counts", () => {
    const code = `const r = await db.collection('pilotes').aggregate([
  { $group: { _id: '$vaisseau.classe', total: { $sum: 1 } } }
]).toArray();`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a pipeline that groups without counting", () => {
    // Targeted failure: the $group is there, the count is missing.
    const code = `const r = await db.collection('pilotes').aggregate([
  { $group: { _id: '$vaisseau.classe' } }
]).toArray();`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a plain find instead of the aggregation", () => {
    const code = `const r = await db.collection('pilotes').find({}).toArray();`;
    expect(validate(code).ok).toBe(false);
  });
});
