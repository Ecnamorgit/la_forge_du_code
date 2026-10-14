/**
 * SQL setup for each step of the SQL curriculum, run on a fresh in-memory
 * database. `seed` creates tables and data before the learner's SQL;
 * `verify` reads the state back afterwards, to validate steps with no visible
 * result (INSERT, UPDATE, DELETE).
 */

import type { SqlRunOptions } from "./run-sql";

const PILOTS_SEED =
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);" +
  "INSERT INTO pilotes (id, nom, niveau) VALUES " +
  "(1,'Lia',5),(2,'Bo',2),(3,'Kal',8),(4,'Ino',6),(5,'Sora',1);";

const PILOTS_SHIPS_SEED =
  "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL);" +
  "INSERT INTO pilotes (id, nom) VALUES (1,'Lia'),(2,'Bo'),(3,'Kal');" +
  "CREATE TABLE vaisseaux (id INTEGER PRIMARY KEY, modele VARCHAR(50), pilote_id INTEGER);" +
  "INSERT INTO vaisseaux (id, modele, pilote_id) VALUES (1,'Falcon',1),(2,'Comet',1),(3,'Nova',3);";

/** Per chapter slug, one entry per step, in step order. */
const SQL_STEP_CONFIG: Record<string, SqlRunOptions[]> = {
  "chapitre-1": [
    // Step 1: CREATE TABLE + INSERT on an empty database, then read back.
    { verify: "SELECT id, nom, niveau FROM pilotes ORDER BY id" },
    // Step 2: SELECT on a prefilled table.
    { seed: PILOTS_SEED },
    // Step 3: UPDATE + DELETE, then read back.
    { seed: PILOTS_SEED, verify: "SELECT id, niveau FROM pilotes ORDER BY id" },
    // Step 4: INNER JOIN between two related tables.
    { seed: PILOTS_SHIPS_SEED },
  ],
};

export function getSqlStepConfig(
  chapterSlug: string,
  stepIndex: number
): SqlRunOptions {
  return SQL_STEP_CONFIG[chapterSlug]?.[stepIndex] ?? {};
}
