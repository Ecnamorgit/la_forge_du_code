import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: useState import, [count, setCount] = useState(0) displayed
  (code) => {
    const c = strip(code);
    if (!/import\s*\{[^}]*\buseState\b[^}]*\}\s*from\s*['"]react['"]/.test(c)) {
      return fail("Importe useState depuis 'react'.");
    }
    if (!/\[\s*count\s*,\s*setCount\s*\]\s*=\s*useState\s*\(\s*0\s*\)/.test(c)) {
      return fail("Déclare l'état : const [count, setCount] = useState(0);");
    }
    if (!/\{\s*count\s*\}/.test(c)) {
      return fail("Affiche {count} dans le JSX.");
    }
    return pass("Mémoire activée.", ["o1a", "o1b"]);
  },
  // Step 2: <button> whose onClick increments via setCount
  (code) => {
    const c = strip(code);
    if (!/<button[^>]*onClick\s*=/i.test(c)) {
      return fail("Ajoute un <button> avec un attribut onClick.");
    }
    if (!/setCount\s*\(/.test(c) || !/=>/.test(c)) {
      return fail("Au clic, appelle setCount via une flèche : onClick={() => setCount(count + 1)}.");
    }
    return pass("Rendu réactif.", ["o2a", "o2b"]);
  },
  // Step 3: object state updated with spread
  (code) => {
    const c = strip(code);
    if (!/useState\s*\(\s*\{[^}]*nom[^}]*xp[^}]*\}\s*\)/.test(c)) {
      return fail("Stocke un objet dans useState : useState({ nom: 'Lia', xp: 0 }).");
    }
    if (!/setProfil\s*\(\s*\{\s*\.\.\.\s*profil/.test(c)) {
      return fail("Mets à jour avec le spread (nouvelle référence) : setProfil({ ...profil, xp: ... }).");
    }
    return pass("Immutabilité respectée.", ["o3a", "o3b"]);
  },
  // Step 4: lifted state, the parent passes the value and the setter to the child
  (code) => {
    const c = strip(code);
    if (!/\[\s*alerte\s*,\s*setAlerte\s*\]\s*=\s*useState/.test(c)) {
      return fail("Déclare l'état alerte dans le composant parent TableauDeBord.");
    }
    if (!/alerte\s*=\s*\{\s*alerte\s*\}/.test(c) || !/setAlerte\s*=\s*\{\s*setAlerte\s*\}/.test(c)) {
      return fail("Passe la valeur ET le setter en props : <Bouton alerte={alerte} setAlerte={setAlerte} />.");
    }
    return pass("Architecture réactive.", ["o4a", "o4b"], true);
  },
];
