import { describe, it, expect } from "vitest";

import { getValidators } from "./index";
import type { ValidatorContext } from "@/data/courses/html/types";

const ctx = (
  logs: string[] = [],
  error: string | null = null
): ValidatorContext => ({ logs, error, lastValue: undefined });

interface Case {
  /** Slug du cursus. */
  course: string;
  /** Soumission correcte pour l'étape 1. */
  pass: string;
  /** Contexte d'exécution, pour les validateurs runtime (JS). */
  passCtx?: ValidatorContext;
}

// Une entrée par cursus : un cas passant réaliste pour l'étape 1.
const CASES: Case[] = [
  { course: "html", pass: "<!DOCTYPE html><html></html>" },
  { course: "css", pass: "<head><style></style></head>" },
  {
    course: "javascript",
    pass: 'console.log("Bonjour, station Nebula")',
    passCtx: ctx(["Bonjour, station Nebula"]),
  },
  { course: "react", pass: "function Radar(){ return <div>Scan en cours</div>; }" },
  {
    course: "typescript",
    pass: "let pilote: string = 'a'; let niveau: number = 1; let actif: boolean = true;",
  },
  { course: "git", pass: 'git init\ngit add .\ngit commit -m "init"' },
  {
    course: "sql",
    pass: "CREATE TABLE pilotes (id INT PRIMARY KEY, nom TEXT NOT NULL); INSERT INTO pilotes VALUES (1, 'Lia');",
  },
  {
    course: "nodejs",
    pass: "const express = require('express'); const app = express(); app.listen(3000, () => {});",
  },
  {
    course: "tests",
    pass: "describe('x', () => { it('y', () => { expect(additionner(2, 3)).toBe(5); }); });",
  },
  { course: "devops", pass: "npm run build\nnpm run preview" },
  {
    course: "mongodb",
    pass: "await db.collection('pilotes').insertOne({ vaisseau: { nom: 'X', classe: 'Y' } });",
  },
  { course: "security", pass: "el.textContent = userInput;" },
  {
    course: "python",
    pass: "nom = 'Lia'\nniveau = 5\nactif = True\nprint(f\"Pilote {nom}\")",
  },
  { course: "algo", pass: "// O(1), O(n), O(n^2)" },
];

describe("Validateurs chapitre-1 — couverture par cursus", () => {
  it("couvre les 14 cursus", () => {
    expect(CASES).toHaveLength(14);
  });

  describe.each(CASES)("cursus $course", ({ course, pass, passCtx }) => {
    const validators = getValidators(course, "chapitre-1");

    it("expose au moins un validateur câblé dans le registre", () => {
      expect(validators.length).toBeGreaterThan(0);
      expect(typeof validators[0]).toBe("function");
    });

    it("valide une soumission correcte (étape 1)", () => {
      expect(validators[0](pass, passCtx).ok).toBe(true);
    });

    it("rejette une soumission vide (étape 1)", () => {
      expect(validators[0]("", passCtx ? ctx([]) : undefined).ok).toBe(false);
    });
  });
});
