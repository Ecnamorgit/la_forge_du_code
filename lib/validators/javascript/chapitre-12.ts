import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

// Validation statique : l'hôte REST fictif ne répond jamais dans le bac à sable.
const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : GET /vaisseaux (sans options), response.ok et log
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/vaisseaux['"]\s*\)/.test(c)) {
      return fail("Récupère la liste via fetch('https://api.codeforge.space/vaisseaux') (GET par défaut).");
    }
    if (!/\.ok\b/.test(c) || !/console\.log/.test(c)) {
      return fail("Vérifie response.ok puis logge les données reçues.");
    }
    return pass("Flotte recensée.", ["o1a", "o1b"]);
  },
  // Étape 2 : POST avec method, headers et body en JSON.stringify
  (code) => {
    const c = strip(code);
    if (!/method\s*:\s*['"]POST['"]/i.test(c) || !/headers\s*:/.test(c) || !/body\s*:/.test(c)) {
      return fail("Spécifie method: 'POST', headers et body dans les options de fetch.");
    }
    if (!/JSON\.stringify\s*\(/.test(c)) {
      return fail("Convertis l'objet du body avec JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }).");
    }
    return pass("Vaisseau enregistré.", ["o2a", "o2b"]);
  },
  // Étape 3 : PUT /vaisseaux/42 avec method et body
  (code) => {
    const c = strip(code);
    if (!/\/vaisseaux\/42/.test(c)) {
      return fail("Cible la ressource par son id dans l'URL : '.../vaisseaux/42'.");
    }
    if (!/method\s*:\s*['"]PUT['"]/i.test(c) || !/body\s*:/.test(c)) {
      return fail("Utilise method: 'PUT' avec le body complet { nom: 'Phoenix II', classe: 'combat' }.");
    }
    return pass("Dossier actualisé.", ["o3a", "o3b"]);
  },
  // Étape 4 : DELETE /vaisseaux/13, response.ok et message de succès
  (code) => {
    const c = strip(code);
    if (!/method\s*:\s*['"]DELETE['"]/i.test(c) || !/\/vaisseaux\/13\b/.test(c)) {
      return fail("Supprime via method: 'DELETE' sur '.../vaisseaux/13'.");
    }
    if (!/\.ok\b/.test(c) || !/Vaisseau retir[ée] de la flotte/.test(c)) {
      return fail("Vérifie response.ok et logge 'Vaisseau retiré de la flotte' en cas de succès.");
    }
    return pass("CRUD maîtrisé.", ["o4a", "o4b"], true);
  },
];
