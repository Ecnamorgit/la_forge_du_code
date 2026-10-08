import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Étape 1 : trois variables et un print en f-string
  (code) => {
    const c = strip(code);
    const vars =
      /nom\s*=\s*['"]Lia['"]/.test(c) &&
      /niveau\s*=\s*5/.test(c) &&
      /actif\s*=\s*True/.test(c);
    if (!vars) {
      return fail("Déclare nom = 'Lia', niveau = 5, actif = True.");
    }
    if (!/print\s*\(\s*f['"]/.test(c)) {
      return fail("Affiche avec une f-string : print(f\"Pilote {nom}, ...\").");
    }
    return pass("Python initialisé.", ["o1a", "o1b"]);
  },
  // Étape 2 : def calculer_xp, appel et print
  (code) => {
    const c = strip(code);
    if (!/def\s+calculer_xp\s*\(\s*niveau\s*,\s*bonus\s*\)\s*:/.test(c)) {
      return fail("Déclare la fonction : def calculer_xp(niveau, bonus):");
    }
    // On retire la déclaration avant de chercher un appel : elle contient
    // elle-même « calculer_xp( » et validerait une fonction jamais appelée.
    const sansDeclaration = c.replace(/def\s+calculer_xp\s*\([^)]*\)\s*:/, "");
    if (!/calculer_xp\s*\(/.test(sansDeclaration) || !/print\s*\(/.test(c)) {
      return fail("Appelle calculer_xp(5, 20) et affiche le resultat avec print.");
    }
    return pass("Fonction créée.", ["o2a", "o2b"]);
  },
  // Étape 3 : liste et for ... in enumerate
  (code) => {
    const c = strip(code);
    if (!/pilotes\s*=\s*\[[^\]]*Lia[^\]]*Max[^\]]*Eva[^\]]*\]/.test(c)) {
      return fail("Crée la liste : pilotes = ['Lia', 'Max', 'Eva'].");
    }
    if (!/for\s+\w+\s*,\s*\w+\s+in\s+enumerate\s*\(\s*pilotes\s*\)/.test(c)) {
      return fail("Parcours avec enumerate : for i, nom in enumerate(pilotes):");
    }
    return pass("Itération maîtrisée.", ["o3a", "o3b"]);
  },
  // Étape 4 : dict, lecture d'une valeur, ajout d'une clé et boucle .items()
  (code) => {
    const c = strip(code);
    if (!/pilote\s*=\s*\{[^}]*['"]nom['"]\s*:/.test(c) || !/pilote\s*\[\s*['"]niveau['"]\s*\]/.test(c)) {
      return fail("Crée le dictionnaire pilote et lis pilote['niveau'].");
    }
    if (!/pilote\s*\[\s*['"]badge['"]\s*\]\s*=/.test(c) || !/\.items\s*\(\s*\)/.test(c)) {
      return fail("Ajoute pilote['badge'] = 'gold' et itère avec .items().");
    }
    return pass("Python opérationnel.", ["o4a", "o4b"], true);
  },
];
