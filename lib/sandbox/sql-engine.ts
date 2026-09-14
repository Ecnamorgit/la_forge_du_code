/**
 * Exécution SQL pure : une base en mémoire neuve, le `seed` de l'étape, le SQL
 * de l'apprenant, puis la requête `verify` qui relit l'état obtenu.
 *
 * Séparée de `run-sql.ts` pour tourner à l'identique dans un Web Worker (le
 * navigateur, cf. `sql.worker.ts`) et directement sous Node (les tests).
 */

import type { SqlJsStatic } from "sql.js";

export interface SqlQueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface SqlRun {
  /** Last result set produced by the student's SQL (null if none, e.g. INSERT). */
  result: SqlQueryResult | null;
  /** Read-back of the DB state via the step's verify query, when configured. */
  verify: SqlQueryResult | null;
  /** Error message if the student's SQL threw, else null. */
  error: string | null;
}

export interface SqlRunOptions {
  /** SQL run before the student's code to set up tables/data for the step. */
  seed?: string;
  /** SQL run after the student's code to inspect the resulting state. */
  verify?: string;
}

function toResult(exec: { columns: string[]; values: unknown[][] }[]): SqlQueryResult | null {
  if (exec.length === 0) return null;
  const last = exec[exec.length - 1];
  return { columns: last.columns, rows: last.values };
}

export function executerSql(SQL: SqlJsStatic, code: string, options: SqlRunOptions = {}): SqlRun {
  const db = new SQL.Database();
  try {
    if (options.seed) db.run(options.seed);

    let result: SqlQueryResult | null = null;
    try {
      result = toResult(db.exec(code));
    } catch (err) {
      return {
        result: null,
        verify: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    let verify: SqlQueryResult | null = null;
    if (options.verify) {
      verify = toResult(db.exec(options.verify)) ?? { columns: [], rows: [] };
    }

    return { result, verify, error: null };
  } finally {
    db.close();
  }
}
