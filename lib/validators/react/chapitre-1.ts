import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: function Radar() returning <div>Scan en cours</div>
  (code) => {
    const c = strip(code);
    if (!/(function\s+Radar\s*\(|const\s+Radar\s*=)/.test(c)) {
      return fail("Declare un composant nomme Radar (avec une majuscule).");
    }
    if (!/<div>[\s\S]*Scan en cours[\s\S]*<\/div>/i.test(c)) {
      return fail("Retourne <div>Scan en cours</div> en JSX (n'oublie pas le return).");
    }
    return pass("Composant initialise.", ["o1a", "o1b"]);
  },
  // Step 2: props parameter + {props.cible}
  (code) => {
    const c = strip(code);
    if (!/function\s+Radar\s*\(\s*(props|\{)/.test(c)) {
      return fail("Ajoute le parametre props (ou destructure { cible }) au composant Radar.");
    }
    if (!/\{\s*props\.cible\s*\}/.test(c) && !/\{\s*cible\s*\}/.test(c)) {
      return fail("Affiche la valeur dynamique avec les accolades : {props.cible}.");
    }
    return pass("Props recues.", ["o2a", "o2b"]);
  },
  // Step 3: conditional (ternary or &&) + <span>ALERTE</span>
  (code) => {
    const c = strip(code);
    if (!/menace\s*(\?|&&)/.test(c)) {
      return fail("Utilise une condition dans le JSX (props.menace ? ... ou props.menace && ...).");
    }
    if (!/<span>\s*ALERTE\s*<\/span>/i.test(c)) {
      return fail("Affiche <span>ALERTE</span> quand menace est true.");
    }
    return pass("Logique integree.", ["o3a", "o3b"]);
  },
  // Step 4: TableauDeBord composing two <Radar /> with props
  (code) => {
    const c = strip(code);
    if (!/(function\s+TableauDeBord\s*\(|const\s+TableauDeBord\s*=)/.test(c)) {
      return fail("Cree un composant parent nomme TableauDeBord.");
    }
    if (countMatches(c, /<Radar\b/) < 2) {
      return fail("Le TableauDeBord doit retourner DEUX composants <Radar />.");
    }
    if (!/cible\s*=\s*['"{]?\s*Lune/i.test(c) || !/cible\s*=\s*['"{]?\s*Mars/i.test(c)) {
      return fail("Passe cible='Lune' au premier Radar et cible='Mars' au second.");
    }
    return pass("Tableau operationnel.", ["o4a", "o4b"], true);
  },
];
