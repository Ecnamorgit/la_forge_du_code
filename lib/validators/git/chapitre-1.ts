import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Step 1: git init, git add and git commit -m
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
  // Step 2: git status and git log --oneline
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
  // Step 3: create a branch and switch to it, then merge it
  (code) => {
    const c = strip(code);
    // `[ \t]+` rather than `\s+` before the argument: `\s` crosses the line
    // break, so `git checkout -b` with no name would be validated by the next command.
    if (!/git\s+(checkout\s+-b|switch\s+-c)[ \t]+\S+/.test(c)) {
      return fail("Crée et bascule sur une branche : git checkout -b feature/radar.");
    }
    if (!/git\s+merge\s+\S+/.test(c)) {
      return fail("Reviens sur main et fusionne avec git merge feature/radar.");
    }
    return pass("Fusion réussie.", ["o3a", "o3b"]);
  },
  // Step 4: git remote add origin and git push -u origin main
  (code) => {
    const c = strip(code);
    // Same reason as in step 3: without `[ \t]+`, a `git remote add origin`
    // with no URL would be validated by the next line.
    if (!/git\s+remote\s+add\s+origin[ \t]+\S+/.test(c)) {
      return fail("Ajoute le remote : git remote add origin <url>.");
    }
    if (!/git\s+push\s+-u\s+origin\s+main/.test(c)) {
      return fail("Pousse la branche : git push -u origin main.");
    }
    return pass("Code partagé.", ["o4a", "o4b"], true);
  },
];
