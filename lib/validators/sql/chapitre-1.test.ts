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

/** Runs a step's SQL, then passes the result to its validator. */
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

// The exact solutions given as the `hint` for each step.
const SOLUTIONS = [
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\nINSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
  "SELECT nom, niveau FROM pilotes WHERE niveau >= 5 ORDER BY niveau DESC LIMIT 10;",
  "UPDATE pilotes SET niveau = 10 WHERE id = 1;\nDELETE FROM pilotes WHERE niveau < 3;",
  "SELECT pilotes.nom, vaisseaux.modele FROM pilotes INNER JOIN vaisseaux ON vaisseaux.pilote_id = pilotes.id;",
];

describe("SQL chapitre-1 validators (real execution)", () => {
  it("accepts each step with the hint's solution", async () => {
    for (let i = 0; i < SOLUTIONS.length; i++) {
      const res = await play(i, SOLUTIONS[i]);
      expect(res.ok, `step ${i + 1}`).toBe(true);
    }
  });

  it("rejects an unsorted SELECT (step 2)", async () => {
    const res = await play(1, "SELECT nom, niveau FROM pilotes WHERE niveau >= 5;");
    expect(res.ok).toBe(false);
  });

  it("rejects a DELETE without WHERE that empties the table (step 3)", async () => {
    const res = await play(
      2,
      "UPDATE pilotes SET niveau = 10 WHERE id = 1;\nDELETE FROM pilotes;"
    );
    expect(res.ok).toBe(false);
  });

  it("reports a SQL error with the syntax tone", async () => {
    const res = await play(1, "SELECT FROM WHERE;");
    expect(res.ok).toBe(false);
    expect(res.tone).toBe("syntax");
  });
});
