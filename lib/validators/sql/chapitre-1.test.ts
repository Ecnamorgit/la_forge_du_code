import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { runSql, _setSqlLocateFile } from "@/lib/sandbox/run-sql";
import { getSqlStepConfig } from "@/lib/sandbox/sql-seeds";
import { validators } from "./chapitre-1";
import type { ValidatorContext } from "@/data/courses/html/types";

beforeAll(() => {
  _setSqlLocateFile((file) =>
    path.join(process.cwd(), "node_modules/sql.js/dist", file)
  );
});

/** Run real SQL for a step, then hand the result to that step's validator. */
async function play(stepIndex: number, code: string) {
  const cfg = getSqlStepConfig("chapitre-1", stepIndex);
  const run = await runSql(code, cfg);
  const ctx: ValidatorContext = {
    logs: [],
    error: null,
    lastValue: undefined,
    sql: { result: run.result, verify: run.verify, error: run.error },
  };
  return validators[stepIndex](code, ctx);
}

// The exact solutions shipped as each step's hint.
const SOLUTIONS = [
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\nINSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
  "SELECT nom, niveau FROM pilotes WHERE niveau >= 5 ORDER BY niveau DESC LIMIT 10;",
  "UPDATE pilotes SET niveau = 10 WHERE id = 1;\nDELETE FROM pilotes WHERE niveau < 3;",
  "SELECT pilotes.nom, vaisseaux.modele FROM pilotes INNER JOIN vaisseaux ON vaisseaux.pilote_id = pilotes.id;",
];

describe("validateurs SQL chapitre-1 (exécution réelle)", () => {
  it("valide chaque étape avec la solution du hint", async () => {
    for (let i = 0; i < SOLUTIONS.length; i++) {
      const res = await play(i, SOLUTIONS[i]);
      expect(res.ok, `étape ${i + 1}`).toBe(true);
    }
  });

  it("rejette un SELECT non trié (étape 2)", async () => {
    const res = await play(1, "SELECT nom, niveau FROM pilotes WHERE niveau >= 5;");
    expect(res.ok).toBe(false);
  });

  it("rejette un DELETE sans WHERE qui vide la table (étape 3)", async () => {
    const res = await play(
      2,
      "UPDATE pilotes SET niveau = 10 WHERE id = 1;\nDELETE FROM pilotes;"
    );
    expect(res.ok).toBe(false);
  });

  it("signale une erreur SQL avec la tonalité syntax", async () => {
    const res = await play(1, "SELECT FROM WHERE;");
    expect(res.ok).toBe(false);
    expect(res.tone).toBe("syntax");
  });
});
