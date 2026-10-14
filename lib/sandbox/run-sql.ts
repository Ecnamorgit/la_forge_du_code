/**
 * Runs the SQL curriculum's queries with sql.js (SQLite compiled to
 * WebAssembly), entirely client-side. The `.wasm` is served from `/sql`, with no CDN.
 *
 * In the browser, the query runs in a Web Worker that the page terminates
 * past the timeout: a never-ending query does not freeze the tab (audit EXE-02).
 * Under Node (the tests), it runs directly.
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

import { executeSql, type SqlRun, type SqlRunOptions } from "./sql-engine";

export type { SqlQueryResult, SqlRun, SqlRunOptions } from "./sql-engine";

/** Timeout beyond which a query is interrupted (engine loading included). */
export const SQL_TIMEOUT_MS = 5000;

export const SQL_INTERRUPTED_MESSAGE =
  `Exécution interrompue après ${SQL_TIMEOUT_MS / 1000} s : la requête ne se termine pas. ` +
  "Vérifie la condition d'arrêt de ta requête récursive.";

// --- Node (tests) -----------------------------------------------------------

// Location of the wasm, overridable so Node tests can point at node_modules.
let locateFile = (file: string): string => `/sql/${file}`;
let sqlPromise: Promise<SqlJsStatic> | null = null;

/** For tests: changes the wasm resolution and resets the engine. */
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

// --- Browser: Web Worker -----------------------------------------------------

// One Worker reused across deployments (the engine stays loaded), and
// recreated after an interruption: a stuck Worker never gets unstuck.
let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, (run: SqlRun) => void>();

function failAll(error: string): void {
  worker?.terminate();
  worker = null;
  const run: SqlRun = { result: null, verify: null, error };
  for (const settle of pending.values()) settle(run);
  pending.clear();
}

function getWorker(): Worker {
  if (!worker) {
    // Bundled by scripts/build-sql-worker.mjs before `dev` and `build`.
    worker = new Worker("/sql/sql-worker.js");
    worker.addEventListener("message", (event: MessageEvent<{ id: number; run: SqlRun }>) => {
      const settle = pending.get(event.data.id);
      if (!settle) return;
      pending.delete(event.data.id);
      settle(event.data.run);
    });
    // Worker missing or failing: report it right away, rather than
    // letting it look like a query that takes too long.
    worker.addEventListener("error", () => {
      failAll("Moteur SQL indisponible. Recharge la page et réessaie.");
    });
  }
  return worker;
}

export async function runSql(code: string, options: SqlRunOptions = {}): Promise<SqlRun> {
  if (typeof Worker === "undefined") {
    return executeSql(await getSql(), code, options);
  }

  return new Promise<SqlRun>((resolve) => {
    const id = ++nextId;
    const timer = setTimeout(() => failAll(SQL_INTERRUPTED_MESSAGE), SQL_TIMEOUT_MS);
    pending.set(id, (run) => {
      clearTimeout(timer);
      resolve(run);
    });
    getWorker().postMessage({ id, code, options });
  });
}
