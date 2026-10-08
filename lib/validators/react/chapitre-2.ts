import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : import de useState, [count, setCount] = useState(0) affiché
  (code) => {
    const c = strip(code);
    if (!/import\s*\{[^}]*\buseState\b[^}]*\}\s*from\s*['"]react['"]/.test(c)) {
      return fail("Importe useState depuis 'react'.");
    }
    if (!/\[\s*count\s*,\s*setCount\s*\]\s*=\s*useState\s*\(\s*0\s*\)/.test(c)) {
      return fail("Declare l'etat : const [count, setCount] = useState(0);");
    }
    if (!/\{\s*count\s*\}/.test(c)) {
      return fail("Affiche {count} dans le JSX.");
    }
    return pass("Memoire activee.", ["o1a", "o1b"]);
  },
  // Étape 2 : <button> dont le onClick incrémente via setCount
  (code) => {
    const c = strip(code);
    if (!/<button[^>]*onClick\s*=/i.test(c)) {
      return fail("Ajoute un <button> avec un attribut onClick.");
    }
    if (!/setCount\s*\(/.test(c) || !/=>/.test(c)) {
      return fail("Au clic, appelle setCount via une fleche : onClick={() => setCount(count + 1)}.");
    }
    return pass("Rendu reactif.", ["o2a", "o2b"]);
  },
  // Étape 3 : état objet mis à jour par spread
  (code) => {
    const c = strip(code);
    if (!/useState\s*\(\s*\{[^}]*nom[^}]*xp[^}]*\}\s*\)/.test(c)) {
      return fail("Stocke un objet dans useState : useState({ nom: 'Lia', xp: 0 }).");
    }
    if (!/setProfil\s*\(\s*\{\s*\.\.\.\s*profil/.test(c)) {
      return fail("Mets a jour avec le spread (nouvelle reference) : setProfil({ ...profil, xp: ... }).");
    }
    return pass("Immutabilite respectee.", ["o3a", "o3b"]);
  },
  // Étape 4 : état remonté, le parent passe la valeur et le setter à l'enfant
  (code) => {
    const c = strip(code);
    if (!/\[\s*alerte\s*,\s*setAlerte\s*\]\s*=\s*useState/.test(c)) {
      return fail("Declare l'etat alerte dans le composant parent TableauDeBord.");
    }
    if (!/alerte\s*=\s*\{\s*alerte\s*\}/.test(c) || !/setAlerte\s*=\s*\{\s*setAlerte\s*\}/.test(c)) {
      return fail("Passe la valeur ET le setter en props : <Bouton alerte={alerte} setAlerte={setAlerte} />.");
    }
    return pass("Architecture reactive.", ["o4a", "o4b"], true);
  },
];
