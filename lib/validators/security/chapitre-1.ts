import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: textContent instead of innerHTML (anti-XSS)
  (code) => {
    const c = strip(code);
    if (!/\.(textContent|innerText)\s*=/.test(c)) {
      return fail("Utilise .textContent (ou .innerText) pour afficher du contenu utilisateur.");
    }
    if (/\.innerHTML\s*=/.test(c)) {
      return fail("Supprime l'affectation .innerHTML : c'est la faille XSS à corriger.");
    }
    return pass("Injection bloquée.", ["o1a", "o1b"]);
  },
  // Step 2: parameterised query rather than concatenation
  (code) => {
    const c = strip(code);
    if (/\$\{[^}]*\}/.test(c)) {
      return fail("Retire la concaténation `${nom}` dans la requête : c'est injectable.");
    }
    if (!/nom\s*=\s*\$1/.test(c)) {
      return fail("Utilise un placeholder : WHERE nom = $1.");
    }
    if (!/db\.query\s*\(\s*[^,]+,\s*\[\s*nom\s*\]/.test(c)) {
      return fail("Passe la valeur en tableau de paramètres : db.query(sql, [nom]).");
    }
    return pass("Base protégée.", ["o2a", "o2b"]);
  },
  // Step 3: bcrypt.hash, and storing the hash rather than the password
  (code) => {
    const c = strip(code);
    if (!/bcrypt\.hash\s*\(\s*password/.test(c)) {
      return fail("Hashe le mot de passe : const hash = await bcrypt.hash(password, 10).");
    }
    if (!/password\s*:\s*hash/.test(c)) {
      return fail("Stocke le hash, pas le mot de passe en clair : { login, password: hash }.");
    }
    return pass("Secrets protégés.", ["o3a", "o3b"]);
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
    return pass("Surface d'attaque réduite.", ["o4a", "o4b"], true);
  },
];
