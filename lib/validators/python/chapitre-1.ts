import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Step 1: three variables + f-string print
  (code) => {
    const c = strip(code);
    const vars =
      /nom\s*=\s*['"]Lia['"]/.test(c) &&
      /niveau\s*=\s*5/.test(c) &&
      /actif\s*=\s*True/.test(c);
    if (!vars) {
      return fail("Declare nom = 'Lia', niveau = 5, actif = True.");
    }
    if (!/print\s*\(\s*f['"]/.test(c)) {
      return fail("Affiche avec une f-string : print(f\"Pilote {nom}, ...\").");
    }
    return pass("Python initialise.", ["o1a", "o1b"]);
  },
  // Step 2: def calculer_xp + call + print
  (code) => {
    const c = strip(code);
    if (!/def\s+calculer_xp\s*\(\s*niveau\s*,\s*bonus\s*\)\s*:/.test(c)) {
      return fail("Declare la fonction : def calculer_xp(niveau, bonus):");
    }
    if (!/calculer_xp\s*\(/.test(c) || !/print\s*\(/.test(c)) {
      return fail("Appelle calculer_xp(5, 20) et affiche le resultat avec print.");
    }
    return pass("Fonction creee.", ["o2a", "o2b"]);
  },
  // Step 3: list + for ... enumerate
  (code) => {
    const c = strip(code);
    if (!/pilotes\s*=\s*\[[^\]]*Lia[^\]]*Max[^\]]*Eva[^\]]*\]/.test(c)) {
      return fail("Cree la liste : pilotes = ['Lia', 'Max', 'Eva'].");
    }
    if (!/for\s+\w+\s*,\s*\w+\s+in\s+enumerate\s*\(\s*pilotes\s*\)/.test(c)) {
      return fail("Parcours avec enumerate : for i, nom in enumerate(pilotes):");
    }
    return pass("Iteration maitrisee.", ["o3a", "o3b"]);
  },
  // Step 4: dict + read value + add key + items loop
  (code) => {
    const c = strip(code);
    if (!/pilote\s*=\s*\{[^}]*['"]nom['"]\s*:/.test(c) || !/pilote\s*\[\s*['"]niveau['"]\s*\]/.test(c)) {
      return fail("Cree le dictionnaire pilote et lis pilote['niveau'].");
    }
    if (!/pilote\s*\[\s*['"]badge['"]\s*\]\s*=/.test(c) || !/\.items\s*\(\s*\)/.test(c)) {
      return fail("Ajoute pilote['badge'] = 'gold' et itere avec .items().");
    }
    return pass("Python operationnel.", ["o4a", "o4b"], true);
  },
];
