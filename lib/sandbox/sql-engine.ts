/**
 * Pure SQL execution: a fresh in-memory database, the step's `seed`, the
 * learner's SQL, then the `verify` query that reads back the resulting state.
 *
 * Kept apart from `run-sql.ts` so it runs identically in a Web Worker (the
 * browser, see `sql.worker.ts`) and directly under Node (the tests).
 */

import type { SqlJsStatic } from "sql.js";

export interface SqlQueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface SqlRun {
  /** Last result set of the learner's SQL (null for an INSERT, for example). */
  result: SqlQueryResult | null;
  /** State read back by the step's `verify` query, if there is one. */
  verify: SqlQueryResult | null;
  /** Error message if the learner's SQL failed, otherwise null. */
  error: string | null;
}

export interface SqlRunOptions {
  /** SQL run before the learner's to set up the step's tables. */
  seed?: string;
  /** SQL run after the learner's to read back the resulting state. */
  verify?: string;
}

function toResult(exec: { columns: string[]; values: unknown[][] }[]): SqlQueryResult | null {
  if (exec.length === 0) return null;
  const last = exec[exec.length - 1];
  return { columns: last.columns, rows: last.values };
}

export function executeSql(SQL: SqlJsStatic, code: string, options: SqlRunOptions = {}): SqlRun {
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
