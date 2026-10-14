import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: the answers are written as comments, so we read the raw code.
  (code) => {
    const hasConstant = /O\s*\(\s*1\s*\)/i.test(code);
    const hasLinear = /O\s*\(\s*n\s*\)/i.test(code);
    const hasQuadratic = /O\s*\(\s*n\s*(\^|\*\*)?\s*2\s*\)/i.test(code);
    if (!hasConstant || !hasLinear || !hasQuadratic) {
      return fail("Indique les trois complexités en commentaire : O(1), O(n) et O(n^2).");
    }
    return pass("Complexité comprise.", ["o1a", "o1b"]);
  },
  // Step 2: binary search (while, midpoint, return -1 if absent)
  (code) => {
    const c = strip(code);
    if (!/while\s*\(/.test(c)) {
      return fail("Implémente la boucle while avec des bornes debut/fin.");
    }
    if (!/Math\.floor\s*\(/.test(c) || !/return\s+-\s*1/.test(c)) {
      return fail("Calcule le milieu (Math.floor) et retourne -1 si la cible est absente.");
    }
    return pass("Log n atteint.", ["o2a", "o2b"]);
  },
  // Step 3: bubble sort (two nested for loops, swap by destructuring)
  (code) => {
    const c = strip(code);
    if (countMatches(c, /for\s*\(/) < 2) {
      return fail("Le tri à bulles a besoin de DEUX boucles for imbriquées.");
    }
    // Swap by destructuring, e.g. [a[j], a[j + 1]] = [a[j + 1], a[j]]: we
    // look for `] = [`, which tolerates nested indexes.
    if (!/\]\s*=\s*\[/.test(c)) {
      return fail("Échange deux éléments avec le destructuring : [a[j], a[j+1]] = [a[j+1], a[j]].");
    }
    return pass("Données ordonnées.", ["o3a", "o3b"]);
  },
  // Step 4: recursive and iterative Fibonacci
  (code) => {
    const c = strip(code);
    const recursive =
      /function\s+fiboRecursif/.test(c) &&
      /fiboRecursif\s*\([^)]*-\s*1\s*\)\s*\+\s*fiboRecursif\s*\([^)]*-\s*2\s*\)/.test(c);
    if (!recursive) {
      return fail("Implémente fiboRecursif avec un cas de base puis fiboRecursif(n-1) + fiboRecursif(n-2).");
    }
    if (!/function\s+fiboIteratif/.test(c) || !/for\s*\(/.test(c)) {
      return fail("Implémente fiboIteratif avec une boucle (version O(n)).");
    }
    return pass("Fondamentaux acquis.", ["o4a", "o4b"], true);
  },
];
