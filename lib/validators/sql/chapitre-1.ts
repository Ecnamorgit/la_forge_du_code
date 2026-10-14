import type {
  SqlQueryResult,
  ValidationResult,
  Validator,
} from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";

/**
 * The SQL validators judge a real execution (sql.js): the rows returned
 * by the query, or the state read back by the step's verification query,
 * not the source text. See lib/sandbox/run-sql.ts and sql-seeds.ts.
 */

function noEngine(): ValidationResult {
  return fail("Moteur SQL indisponible. Recharge la page et réessaie.");
}

function dbError(message: string): ValidationResult {
  return fail(`La base a rejeté ta requête : ${message}`, "syntax");
}

function colIndex(res: SqlQueryResult, name: string): number {
  return res.columns.findIndex((c) => c.toLowerCase() === name.toLowerCase());
}

export const validators: Validator[] = [
  // Step 1: CREATE TABLE pilotes and INSERT 'Lia' at niveau 5
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const v = sql.verify;
    if (!v || v.rows.length === 0) {
      return fail("La table pilotes est vide : crée-la puis insère un pilote.");
    }
    const nameIdx = colIndex(v, "nom");
    const levelIdx = colIndex(v, "niveau");
    if (nameIdx === -1 || levelIdx === -1) {
      return fail("La table doit avoir les colonnes nom et niveau.");
    }
    const lia = v.rows.find(
      (r) => String(r[nameIdx]).toLowerCase() === "lia" && Number(r[levelIdx]) === 5
    );
    if (!lia) return fail("Insère un pilote nommé 'Lia' au niveau 5.");
    return pass("Entrepôt bâti.", ["o1a", "o1b"]);
  },

  // Step 2: SELECT niveau >= 5, sorted by niveau descending
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const r = sql.result;
    if (!r) return fail("Ta requête ne renvoie aucun résultat : utilise SELECT.");
    const levelIdx = colIndex(r, "niveau");
    if (levelIdx === -1) {
      return fail("Sélectionne la colonne niveau pour pouvoir filtrer et trier.");
    }
    const levels = r.rows.map((row) => Number(row[levelIdx]));
    if (levels.length === 0 || levels.some((n) => n < 5)) {
      return fail("Filtre avec WHERE niveau >= 5 : toutes les lignes doivent être >= 5.");
    }
    const sortedDesc = levels.every((n, i) => i === 0 || levels[i - 1] >= n);
    if (!sortedDesc) {
      return fail("Trie le résultat avec ORDER BY niveau DESC.");
    }
    return pass("Données extraites.", ["o2a", "o2b"]);
  },

  // Step 3: UPDATE id=1 to 10, DELETE niveau < 3
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const v = sql.verify;
    if (!v) return fail("Impossible de relire l'état de la table.");
    const idIdx = colIndex(v, "id");
    const levelIdx = colIndex(v, "niveau");
    const row1 = v.rows.find((r) => Number(r[idIdx]) === 1);
    if (!row1 || Number(row1[levelIdx]) !== 10) {
      return fail("Mets à jour le pilote id=1 à niveau 10 (UPDATE ... SET ... WHERE id = 1).");
    }
    if (v.rows.some((r) => Number(r[levelIdx]) < 3)) {
      return fail("Supprime les pilotes de niveau < 3 (DELETE FROM pilotes WHERE niveau < 3).");
    }
    return pass("Données actualisées.", ["o3a", "o3b"]);
  },

  // Step 4: INNER JOIN between pilotes and vaisseaux
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const r = sql.result;
    if (!r || r.rows.length === 0) {
      return fail("Ta jointure ne renvoie rien : vérifie INNER JOIN ... ON ...");
    }
    if (colIndex(r, "nom") === -1 || colIndex(r, "modele") === -1) {
      return fail("Sélectionne le nom du pilote ET le modele du vaisseau.");
    }
    return pass("Données croisées.", ["o4a", "o4b"], true);
  },
];
