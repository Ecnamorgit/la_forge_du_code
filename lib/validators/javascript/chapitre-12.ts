import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

// Validated statically: the fictional REST host never resolves in the sandbox.
const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: GET /vaisseaux (no options) + response.ok + log
  (code) => {
    const c = strip(code);
    if (!/fetch\s*\(\s*['"]https:\/\/api\.codeforge\.space\/vaisseaux['"]\s*\)/.test(c)) {
      return fail("Recupere la liste via fetch('https://api.codeforge.space/vaisseaux') (GET par defaut).");
    }
    if (!/\.ok\b/.test(c) || !/console\.log/.test(c)) {
      return fail("Verifie response.ok puis logge les donnees recues.");
    }
    return pass("Flotte recensee.", ["o1a", "o1b"]);
  },
  // Step 2: POST with method + headers + body + JSON.stringify
  (code) => {
    const c = strip(code);
    if (!/method\s*:\s*['"]POST['"]/i.test(c) || !/headers\s*:/.test(c) || !/body\s*:/.test(c)) {
      return fail("Specifie method: 'POST', headers et body dans les options de fetch.");
    }
    if (!/JSON\.stringify\s*\(/.test(c)) {
      return fail("Convertis l'objet du body avec JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }).");
    }
    return pass("Vaisseau enregistre.", ["o2a", "o2b"]);
  },
  // Step 3: PUT /vaisseaux/42 + method PUT + body
  (code) => {
    const c = strip(code);
    if (!/\/vaisseaux\/42/.test(c)) {
      return fail("Cible la ressource par son id dans l'URL : '.../vaisseaux/42'.");
    }
    if (!/method\s*:\s*['"]PUT['"]/i.test(c) || !/body\s*:/.test(c)) {
      return fail("Utilise method: 'PUT' avec le body complet { nom: 'Phoenix II', classe: 'combat' }.");
    }
    return pass("Dossier actualise.", ["o3a", "o3b"]);
  },
  // Step 4: DELETE /vaisseaux/7 + response.ok + success log
  (code) => {
    const c = strip(code);
    if (!/method\s*:\s*['"]DELETE['"]/i.test(c) || !/\/vaisseaux\/7/.test(c)) {
      return fail("Supprime via method: 'DELETE' sur '.../vaisseaux/7'.");
    }
    if (!/\.ok\b/.test(c) || !/Vaisseau retire de la flotte/.test(c)) {
      return fail("Verifie response.ok et logge 'Vaisseau retire de la flotte' en cas de succes.");
    }
    return pass("CRUD maitrise.", ["o4a", "o4b"], true);
  },
];
