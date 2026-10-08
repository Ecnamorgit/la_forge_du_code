/**
 * Web Worker d'exécution SQL (audit EXE-02). Une requête sans fin (CTE
 * récursive sans condition d'arrêt) ne bloque que ce Worker, que la page
 * termine au-delà du délai, au lieu de figer l'onglet.
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

import { executerSql, type SqlRun, type SqlRunOptions } from "./sql-engine";

interface Demande {
  id: number;
  code: string;
  options: SqlRunOptions;
}

// Le fichier est compilé avec les types du DOM : on type à la main les deux
// membres du contexte de Worker utilisés ici.
const contexte = self as unknown as {
  addEventListener(type: "message", ecouteur: (event: MessageEvent<Demande>) => void): void;
  postMessage(message: { id: number; run: SqlRun }): void;
};

let moteur: Promise<SqlJsStatic> | null = null;

contexte.addEventListener("message", async (event) => {
  const { id, code, options } = event.data;
  try {
    moteur ??= initSqlJs({ locateFile: (fichier) => `/sql/${fichier}` });
    contexte.postMessage({ id, run: executerSql(await moteur, code, options) });
  } catch (err) {
    contexte.postMessage({
      id,
      run: { result: null, verify: null, error: err instanceof Error ? err.message : String(err) },
    });
  }
});
