import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Security chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("Security — step 2 (parameterised query)", () => {
  const validate = validators[1];

  it("accepts a placeholder and a parameter array", () => {
    const code = `const sql = 'SELECT * FROM pilotes WHERE nom = $1';
const r = await db.query(sql, [nom]);`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects interpolation in the query", () => {
    // Targeted failure: this is exactly the injection the step fixes.
    const code = "const r = await db.query(`SELECT * FROM pilotes WHERE nom = ${nom}`);";
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a placeholder without passing the parameters", () => {
    const code = `const sql = 'SELECT * FROM pilotes WHERE nom = $1';
const r = await db.query(sql);`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Security — step 3 (password hashing)", () => {
  const validate = validators[2];

  it("accepts a hash that is computed then stored", () => {
    const code = `const hash = await bcrypt.hash(password, 10);
await db.utilisateurs.insert({ login, password: hash });`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a computed hash when the password is stored in plain text", () => {
    // Targeted failure: the real-world mistake, subtler than not hashing at all.
    const code = `const hash = await bcrypt.hash(password, 10);
await db.utilisateurs.insert({ login, password });`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects storage without hashing", () => {
    const code = `await db.utilisateurs.insert({ login, password });`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Security — step 4 (restricted CORS)", () => {
  const validate = validators[3];

  it("accepts an explicit origin", () => {
    const code = `app.use(cors({ origin: 'https://app.codeforge.space', credentials: true }));`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects the wildcard, which opens the API to everyone", () => {
    const code = `app.use(cors({ origin: '*' }));`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an origin other than the one requested", () => {
    const code = `app.use(cors({ origin: 'https://exemple.test' }));`;
    expect(validate(code).ok).toBe(false);
  });
});
