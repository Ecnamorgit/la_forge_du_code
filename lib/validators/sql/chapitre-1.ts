import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "--");

export const validators: Validator[] = [
  // Step 1: CREATE TABLE pilotes + constraints + INSERT
  (code) => {
    const c = strip(code);
    if (!/create\s+table\s+pilotes/i.test(c) || !/primary\s+key/i.test(c) || !/not\s+null/i.test(c)) {
      return fail("Cree la table pilotes avec PRIMARY KEY et NOT NULL sur les bonnes colonnes.");
    }
    if (!/insert\s+into\s+pilotes/i.test(c)) {
      return fail("Insere un pilote avec INSERT INTO pilotes ...");
    }
    return pass("Entrepot bati.", ["o1a", "o1b"]);
  },
  // Step 2: SELECT WHERE niveau>=5 ORDER BY DESC LIMIT
  (code) => {
    const c = strip(code);
    if (!/where\s+niveau\s*>=\s*5/i.test(c)) {
      return fail("Filtre avec WHERE niveau >= 5.");
    }
    if (!/order\s+by\s+niveau\s+desc/i.test(c) || !/limit\s+\d+/i.test(c)) {
      return fail("Trie avec ORDER BY niveau DESC et restreins avec LIMIT 10.");
    }
    return pass("Donnees extraites.", ["o2a", "o2b"]);
  },
  // Step 3: UPDATE ... SET ... WHERE + DELETE ... WHERE
  (code) => {
    const c = strip(code);
    if (!/update\s+pilotes[\s\S]*set[\s\S]*where/i.test(c)) {
      return fail("Mets a jour avec UPDATE pilotes SET niveau = 10 WHERE id = 1.");
    }
    if (!/delete\s+from\s+pilotes[\s\S]*where/i.test(c)) {
      return fail("Supprime avec DELETE FROM pilotes WHERE niveau < 3 (WHERE obligatoire !).");
    }
    return pass("Donnees actualisees.", ["o3a", "o3b"]);
  },
  // Step 4: INNER JOIN ON + select columns from both tables
  (code) => {
    const c = strip(code);
    if (!/join\s+vaisseaux\s+on/i.test(c)) {
      return fail("Joins les tables avec INNER JOIN vaisseaux ON ...");
    }
    if (!/nom/i.test(c) || !/modele/i.test(c)) {
      return fail("Selectionne le nom du pilote ET le modele du vaisseau.");
    }
    return pass("Donnees croisees.", ["o4a", "o4b"], true);
  },
];
