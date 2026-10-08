import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

// Les requêtes réseau n'aboutissent pas dans l'iframe du bac à sable (hôte
// d'API fictif) : ces étapes sont validées statiquement, sur le code écrit.
const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : fetch(.../ping).then(...) qui affiche la réponse
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
  // Étape 2 : fetch, res.json() dans un premier then, log dans un second
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
  // Étape 3 : fonction async, await fetch et await .json()
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
  // Étape 4 : try/catch, test de response.ok et log de l'erreur
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
