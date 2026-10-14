import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: useEffect import, log on mount with [] as dependencies
  (code) => {
    const c = strip(code);
    if (!/import\s*\{[^}]*\buseEffect\b[^}]*\}\s*from\s*['"]react['"]/.test(c)) {
      return fail("Importe useEffect depuis 'react'.");
    }
    if (!/useEffect\s*\(\s*\(\s*\)\s*=>/.test(c) || !/console\.log\s*\(\s*['"]Composant en ligne/.test(c)) {
      return fail("Logue 'Composant en ligne' dans un useEffect.");
    }
    if (!/\}\s*,\s*\[\s*\]\s*\)/.test(c)) {
      return fail("Passe un tableau de dépendances vide [] pour ne logger qu'au montage.");
    }
    return pass("Effet initial.", ["o1a", "o1b"]);
  },
  // Step 2: document.title in a useEffect, count as a dependency
  (code) => {
    const c = strip(code);
    if (!/document\.title\s*=/.test(c)) {
      return fail("Modifie document.title dans un useEffect.");
    }
    if (!/\}\s*,\s*\[\s*count\s*\]\s*\)/.test(c)) {
      return fail("Passe count dans le tableau de dépendances : }, [count]).");
    }
    return pass("Synchronisation.", ["o2a", "o2b"]);
  },
  // Step 3: setInterval and cleanup with clearInterval
  (code) => {
    const c = strip(code);
    if (!/setInterval\s*\(/.test(c)) {
      return fail("Démarre un setInterval dans useEffect.");
    }
    if (!/return\s*\(\s*\)\s*=>[\s\S]*clearInterval\s*\(/.test(c)) {
      return fail("Retourne une fonction de cleanup qui fait clearInterval(id).");
    }
    return pass("Fuite évitée.", ["o3a", "o3b"]);
  },
  // Step 4: fetch on mount and conditional loading display
  (code) => {
    const c = strip(code);
    if (!/useEffect\s*\(/.test(c) || !/fetch\s*\(/.test(c)) {
      return fail("Lance un fetch au montage dans un useEffect.");
    }
    if (!/useState\s*\(\s*null\s*\)/.test(c) || !/Chargement/i.test(c)) {
      return fail("Gère l'état de chargement : useState(null) + affichage 'Chargement...' tant que c'est null.");
    }
    return pass("Données chargées.", ["o4a", "o4b"], true);
  },
];
