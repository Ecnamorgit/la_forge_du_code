import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

// Network requests never complete in the sandbox iframe (fictional API
// host): these steps are validated statically, on the code as written.
const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: fetch(.../ping).then(...) that prints the response
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/ping['"]\s*\)/.test(c)) {
      return fail("Appelle fetch('https://api.codeforge.space/ping').");
    }
    if (!/\.then\s*\(/.test(c) || !/console\.log/.test(c)) {
      return fail("Chaîne un .then() et logge la réponse avec console.log.");
    }
    return pass("Signal envoyé.", ["o1a", "o1b"]);
  },
  // Step 2: fetch, res.json() in a first then, log in a second one
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/vaisseau['"]/.test(c)) {
      return fail("Fais un fetch vers 'https://api.codeforge.space/vaisseau'.");
    }
    if (!/\.json\s*\(\s*\)/.test(c)) {
      return fail("Transforme la réponse avec response.json() dans le premier .then().");
    }
    if (countMatches(c, /\.then\s*\(/) < 2 || !/console\.log/.test(c)) {
      return fail("Ajoute un second .then() pour logger les données décodées.");
    }
    return pass("Données décodées.", ["o2a", "o2b"]);
  },
  // Step 3: async function, await fetch and await .json()
  (code) => {
    const c = strip(code);
    if (!/async\s+function\s+\w+|const\s+\w+\s*=\s*async|async\s*\(\s*\)\s*=>/.test(c)) {
      return fail("Crée une fonction avec le mot-clé async.");
    }
    if (!/await\s+fetch\s*\(/.test(c) || !/await\s+\w+\.json\s*\(\s*\)/.test(c)) {
      return fail("Utilise await pour récupérer la réponse ET parser le JSON.");
    }
    return pass("Code modernisé.", ["o3a", "o3b"]);
  },
  // Step 4: try/catch, response.ok check and logging the error
  (code) => {
    const c = strip(code);
    if (!/try\s*\{/.test(c) || !/\.ok\b/.test(c)) {
      return fail("Entoure tes requêtes d'un try { } et vérifie response.ok.");
    }
    if (!/catch\s*\(/.test(c) || !/Erreur de transmission/.test(c)) {
      return fail("Dans le catch, logge 'Erreur de transmission : ' suivi du message.");
    }
    return pass("Panne gérée.", ["o4a", "o4b"], true);
  },
];
