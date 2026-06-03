import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: the answers are written AS comments, so we read the RAW code here.
  (code) => {
    const hasConstant = /O\s*\(\s*1\s*\)/i.test(code);
    const hasLinear = /O\s*\(\s*n\s*\)/i.test(code);
    const hasQuadratic = /O\s*\(\s*n\s*(\^|\*\*)?\s*2\s*\)/i.test(code);
    if (!hasConstant || !hasLinear || !hasQuadratic) {
      return fail("Indique les trois complexites en commentaire : O(1), O(n) et O(n^2).");
    }
    return pass("Complexite comprise.", ["o1a", "o1b"]);
  },
  // Step 2: binary search — while loop + midpoint + not-found return
  (code) => {
    const c = strip(code);
    if (!/while\s*\(/.test(c)) {
      return fail("Implemente la boucle while avec des bornes debut/fin.");
    }
    if (!/Math\.floor\s*\(/.test(c) || !/return\s+-\s*1/.test(c)) {
      return fail("Calcule le milieu (Math.floor) et retourne -1 si la cible est absente.");
    }
    return pass("Log n atteint.", ["o2a", "o2b"]);
  },
  // Step 3: bubble sort — two nested loops + destructuring swap
  (code) => {
    const c = strip(code);
    if (countMatches(c, /for\s*\(/) < 2) {
      return fail("Le tri a bulles a besoin de DEUX boucles for imbriquees.");
    }
    // Destructuring swap, e.g. [a[j], a[j + 1]] = [a[j + 1], a[j]]. The signature
    // is a closing bracket, '=', opening bracket (tolerant of nested indexing).
    if (!/\]\s*=\s*\[/.test(c)) {
      return fail("Echange deux elements avec le destructuring : [a[j], a[j+1]] = [a[j+1], a[j]].");
    }
    return pass("Donnees ordonnees.", ["o3a", "o3b"]);
  },
  // Step 4: fibonacci recursive + iterative
  (code) => {
    const c = strip(code);
    const recursive =
      /function\s+fiboRecursif/.test(c) &&
      /fiboRecursif\s*\([^)]*-\s*1\s*\)\s*\+\s*fiboRecursif\s*\([^)]*-\s*2\s*\)/.test(c);
    if (!recursive) {
      return fail("Implemente fiboRecursif avec un cas de base puis fiboRecursif(n-1) + fiboRecursif(n-2).");
    }
    if (!/function\s+fiboIteratif/.test(c) || !/for\s*\(/.test(c)) {
      return fail("Implemente fiboIteratif avec une boucle (version O(n)).");
    }
    return pass("Fondamentaux acquis.", ["o4a", "o4b"], true);
  },
];
