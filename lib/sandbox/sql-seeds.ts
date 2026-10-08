/**
 * Préparation SQL de chaque étape du cursus SQL, exécutée sur une base en
 * mémoire neuve. `seed` crée tables et données avant le SQL de l'apprenant ;
 * `verify` relit l'état ensuite, pour valider les étapes sans résultat visible
 * (INSERT, UPDATE, DELETE).
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

/** Par slug de chapitre, une entrée par étape, dans l'ordre des étapes. */
const SQL_STEP_CONFIG: Record<string, SqlRunOptions[]> = {
  "chapitre-1": [
    // Étape 1 : CREATE TABLE + INSERT sur une base vide, puis relecture.
    { verify: "SELECT id, nom, niveau FROM pilotes ORDER BY id" },
    // Étape 2 : SELECT sur une table préremplie.
    { seed: PILOTES_SEED },
    // Étape 3 : UPDATE + DELETE, puis relecture.
    { seed: PILOTES_SEED, verify: "SELECT id, niveau FROM pilotes ORDER BY id" },
    // Étape 4 : INNER JOIN entre deux tables liées.
    { seed: PILOTES_VAISSEAUX_SEED },
  ],
};

export function getSqlStepConfig(
  chapterSlug: string,
  stepIndex: number
): SqlRunOptions {
  return SQL_STEP_CONFIG[chapterSlug]?.[stepIndex] ?? {};
}
