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
 *
 * Dans le navigateur, la requête s'exécute dans un Web Worker (constat EXE-02
 * de l'audit de sécurité du 2026-09-12) : une requête sans fin ne fige plus
 * l'onglet, et la page arrête le Worker quand le délai est dépassé. Sous Node
 * (les tests), elle s'exécute directement.
 */

import initSqlJs, { type SqlJsStatic } from "sql.js";

import { executerSql, type SqlRun, type SqlRunOptions } from "./sql-engine";

export type { SqlQueryResult, SqlRun, SqlRunOptions } from "./sql-engine";

/** Délai au-delà duquel une requête est interrompue (chargement du moteur compris). */
export const DELAI_SQL_MS = 5000;

export const MESSAGE_SQL_INTERROMPU =
  `Exécution interrompue après ${DELAI_SQL_MS / 1000} s : la requête ne se termine pas. ` +
  "Vérifie la condition d'arrêt de ta requête récursive.";

// --- Node (tests) -----------------------------------------------------------

// Where to fetch the wasm. Overridable so Node tests can point at the file
// inside node_modules.
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

// --- Navigateur : Web Worker --------------------------------------------------

// Un Worker réutilisé d'un déploiement à l'autre (le moteur reste chargé), et
// recréé après une interruption : un Worker bloqué ne se débloque pas.
let worker: Worker | null = null;
let prochainId = 0;
const enAttente = new Map<number, (run: SqlRun) => void>();

function terminerTout(error: string): void {
  worker?.terminate();
  worker = null;
  const run: SqlRun = { result: null, verify: null, error };
  for (const terminer of enAttente.values()) terminer(run);
  enAttente.clear();
}

function obtenirWorker(): Worker {
  if (!worker) {
    // Bundlé par scripts/build-sql-worker.mjs avant `dev` et `build`.
    worker = new Worker("/sql/sql-worker.js");
    worker.addEventListener("message", (event: MessageEvent<{ id: number; run: SqlRun }>) => {
      const terminer = enAttente.get(event.data.id);
      if (!terminer) return;
      enAttente.delete(event.data.id);
      terminer(event.data.run);
    });
    // Worker introuvable ou en erreur : on le dit tout de suite, plutôt que
    // de laisser croire à une requête trop longue.
    worker.addEventListener("error", () => {
      terminerTout("Moteur SQL indisponible. Recharge la page et réessaie.");
    });
  }
  return worker;
}

export async function runSql(code: string, options: SqlRunOptions = {}): Promise<SqlRun> {
  if (typeof Worker === "undefined") {
    return executerSql(await getSql(), code, options);
  }

  return new Promise<SqlRun>((resolve) => {
    const id = ++prochainId;
    const minuteur = setTimeout(() => terminerTout(MESSAGE_SQL_INTERROMPU), DELAI_SQL_MS);
    enAttente.set(id, (run) => {
      clearTimeout(minuteur);
      resolve(run);
    });
    obtenirWorker().postMessage({ id, code, options });
  });
}
