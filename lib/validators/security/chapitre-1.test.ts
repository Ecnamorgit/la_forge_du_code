import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Securite chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Securite — etape 2 (requete parametree)", () => {
  const valider = validators[1];

  it("accepte un placeholder et un tableau de parametres", () => {
    const code = `const sql = 'SELECT * FROM pilotes WHERE nom = $1';
const r = await db.query(sql, [nom]);`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une interpolation dans la requete", () => {
    // Echec cible : c'est exactement l'injection que l'etape corrige.
    const code = "const r = await db.query(`SELECT * FROM pilotes WHERE nom = ${nom}`);";
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un placeholder sans passage des parametres", () => {
    const code = `const sql = 'SELECT * FROM pilotes WHERE nom = $1';
const r = await db.query(sql);`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Securite — etape 3 (hachage du mot de passe)", () => {
  const valider = validators[2];

  it("accepte un hash calcule puis stocke", () => {
    const code = `const hash = await bcrypt.hash(password, 10);
await db.utilisateurs.insert({ login, password: hash });`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un hash calcule mais un mot de passe stocke en clair", () => {
    // Echec cible : l'erreur reelle, plus subtile que l'absence de hachage.
    const code = `const hash = await bcrypt.hash(password, 10);
await db.utilisateurs.insert({ login, password });`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un stockage sans hachage", () => {
    const code = `await db.utilisateurs.insert({ login, password });`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Securite — etape 4 (CORS restreint)", () => {
  const valider = validators[3];

  it("accepte une origine explicite", () => {
    const code = `app.use(cors({ origin: 'https://app.codeforge.space', credentials: true }));`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse le joker, qui ouvre l'API a tout le monde", () => {
    const code = `app.use(cors({ origin: '*' }));`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une autre origine que celle demandee", () => {
    const code = `app.use(cors({ origin: 'https://exemple.test' }));`;
    expect(valider(code).ok).toBe(false);
  });
});
