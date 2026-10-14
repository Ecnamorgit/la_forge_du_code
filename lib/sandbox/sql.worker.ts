/**
 * SQL execution Web Worker (audit EXE-02). A never-ending query (recursive
 * CTE with no stop condition) only blocks this Worker, which the page
 * terminates past the timeout, instead of freezing the tab.
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

import { executeSql, type SqlRun, type SqlRunOptions } from "./sql-engine";

interface SqlRequest {
  id: number;
  code: string;
  options: SqlRunOptions;
}

// This file is compiled with the DOM types: we hand-type the two
// members of the Worker global scope used here.
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
