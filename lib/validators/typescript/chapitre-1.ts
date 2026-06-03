import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: annotate pilote:string, niveau:number, actif:boolean
  (code) => {
    const c = strip(code);
    const ok =
      /pilote\s*:\s*string/.test(c) &&
      /niveau\s*:\s*number/.test(c) &&
      /actif\s*:\s*boolean/.test(c);
    if (!/:\s*(string|number|boolean)/.test(c)) {
      return fail("Annote chaque variable avec son type : let pilote: string = ...");
    }
    if (!ok) {
      return fail("Types attendus : pilote (string), niveau (number), actif (boolean).");
    }
    return pass("Blindage installe.", ["o1a", "o1b"]);
  },
  // Step 2: type the function params + return
  (code) => {
    const c = strip(code);
    if (!/calculerXp\s*\(\s*niveau\s*:\s*number\s*,\s*bonus\s*:\s*number\s*\)/.test(c)) {
      return fail("Type les deux parametres en number : calculerXp(niveau: number, bonus: number).");
    }
    if (!/\)\s*:\s*number/.test(c)) {
      return fail("Annote le type de retour : ): number {");
    }
    return pass("Contrat signe.", ["o2a", "o2b"]);
  },
  // Step 3: interface Pilote + const lia: Pilote
  (code) => {
    const c = strip(code);
    const hasInterface =
      /interface\s+Pilote\s*\{[\s\S]*id\s*:\s*number[\s\S]*nom\s*:\s*string[\s\S]*niveau\s*:\s*number[\s\S]*actif\s*:\s*boolean[\s\S]*\}/.test(
        c
      );
    if (!hasInterface) {
      return fail("Definis interface Pilote { id: number; nom: string; niveau: number; actif: boolean }.");
    }
    if (!/const\s+lia\s*:\s*Pilote\s*=/.test(c)) {
      return fail("Type la constante : const lia: Pilote = { ... }.");
    }
    return pass("Structure figee.", ["o3a", "o3b"]);
  },
  // Step 4: union of 3 literals + typed function param
  (code) => {
    const c = strip(code);
    if (
      !/type\s+Statut\s*=\s*['"]en_vol['"]\s*\|\s*['"]en_base['"]\s*\|\s*['"]detruit['"]/.test(c)
    ) {
      return fail("Definis : type Statut = 'en_vol' | 'en_base' | 'detruit';");
    }
    if (!/afficher\s*\(\s*statut\s*:\s*Statut\s*\)/.test(c)) {
      return fail("Type le parametre de la fonction : afficher(statut: Statut).");
    }
    return pass("Types blindes.", ["o4a", "o4b"], true);
  },
];
