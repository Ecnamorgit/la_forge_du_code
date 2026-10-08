import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Git chapitre 1 — étapes 2 à 4.
 *
 * L'étape 1 est déjà couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Git — etape 2 (etat et historique)", () => {
  const valider = validators[1];

  it("accepte git status suivi de git log --oneline", () => {
    expect(valider("git status\ngit log --oneline").ok).toBe(true);
  });

  it("refuse git log sans --oneline", () => {
    // Échec ciblé : l'étape enseigne l'historique compact.
    expect(valider("git status\ngit log").ok).toBe(false);
  });

  it("refuse un historique sans etat prealable", () => {
    expect(valider("git log --oneline").ok).toBe(false);
  });
});

describe("Git — etape 3 (brancher puis fusionner)", () => {
  const valider = validators[2];

  it("accepte checkout -b puis merge", () => {
    expect(
      valider("git checkout -b feature/radar\ngit checkout main\ngit merge feature/radar").ok
    ).toBe(true);
  });

  it("accepte la forme moderne switch -c", () => {
    expect(
      valider("git switch -c feature/radar\ngit switch main\ngit merge feature/radar").ok
    ).toBe(true);
  });

  it("refuse une branche creee mais jamais fusionnee", () => {
    expect(valider("git checkout -b feature/radar").ok).toBe(false);
  });

  it("refuse un simple changement de branche, sans creation", () => {
    expect(valider("git checkout main\ngit merge feature/radar").ok).toBe(false);
  });

  it("refuse checkout -b sans nom de branche", () => {
    // Le nom doit être sur la même ligne : `\s+` traverserait le saut de ligne
    // et prendrait la commande suivante pour le nom de la branche.
    expect(valider("git checkout -b\ngit merge feature/radar").ok).toBe(false);
  });
});

describe("Git — etape 4 (publier sur un remote)", () => {
  const valider = validators[3];

  it("accepte remote add puis push -u origin main", () => {
    expect(
      valider(
        "git remote add origin https://github.com/lia/nebula.git\ngit push -u origin main"
      ).ok
    ).toBe(true);
  });

  it("refuse un push sans -u, qui n'etablit pas le suivi", () => {
    expect(
      valider(
        "git remote add origin https://github.com/lia/nebula.git\ngit push origin main"
      ).ok
    ).toBe(false);
  });

  it("refuse un remote add sans url", () => {
    expect(valider("git remote add origin\ngit push -u origin main").ok).toBe(false);
  });
});
