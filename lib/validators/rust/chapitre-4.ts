import type { Validator } from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";
import { forcesValue, hasPrintln, isCalled, strip } from "./_utils";

const UNWRAP_MSG =
  "unwrap et expect font planter le programme sur le mauvais cas : traite-le avec match.";

export const validators: Validator[] = [
  // Step 1: Option, Some / None, both cases handled
  (code) => {
    const c = strip(code);
    if (!/\bfn\s+trouver_reserve\s*\(\s*\w+\s*:\s*u32\s*\)\s*->\s*Option\s*<\s*u32\s*>/.test(c)) {
      return fail("Signature attendue : fn trouver_reserve(secteur: u32) -> Option<u32>");
    }
    if (!/\bSome\s*\(\s*450\s*\)/.test(c) || !/\bNone\b/.test(c)) {
      return fail("Renvoie Some(450) pour le secteur 7, et None sinon.");
    }
    if (forcesValue(c)) return fail(UNWRAP_MSG, "logic");
    if (!isCalled(c, "trouver_reserve")) {
      return fail("Dans main, appelle trouver_reserve(7).");
    }
    const withMatch = /\bSome\s*\(\s*[a-z_]\w*\s*\)\s*=>/.test(c) && /\bNone\s*=>/.test(c);
    const withIfLet = /\bif\s+let\s+Some\s*\(\s*[a-z_]\w*\s*\)\s*=/.test(c) && /\belse\b/.test(c);
    if (!withMatch && !withIfLet) {
      return fail("Traite les deux cas : Some(litres) => ... et None => ...");
    }
    if (!hasPrintln(c)) return fail("Affiche la réserve ou « Secteur vide » avec println!.");
    return pass("Absence maîtrisée.", ["o1a", "o1b"]);
  },
  // Step 2: Result, Ok / Err, both outcomes handled
  (code) => {
    const c = strip(code);
    if (
      !/\bfn\s+allumer\s*\(\s*\w+\s*:\s*u32\s*\)\s*->\s*Result\s*<\s*u32\s*,\s*String\s*>/.test(c)
    ) {
      return fail("Signature attendue : fn allumer(temperature: u32) -> Result<u32, String>");
    }
    if (!/\bOk\s*\(\s*\w+\s*\)/.test(c) || !/\bErr\s*\(/.test(c)) {
      return fail('Renvoie Ok(temperature) ou Err(String::from("Forge trop froide")).');
    }
    if (forcesValue(c)) return fail(UNWRAP_MSG, "logic");
    if (!isCalled(c, "allumer")) {
      return fail("Dans main, appelle allumer(800).");
    }
    if (!/\bOk\s*\(\s*[a-z_]\w*\s*\)\s*=>/.test(c) || !/\bErr\s*\(\s*[a-z_]\w*\s*\)\s*=>/.test(c)) {
      return fail("Traite les deux issues : Ok(degres) => ... et Err(erreur) => ...");
    }
    if (!hasPrintln(c)) return fail("Affiche la température ou l'erreur avec println!.");
    return pass("Erreur sous contrôle.", ["o2a", "o2b"]);
  },
  // Step 3: the ? operator and format!
  (code) => {
    const c = strip(code);
    if (
      !/\bfn\s+forger\s*\(\s*\w+\s*:\s*u32\s*\)\s*->\s*Result\s*<\s*String\s*,\s*String\s*>/.test(c)
    ) {
      return fail("Signature attendue : fn forger(temperature: u32) -> Result<String, String>");
    }
    if (!/\ballumer\s*\([^)]*\)\s*\?/.test(c)) {
      return fail("Propage l'erreur avec ? : let degres = allumer(temperature)?;");
    }
    if (!/\bOk\s*\(\s*format!\s*\(/.test(c) && !(/\bformat!\s*\(/.test(c) && /\bOk\s*\(\s*\w+\s*\)\s*\}/.test(c))) {
      return fail('Renvoie le texte : Ok(format!("Lame forgée à {} degrés", degres))');
    }
    if (forcesValue(c)) return fail(UNWRAP_MSG, "logic");
    if (!isCalled(c, "forger")) {
      return fail("Dans main, appelle forger(1200) et traite son résultat avec match.");
    }
    if (!hasPrintln(c)) return fail("Affiche la lame ou l'erreur avec println!.");
    return pass("Erreurs propagées.", ["o3a", "o3b"]);
  },
  // Step 4: Vec and iterator chain
  (code) => {
    const c = strip(code);
    if (!/\bvec!\s*\[\s*30\s*,\s*80\s*,\s*55\s*\]/.test(c)) {
      return fail("Garde la liste de départ : let modules = vec![30, 80, 55];");
    }
    if (!/\bmodules\s*\.\s*iter\s*\(\s*\)\s*\.\s*map\s*\(\s*\|/.test(c)) {
      return fail("Transforme chaque module : modules.iter().map(|m| m * 2)");
    }
    if (!/\.\s*collect\s*(?:::\s*<[^>]*>+\s*)?\(\s*\)/.test(c)) {
      return fail("Rassemble le résultat avec .collect()");
    }
    if (!/\blet\s+renforces\b/.test(c) || !/Vec\s*<\s*(?:u32|_)\s*>/.test(c)) {
      return fail("Annote le type : let renforces: Vec<u32> = ... .collect();");
    }
    if (!/\brenforces\s*\.\s*iter\s*\(\s*\)\s*\.\s*sum\s*(?:::\s*<\s*u32\s*>\s*)?\(\s*\)/.test(c)) {
      return fail("Additionne : let total: u32 = renforces.iter().sum();");
    }
    if (!/\bprintln!\s*\([^;]*\btotal\b/.test(c)) {
      return fail("Affiche total avec println!.");
    }
    return pass("Coque sans faille.", ["o4a", "o4b"], true);
  },
];
