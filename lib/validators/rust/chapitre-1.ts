import type { Validator } from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";
import { hasMain, hasPrintln, hasPrintlnWithoutBang, isCalled, strip } from "./_utils";

export const validators: Validator[] = [
  // Step 1: fn main and println!("Forge en ligne")
  (code) => {
    const c = strip(code);
    if (!hasMain(c)) {
      return fail("Garde la fonction d'entrée : fn main() { ... }", "structure");
    }
    if (!hasPrintln(c)) {
      if (hasPrintlnWithoutBang(c)) {
        return fail("println! est une macro : n'oublie pas le ! avant la parenthèse.", "syntax");
      }
      return fail('Affiche le message avec println!("...");');
    }
    if (!/\bprintln!\s*\(\s*"Forge en ligne"\s*\)/.test(c)) {
      return fail('Le message doit être exactement : println!("Forge en ligne");');
    }
    return pass("Forge en ligne.", ["o1a", "o1b"]);
  },
  // Step 2: let, let mut, reassignment and println! with placeholders
  (code) => {
    const c = strip(code);
    if (!/\blet\s+alliage\s*(?::\s*&\s*str\s*)?=\s*"titane"/.test(c)) {
      return fail('Déclare la variable immuable : let alliage = "titane";');
    }
    if (/\blet\s+mut\s+alliage\b/.test(c)) {
      return fail("alliage ne change jamais : déclare-la sans mut.", "logic");
    }
    if (!/\blet\s+mut\s+temperature\s*(?::\s*\w+\s*)?=\s*800\b/.test(c)) {
      if (/\blet\s+temperature\b/.test(c)) {
        return fail(
          "Sans mut, temperature est immuable : écris let mut temperature = 800;",
          "logic"
        );
      }
      return fail("Déclare la variable mutable : let mut temperature = 800;");
    }
    if (!/^\s*temperature\s*=\s*1200\s*;/m.test(c)) {
      return fail("Fais chauffer la forge : temperature = 1200;");
    }
    const printsBoth =
      /\bprintln!\s*\([^;]*\balliage\b[^;]*\btemperature\b/.test(c) ||
      /\bprintln!\s*\([^;]*\btemperature\b[^;]*\balliage\b/.test(c) ||
      (/\bprintln!\s*\([^;]*\balliage\b/.test(c) && /\bprintln!\s*\([^;]*\btemperature\b/.test(c));
    if (!printsBoth || !/\bprintln!\s*\(\s*"[^"]*\{/.test(c)) {
      return fail('Affiche les deux valeurs : println!("{} {}", alliage, temperature);');
    }
    return pass("Alliage stable.", ["o2a", "o2b"]);
  },
  // Step 3: typed function, called and printed
  (code) => {
    const c = strip(code);
    if (
      !/\bfn\s+calculer_poussee\s*\(\s*masse\s*:\s*u32\s*,\s*acceleration\s*:\s*u32\s*,?\s*\)\s*->\s*u32/.test(
        c
      )
    ) {
      return fail(
        "Signature attendue : fn calculer_poussee(masse: u32, acceleration: u32) -> u32"
      );
    }
    if (!/masse\s*\*\s*acceleration|acceleration\s*\*\s*masse/.test(c)) {
      return fail("La fonction doit renvoyer masse * acceleration.", "logic");
    }
    if (/(?:masse\s*\*\s*acceleration|acceleration\s*\*\s*masse)\s*;/.test(c) && !/\breturn\b/.test(c)) {
      return fail(
        "Pas de point-virgule après la dernière expression : c'est elle qui est renvoyée.",
        "syntax"
      );
    }
    if (!isCalled(c, "calculer_poussee")) {
      return fail("Appelle la fonction dans main : calculer_poussee(120, 3)");
    }
    if (!hasPrintln(c)) {
      return fail("Affiche le résultat avec println!.");
    }
    return pass("Outil forgé.", ["o3a", "o3b"]);
  },
  // Step 4: if as an expression and a for loop over 1..=3
  (code) => {
    const c = strip(code);
    if (
      !/\blet\s+etat\s*(?::[^=]+)?=\s*if\b[^{]*\{[^}]*"fusion"[^}]*\}\s*else\s*\{[^}]*"solide"[^}]*\}/.test(
        c
      )
    ) {
      return fail(
        'Range le résultat du if dans etat : let etat = if temperature > 1000 { "fusion" } else { "solide" };'
      );
    }
    if (!/\bfor\s+\w+\s+in\s+1\s*\.\.=\s*3\b/.test(c)) {
      if (/\bfor\s+\w+\s+in\s+1\s*\.\.\s*3\b/.test(c)) {
        return fail("1..3 s'arrête à 2 : utilise l'intervalle inclusif 1..=3.", "logic");
      }
      return fail("Ajoute la boucle : for coup in 1..=3 { ... }");
    }
    if (!/\bprintln!\s*\([^;]*\betat\b/.test(c)) {
      return fail("Affiche etat avec println!.");
    }
    if (!/\bprintln!\s*\(\s*"[^"]*marteau[^"]*\{/i.test(c)) {
      return fail('Dans la boucle, affiche : println!("Coup de marteau n°{}", coup);');
    }
    return pass("Forge allumée.", ["o4a", "o4b"], true);
  },
];
