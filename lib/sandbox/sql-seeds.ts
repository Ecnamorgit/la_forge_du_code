/**
 * Per-step SQL setup for the SQL cursus. Each step runs against a fresh
 * in-memory database (see lib/sandbox/run-sql.ts):
 *  - `seed`   : tables/data created BEFORE the student's SQL (so a SELECT step
 *               has something to query; the CREATE step starts from empty).
 *  - `verify` : a read-back query run AFTER the student's SQL, used to validate
 *               steps whose effect isn't a visible result set (INSERT/UPDATE/DELETE).
 */

import type { SqlRunOptions } from "./run-sql";

const PILOTES_SEED =
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);" +
  "INSERT INTO pilotes (id, nom, niveau) VALUES " +
  "(1,'Lia',5),(2,'Bo',2),(3,'Kal',8),(4,'Ino',6),(5,'Sora',1);";

const PILOTES_VAISSEAUX_SEED =
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL);" +
  "INSERT INTO pilotes (id, nom) VALUES (1,'Lia'),(2,'Bo'),(3,'Kal');" +
  "CREATE TABLE vaisseaux (id INTEGER PRIMARY KEY, modele VARCHAR(50), pilote_id INTEGER);" +
  "INSERT INTO vaisseaux (id, modele, pilote_id) VALUES (1,'Falcon',1),(2,'Comet',1),(3,'Nova',3);";

/** Indexed by chapter slug, one entry per step (same order as the steps). */
const SQL_STEP_CONFIG: Record<string, SqlRunOptions[]> = {
  "chapitre-1": [
    // Step 1 — CREATE TABLE + INSERT (empty DB; read back the new table).
    { verify: "SELECT id, nom, niveau FROM pilotes ORDER BY id" },
    // Step 2 — SELECT on a pre-populated table.
    { seed: PILOTES_SEED },
    // Step 3 — UPDATE + DELETE (read back the resulting state).
    { seed: PILOTES_SEED, verify: "SELECT id, niveau FROM pilotes ORDER BY id" },
    // Step 4 — INNER JOIN across two related tables.
    { seed: PILOTES_VAISSEAUX_SEED },
  ],
};

export function getSqlStepConfig(
  chapterSlug: string,
  stepIndex: number
): SqlRunOptions {
  return SQL_STEP_CONFIG[chapterSlug]?.[stepIndex] ?? {};
}
