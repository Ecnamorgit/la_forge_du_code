import { describe, it, expect } from "vitest";

import { getValidators } from "./index";
import type { ValidatorContext } from "@/data/courses/html/types";

const ctx = (
  logs: string[] = [],
  error: string | null = null
): ValidatorContext => ({ logs, error, lastValue: undefined });

interface Case {
  /** Course slug. */
  course: string;
  /** Correct submission for step 1. */
  pass: string;
  /** Execution context, for the runtime (JS) validators. */
  passCtx?: ValidatorContext;
}

// One entry per course: a realistic passing case for step 1.
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
    pass:
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1); " +
      "INSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
    // SQL is validated against a real execution: we supply the state read back by the engine.
    passCtx: {
      logs: [],
      error: null,
      lastValue: undefined,
      sql: {
        result: null,
        verify: { columns: ["id", "nom", "niveau"], rows: [[1, "Lia", 5]] },
        error: null,
      },
    },
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

describe("Chapitre-1 validators — coverage per course", () => {
  it("covers the 14 courses", () => {
    expect(CASES).toHaveLength(14);
  });

  describe.each(CASES)("course $course", ({ course, pass, passCtx }) => {
    const validators = getValidators(course, "chapitre-1");

    it("exposes at least one validator wired into the registry", () => {
      expect(validators.length).toBeGreaterThan(0);
      expect(typeof validators[0]).toBe("function");
    });

    it("accepts a correct submission (step 1)", () => {
      expect(validators[0](pass, passCtx).ok).toBe(true);
    });

    it("rejects an empty submission (step 1)", () => {
      expect(validators[0]("", passCtx ? ctx([]) : undefined).ok).toBe(false);
    });
  });
});
