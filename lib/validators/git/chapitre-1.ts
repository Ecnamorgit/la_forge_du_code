import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Step 1: git init + git add + git commit -m
  (code) => {
    const c = strip(code);
    if (!/git\s+init/.test(c)) {
      return fail("Initialise le depot avec git init.");
    }
    if (!/git\s+add/.test(c) || !/git\s+commit\b[\s\S]*-m/.test(c)) {
      return fail("Stage les fichiers (git add .) puis cree le commit (git commit -m \"...\").");
    }
    return pass("Depot initialise.", ["o1a", "o1b"]);
  },
  // Step 2: git status + git log --oneline
  (code) => {
    const c = strip(code);
    if (!/git\s+status/.test(c)) {
      return fail("Affiche l'etat avec git status.");
    }
    if (!/git\s+log\s+--oneline/.test(c)) {
      return fail("Affiche l'historique compact avec git log --oneline.");
    }
    return pass("Etat decrypte.", ["o2a", "o2b"]);
  },
  // Step 3: create+switch branch + merge into main
  (code) => {
    const c = strip(code);
    // `[ \t]+` et non `\s+` devant l'argument : `\s` traverse le saut de ligne,
    // donc `git checkout -b` sans nom de branche serait valide par le premier
    // mot de la commande suivante.
    if (!/git\s+(checkout\s+-b|switch\s+-c)[ \t]+\S+/.test(c)) {
      return fail("Cree et bascule sur une branche : git checkout -b feature/radar.");
    }
    if (!/git\s+merge\s+\S+/.test(c)) {
      return fail("Reviens sur main et fusionne avec git merge feature/radar.");
    }
    return pass("Fusion reussie.", ["o3a", "o3b"]);
  },
  // Step 4: remote add origin + push -u origin main
  (code) => {
    const c = strip(code);
    // Meme raison qu'a l'etape 3 : sans `[ \t]+`, un `git remote add origin`
    // sans URL serait valide par la ligne suivante.
    if (!/git\s+remote\s+add\s+origin[ \t]+\S+/.test(c)) {
      return fail("Ajoute le remote : git remote add origin <url>.");
    }
    if (!/git\s+push\s+-u\s+origin\s+main/.test(c)) {
      return fail("Pousse la branche : git push -u origin main.");
    }
    return pass("Code partage.", ["o4a", "o4b"], true);
  },
];
