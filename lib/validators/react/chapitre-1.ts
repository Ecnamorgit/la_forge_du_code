import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : function Radar() qui renvoie <div>Scan en cours</div>
  (code) => {
    const c = strip(code);
    if (!/(function\s+Radar\s*\(|const\s+Radar\s*=)/.test(c)) {
      return fail("Déclare un composant nommé Radar (avec une majuscule).");
    }
    if (!/<div>[\s\S]*Scan en cours[\s\S]*<\/div>/i.test(c)) {
      return fail("Retourne <div>Scan en cours</div> en JSX (n'oublie pas le return).");
    }
    return pass("Composant initialisé.", ["o1a", "o1b"]);
  },
  // Étape 2 : paramètre props et {props.cible}
  (code) => {
    const c = strip(code);
    if (!/function\s+Radar\s*\(\s*(props|\{)/.test(c)) {
      return fail("Ajoute le paramètre props (ou destructure { cible }) au composant Radar.");
    }
    if (!/\{\s*props\.cible\s*\}/.test(c) && !/\{\s*cible\s*\}/.test(c)) {
      return fail("Affiche la valeur dynamique avec les accolades : {props.cible}.");
    }
    return pass("Props reçues.", ["o2a", "o2b"]);
  },
  // Étape 3 : condition (ternaire ou &&) et <span>ALERTE</span>
  (code) => {
    const c = strip(code);
    if (!/menace\s*(\?|&&)/.test(c)) {
      return fail("Utilise une condition dans le JSX (props.menace ? ... ou props.menace && ...).");
    }
    if (!/<span>\s*ALERTE\s*<\/span>/i.test(c)) {
      return fail("Affiche <span>ALERTE</span> quand menace est true.");
    }
    return pass("Logique intégrée.", ["o3a", "o3b"]);
  },
  // Étape 4 : TableauDeBord compose deux <Radar /> avec des props
  (code) => {
    const c = strip(code);
    if (!/(function\s+TableauDeBord\s*\(|const\s+TableauDeBord\s*=)/.test(c)) {
      return fail("Crée un composant parent nommé TableauDeBord.");
    }
    if (countMatches(c, /<Radar\b/) < 2) {
      return fail("Le TableauDeBord doit retourner DEUX composants <Radar />.");
    }
    if (!/cible\s*=\s*['"{]?\s*Lune/i.test(c) || !/cible\s*=\s*['"{]?\s*Mars/i.test(c)) {
      return fail("Passe cible='Lune' au premier Radar et cible='Mars' au second.");
    }
    return pass("Tableau opérationnel.", ["o4a", "o4b"], true);
  },
];
