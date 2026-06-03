import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: replace innerHTML with textContent (anti-XSS)
  (code) => {
    const c = strip(code);
    if (!/\.(textContent|innerText)\s*=/.test(c)) {
      return fail("Utilise .textContent (ou .innerText) pour afficher du contenu utilisateur.");
    }
    if (/\.innerHTML\s*=/.test(c)) {
      return fail("Supprime l'affectation .innerHTML : c'est la faille XSS a corriger.");
    }
    return pass("Injection bloquee.", ["o1a", "o1b"]);
  },
  // Step 2: parametrized query instead of string concatenation
  (code) => {
    const c = strip(code);
    if (/\$\{[^}]*\}/.test(c)) {
      return fail("Retire la concatenation `${nom}` dans la requete : c'est injectable.");
    }
    if (!/nom\s*=\s*\$1/.test(c)) {
      return fail("Utilise un placeholder : WHERE nom = $1.");
    }
    if (!/db\.query\s*\(\s*[^,]+,\s*\[\s*nom\s*\]/.test(c)) {
      return fail("Passe la valeur en tableau de parametres : db.query(sql, [nom]).");
    }
    return pass("Base protegee.", ["o2a", "o2b"]);
  },
  // Step 3: bcrypt.hash + store the hash, not the plaintext
  (code) => {
    const c = strip(code);
    if (!/bcrypt\.hash\s*\(\s*password/.test(c)) {
      return fail("Hashe le mot de passe : const hash = await bcrypt.hash(password, 10).");
    }
    if (!/password\s*:\s*hash/.test(c)) {
      return fail("Stocke le hash, pas le mot de passe en clair : { login, password: hash }.");
    }
    return pass("Secrets proteges.", ["o3a", "o3b"]);
  },
  // Step 4: CORS with a specific origin, never '*'
  (code) => {
    const c = strip(code);
    if (/origin\s*:\s*['"]\*['"]/.test(c)) {
      return fail("N'utilise JAMAIS origin: '*' en production.");
    }
    if (!/cors\s*\(\s*\{[^}]*origin\s*:\s*['"]https:\/\/app\.codeforge\.space['"]/.test(c)) {
      return fail("Configure CORS avec origin: 'https://app.codeforge.space'.");
    }
    return pass("Surface d'attaque reduite.", ["o4a", "o4b"], true);
  },
];
