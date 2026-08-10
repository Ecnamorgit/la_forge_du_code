import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";

/**
 * HTML chapitre 7 — metadonnees : encodage, description, partage, favicon.
 */

describe("HTML chapitre 7 — etape 1 (langue, encodage, viewport)", () => {
  const valider = validators[0];

  const COMPLET = `<html lang="fr"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head></html>`;

  it("accepte les trois declarations", () => {
    expect(valider(COMPLET).ok).toBe(true);
  });

  it("refuse une page sans lang", () => {
    const code = `<html><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head></html>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un viewport sans width=device-width", () => {
    // Echec cible : la balise est la, mais elle ne rend pas la page responsive.
    const code = `<html lang="fr"><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="initial-scale=1">
    </head></html>`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 7 — etape 2 (description)", () => {
  const valider = validators[1];

  it("accepte une description assez longue", () => {
    const code =
      '<meta name="description" content="Station orbitale Nebula Command : apprends le code en mission.">';
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une description trop courte", () => {
    // Echec cible : une meta presente mais inutile pour le referencement.
    expect(valider('<meta name="description" content="Nebula">').ok).toBe(false);
  });

  it("refuse l'absence de meta description", () => {
    expect(valider('<meta name="keywords" content="code, espace">').ok).toBe(false);
  });
});

describe("HTML chapitre 7 — etape 3 (partage social)", () => {
  const valider = validators[2];

  it("accepte les trois balises Open Graph", () => {
    const code = `<meta property="og:title" content="Nebula Command">
      <meta property="og:description" content="Apprends le code en mission.">
      <meta property="og:image" content="https://codeforge.space/og.png">`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse l'absence de og:image", () => {
    const code = `<meta property="og:title" content="Nebula Command">
      <meta property="og:description" content="Apprends le code en mission.">`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une og:title au contenu vide", () => {
    // Echec cible : la balise existe mais ne transporte rien.
    const code = `<meta property="og:title" content="">
      <meta property="og:description" content="Apprends le code en mission.">
      <meta property="og:image" content="https://codeforge.space/og.png">`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 7 — etape 4 (favicon)", () => {
  const valider = validators[3];

  it("accepte un lien rel=icon avec un href", () => {
    expect(valider('<link rel="icon" href="/favicon.ico">').ok).toBe(true);
  });

  it("accepte la forme historique shortcut icon", () => {
    expect(valider('<link rel="shortcut icon" href="/favicon.ico">').ok).toBe(true);
  });

  it("refuse un lien de feuille de style pris pour un favicon", () => {
    // Echec cible : le rel n'est pas celui attendu.
    expect(valider('<link rel="stylesheet" href="/style.css">').ok).toBe(false);
  });
});
