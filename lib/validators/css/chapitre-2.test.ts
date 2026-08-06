import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * Chapitre 2 — les selecteurs et la couleur.
 *
 * Chaque etape a un cas passant tire du `hint` du cours, et un cas d'echec qui
 * rate sur la seule exigence de l'etape. Jamais de chaine vide comme cas
 * d'echec : elle echouerait de toute facon et ne prouverait rien.
 */

/** Enveloppe le CSS donne dans une page complete, comme le startCode du cours. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background-color: #03060d; color: white; }
      ${css}
    </style>
  </head>
  <body>
    <h1>Statut equipage</h1>
    <p class="alert">Alerte : pression instable</p>
    <p id="status">Nominal</p>
  </body>
</html>`;
}

describe("CSS chapitre 2 — etape 1 (selecteur de classe)", () => {
  const valider = validators[0];

  it("accepte une regle .alert { color }", () => {
    expect(valider(page(".alert { color: red; }")).ok).toBe(true);
  });

  it("refuse une regle qui cible la balise au lieu de la classe", () => {
    // Echec cible : il y a bien un color sur un <p>, mais pas sur .alert.
    expect(valider(page("p { color: red; }")).ok).toBe(false);
  });

  it("refuse un document sans balise <style>", () => {
    expect(valider("<html><body><h1>x</h1></body></html>").ok).toBe(false);
  });

  it("refuse background-color, qui n'est pas la propriete demandee", () => {
    // L'etape demande la couleur du TEXTE. `background-color` contient le mot
    // « color » : si la verification se contente d'un \b, elle l'accepte a tort.
    expect(valider(page(".alert { background-color: red; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 2 — etape 2 (selecteur d'id)", () => {
  const valider = validators[1];

  it("accepte une regle #status { color }", () => {
    expect(valider(page("#status { color: cyan; }")).ok).toBe(true);
  });

  it("refuse une classe .status a la place de l'id", () => {
    expect(valider(page(".status { color: cyan; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 2 — etape 3 (couleur hex ou rgb)", () => {
  const valider = validators[2];

  it("accepte un hexadecimal a six chiffres", () => {
    expect(valider(page("h1 { color: #ff6b2c; }")).ok).toBe(true);
  });

  it("accepte la notation rgb()", () => {
    expect(valider(page("h1 { color: rgb(255, 107, 44); }")).ok).toBe(true);
  });

  it("refuse un nom de couleur, qui n'est ni hex ni rgb", () => {
    expect(valider(page("h1 { color: orange; }")).ok).toBe(false);
  });

  it("refuse un canal rgb hors bornes", () => {
    expect(valider(page("h1 { color: rgb(300, 0, 0); }")).ok).toBe(false);
  });
});

describe("CSS chapitre 2 — etape 4 (typographie sur deux selecteurs)", () => {
  const valider = validators[3];

  it("accepte text-align sur h1 et font-weight sur .alert", () => {
    expect(
      valider(page("h1 { text-align: center; } .alert { font-weight: bold; }")).ok
    ).toBe(true);
  });

  it("refuse quand seul text-align est pose", () => {
    expect(valider(page("h1 { text-align: center; }")).ok).toBe(false);
  });

  it("refuse quand seul font-weight est pose", () => {
    expect(valider(page(".alert { font-weight: bold; }")).ok).toBe(false);
  });
});
