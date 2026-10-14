/**
 * Web Worker d'exécution SQL (audit EXE-02). Une requête sans fin (CTE
 * récursive sans condition d'arrêt) ne bloque que ce Worker, que la page
 * termine au-delà du délai, au lieu de figer l'onglet.
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

import { executeSql, type SqlRun, type SqlRunOptions } from "./sql-engine";

interface SqlRequest {
  id: number;
  code: string;
  options: SqlRunOptions;
}

// Le file est compilé avec les types du DOM : on type à la main les deux
// membres du workerScope de Worker utilisés ici.
const workerScope = self as unknown as {
  addEventListener(type: "message", listener: (event: MessageEvent<SqlRequest>) => void): void;
  postMessage(message: { id: number; run: SqlRun }): void;
};

let engine: Promise<SqlJsStatic> | null = null;

workerScope.addEventListener("message", async (event) => {
  const { id, code, options } = event.data;
  try {
    engine ??= initSqlJs({ locateFile: (file) => `/sql/${file}` });
    workerScope.postMessage({ id, run: executeSql(await engine, code, options) });
  } catch (err) {
    workerScope.postMessage({
      id,
      run: { result: null, verify: null, error: err instanceof Error ? err.message : String(err) },
    });
  }
});
