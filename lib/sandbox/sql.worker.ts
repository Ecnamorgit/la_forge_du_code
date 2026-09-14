/**
 * Web Worker d'exécution SQL (constat EXE-02 de l'audit de sécurité du
 * 2026-09-12).
 *
 * sql.js tournait sur le fil principal : une requête sans fin (CTE récursive
 * sans condition d'arrêt) figeait l'onglet entier. Dans un Worker, elle ne
 * bloque que ce Worker, que la page peut terminer (`terminate()`) quand le
 * délai est dépassé.
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
