/**
 * Real SQL execution for the SQL cursus, powered by sql.js (SQLite compiled to
 * WebAssembly). Runs entirely client-side — no server, no network — and the
 * .wasm is self-hosted under /public/sql (consistent with the CSP decision to
 * avoid CDNs).
 *
 * Each run is stateless: a fresh in-memory database is created, an optional
 * per-step `seed` is applied, the student's SQL is executed, and an optional
 * `verify` query reads back the resulting state (used to validate INSERT /
 * UPDATE / DELETE steps that produce no visible result set).
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

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

// Where to fetch the wasm. Browser: self-hosted under /sql. Overridable so Node
// tests can point at the file inside node_modules.
let locateFile = (file: string): string => `/sql/${file}`;
let sqlPromise: Promise<SqlJsStatic> | null = null;

/** Test hook: override wasm resolution (and reset the cached engine). */
export function _setSqlLocateFile(fn: (file: string) => string): void {
  locateFile = fn;
  sqlPromise = null;
}

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile });
  }
  return sqlPromise;
}

function toResult(
  exec: { columns: string[]; values: unknown[][] }[]
): SqlQueryResult | null {
  if (exec.length === 0) return null;
  const last = exec[exec.length - 1];
  return { columns: last.columns, rows: last.values };
}

export async function runSql(
  code: string,
  options: SqlRunOptions = {}
): Promise<SqlRun> {
  const SQL = await getSql();
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
