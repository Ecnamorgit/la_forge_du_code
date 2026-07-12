import type {
  SqlQueryResult,
  ValidationResult,
  Validator,
} from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";

/**
 * SQL validators run against REAL execution (sql.js): they inspect the rows the
 * student's query produced, or the post-state read back by the step's verify
 * query — not the source text. See lib/sandbox/run-sql.ts + sql-seeds.ts.
 */

function noEngine(): ValidationResult {
  return fail("Moteur SQL indisponible. Recharge la page et reessaie.");
}

function dbError(message: string): ValidationResult {
  return fail(`La base a rejete ta requete : ${message}`, "syntax");
}

function colIndex(res: SqlQueryResult, name: string): number {
  return res.columns.findIndex((c) => c.toLowerCase() === name.toLowerCase());
}

export const validators: Validator[] = [
  // Step 1 — CREATE TABLE pilotes + INSERT 'Lia' niveau 5.
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const v = sql.verify;
    if (!v || v.rows.length === 0) {
      return fail("La table pilotes est vide : cree-la puis insere un pilote.");
    }
    const nomIdx = colIndex(v, "nom");
    const nivIdx = colIndex(v, "niveau");
    if (nomIdx === -1 || nivIdx === -1) {
      return fail("La table doit avoir les colonnes nom et niveau.");
    }
    const lia = v.rows.find(
      (r) => String(r[nomIdx]).toLowerCase() === "lia" && Number(r[nivIdx]) === 5
    );
    if (!lia) return fail("Insere un pilote nomme 'Lia' au niveau 5.");
    return pass("Entrepot bati.", ["o1a", "o1b"]);
  },

  // Step 2 — SELECT niveau >= 5, trie DESC.
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const r = sql.result;
    if (!r) return fail("Ta requete ne renvoie aucun resultat : utilise SELECT.");
    const nivIdx = colIndex(r, "niveau");
    if (nivIdx === -1) {
      return fail("Selectionne la colonne niveau pour pouvoir filtrer et trier.");
    }
    const niveaux = r.rows.map((row) => Number(row[nivIdx]));
    if (niveaux.length === 0 || niveaux.some((n) => n < 5)) {
      return fail("Filtre avec WHERE niveau >= 5 : toutes les lignes doivent etre >= 5.");
    }
    const sortedDesc = niveaux.every((n, i) => i === 0 || niveaux[i - 1] >= n);
    if (!sortedDesc) {
      return fail("Trie le resultat avec ORDER BY niveau DESC.");
    }
    return pass("Donnees extraites.", ["o2a", "o2b"]);
  },

  // Step 3 — UPDATE id=1 -> 10, DELETE niveau < 3.
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const v = sql.verify;
    if (!v) return fail("Impossible de relire l'etat de la table.");
    const idIdx = colIndex(v, "id");
    const nivIdx = colIndex(v, "niveau");
    const row1 = v.rows.find((r) => Number(r[idIdx]) === 1);
    if (!row1 || Number(row1[nivIdx]) !== 10) {
      return fail("Mets a jour le pilote id=1 a niveau 10 (UPDATE ... SET ... WHERE id = 1).");
    }
    if (v.rows.some((r) => Number(r[nivIdx]) < 3)) {
      return fail("Supprime les pilotes de niveau < 3 (DELETE FROM pilotes WHERE niveau < 3).");
    }
    return pass("Donnees actualisees.", ["o3a", "o3b"]);
  },

  // Step 4 — INNER JOIN pilotes + vaisseaux.
  (_code, ctx) => {
    const sql = ctx?.sql;
    if (!sql) return noEngine();
    if (sql.error) return dbError(sql.error);
    const r = sql.result;
    if (!r || r.rows.length === 0) {
      return fail("Ta jointure ne renvoie rien : verifie INNER JOIN ... ON ...");
    }
    if (colIndex(r, "nom") === -1 || colIndex(r, "modele") === -1) {
      return fail("Selectionne le nom du pilote ET le modele du vaisseau.");
    }
    return pass("Donnees croisees.", ["o4a", "o4b"], true);
  },
];
