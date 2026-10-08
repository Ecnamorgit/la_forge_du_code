import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Chapitre 1 — brancher une feuille de style et poser les premières règles.
 *
 * Chaque étape a un cas passant tiré du `hint` du cours, et un cas d'échec qui
 * rate sur la seule exigence de l'étape.
 */

/** Page complète avec le CSS donné dans un <style> placé dans le <head>. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>Console</title>
    <style>
      ${css}
    </style>
  </head>
  <body>
    <h1>Statut equipage</h1>
    <p>Tous les systemes sont nominaux.</p>
  </body>
</html>`;
}

describe("CSS chapitre 1 — etape 1 (<style> dans le <head>)", () => {
  const valider = validators[0];

  it("accepte un <style> place dans le <head>", () => {
    expect(valider(page("h1 { color: white; }")).ok).toBe(true);
  });

  it("refuse un <style> place hors du <head>", () => {
    // Échec ciblé : la balise existe, mais pas là où l'étape la demande.
    const code = `<!DOCTYPE html>
<html>
  <head><title>Console</title></head>
  <body>
    <style>h1 { color: white; }</style>
    <h1>Statut</h1>
  </body>
</html>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un document sans <head>", () => {
    expect(valider("<html><body><h1>Statut</h1></body></html>").ok).toBe(false);
  });
});

describe("CSS chapitre 1 — etape 2 (couleur du titre)", () => {
  const valider = validators[1];

  it("accepte une regle h1 { color }", () => {
    expect(valider(page("h1 { color: #ff6b2c; }")).ok).toBe(true);
  });

  it("refuse background-color, qui n'est pas la couleur du texte", () => {
    expect(valider(page("h1 { background-color: #ff6b2c; }")).ok).toBe(false);
  });

  it("refuse une couleur posee sur un autre selecteur", () => {
    expect(valider(page("p { color: #ff6b2c; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 1 — etape 3 (fond de la page)", () => {
  const valider = validators[2];

  it("accepte une regle body { background-color }", () => {
    expect(valider(page("body { background-color: #03060d; }")).ok).toBe(true);
  });

  it("refuse color seul, qui n'est pas le fond", () => {
    expect(valider(page("body { color: white; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 1 — etape 4 (taille du texte)", () => {
  const valider = validators[3];

  it("accepte une regle p { font-size }", () => {
    expect(valider(page("p { font-size: 18px; }")).ok).toBe(true);
  });

  it("refuse font-size pose sur le titre au lieu du paragraphe", () => {
    expect(valider(page("h1 { font-size: 18px; }")).ok).toBe(false);
  });

  it("refuse font-weight, qui n'est pas la taille", () => {
    expect(valider(page("p { font-weight: bold; }")).ok).toBe(false);
  });
});
