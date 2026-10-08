import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Étape 1 : git init, git add et git commit -m
  (code) => {
    const c = strip(code);
    if (!/git\s+init/.test(c)) {
      return fail("Initialise le dépôt avec git init.");
    }
    if (!/git\s+add/.test(c) || !/git\s+commit\b[\s\S]*-m/.test(c)) {
      return fail("Stage les fichiers (git add .) puis crée le commit (git commit -m \"...\").");
    }
    return pass("Dépôt initialisé.", ["o1a", "o1b"]);
  },
  // Étape 2 : git status et git log --oneline
  (code) => {
    const c = strip(code);
    if (!/git\s+status/.test(c)) {
      return fail("Affiche l'état avec git status.");
    }
    if (!/git\s+log\s+--oneline/.test(c)) {
      return fail("Affiche l'historique compact avec git log --oneline.");
    }
    return pass("État décrypté.", ["o2a", "o2b"]);
  },
  // Étape 3 : créer une branche et y basculer, puis la fusionner
  (code) => {
    const c = strip(code);
    // `[ \t]+` plutôt que `\s+` devant l'argument : `\s` traverse le saut de
    // ligne, et `git checkout -b` sans nom serait validé par la commande suivante.
    if (!/git\s+(checkout\s+-b|switch\s+-c)[ \t]+\S+/.test(c)) {
      return fail("Crée et bascule sur une branche : git checkout -b feature/radar.");
    }
    if (!/git\s+merge\s+\S+/.test(c)) {
      return fail("Reviens sur main et fusionne avec git merge feature/radar.");
    }
    return pass("Fusion réussie.", ["o3a", "o3b"]);
  },
  // Étape 4 : git remote add origin et git push -u origin main
  (code) => {
    const c = strip(code);
    // Même raison qu'à l'étape 3 : sans `[ \t]+`, un `git remote add origin`
    // sans URL serait validé par la ligne suivante.
    if (!/git\s+remote\s+add\s+origin[ \t]+\S+/.test(c)) {
      return fail("Ajoute le remote : git remote add origin <url>.");
    }
    if (!/git\s+push\s+-u\s+origin\s+main/.test(c)) {
      return fail("Pousse la branche : git push -u origin main.");
    }
    return pass("Code partagé.", ["o4a", "o4b"], true);
  },
];
