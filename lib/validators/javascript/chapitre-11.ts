import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

// Network requests can't actually resolve inside the sandboxed iframe (no
// same-origin, fictional API host), so these steps are validated statically by
// inspecting the code the student wrote rather than its runtime output.
const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: fetch(.../ping).then(...) logging the response
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/ping['"]\s*\)/.test(c)) {
      return fail("Appelle fetch('https://api.codeforge.space/ping').");
    }
    if (!/\.then\s*\(/.test(c) || !/console\.log/.test(c)) {
      return fail("Chaine un .then() et logge la reponse avec console.log.");
    }
    return pass("Signal envoye.", ["o1a", "o1b"]);
  },
  // Step 2: fetch + res.json() in first then + second then logging data
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/vaisseau['"]/.test(c)) {
      return fail("Fais un fetch vers 'https://api.codeforge.space/vaisseau'.");
    }
    if (!/\.json\s*\(\s*\)/.test(c)) {
      return fail("Transforme la reponse avec response.json() dans le premier .then().");
    }
    if (countMatches(c, /\.then\s*\(/) < 2 || !/console\.log/.test(c)) {
      return fail("Ajoute un second .then() pour logger les donnees decodees.");
    }
    return pass("Donnees decodees.", ["o2a", "o2b"]);
  },
  // Step 3: async function + await fetch + await .json()
  (code) => {
    const c = strip(code);
    if (!/async\s+function\s+\w+|const\s+\w+\s*=\s*async|async\s*\(\s*\)\s*=>/.test(c)) {
      return fail("Cree une fonction avec le mot-cle async.");
    }
    if (!/await\s+fetch\s*\(/.test(c) || !/await\s+\w+\.json\s*\(\s*\)/.test(c)) {
      return fail("Utilise await pour recuperer la reponse ET parser le JSON.");
    }
    return pass("Code modernise.", ["o3a", "o3b"]);
  },
  // Step 4: try/catch + response.ok check + log error
  (code) => {
    const c = strip(code);
    if (!/try\s*\{/.test(c) || !/\.ok\b/.test(c)) {
      return fail("Entoure tes requetes d'un try { } et verifie response.ok.");
    }
    if (!/catch\s*\(/.test(c) || !/Erreur de transmission/.test(c)) {
      return fail("Dans le catch, logge 'Erreur de transmission : ' suivi du message.");
    }
    return pass("Panne geree.", ["o4a", "o4b"], true);
  },
];
