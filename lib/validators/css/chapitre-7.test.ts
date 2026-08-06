import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";

/**
 * Chapitre 7 — pseudo-classes et pseudo-elements.
 */

/** Page complete avec le CSS donne. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background-color: #03060d; }
      ${css}
    </style>
  </head>
  <body>
    <button class="btn">Lancer</button>
    <input class="field" />
    <blockquote class="quote">Le vide n'est jamais vide.</blockquote>
    <ul><li>Sonde 1</li><li>Sonde 2</li></ul>
  </body>
</html>`;
}

describe("CSS chapitre 7 — etape 1 (survol du bouton)", () => {
  const valider = validators[0];

  it("accepte une regle .btn:hover non vide", () => {
    expect(valider(page(".btn:hover { background: #ff6b2c; }")).ok).toBe(true);
  });

  it("refuse une regle .btn:hover vide", () => {
    // Echec cible : le selecteur est bon, il ne declare rien.
    expect(valider(page(".btn:hover { }")).ok).toBe(false);
  });

  it("refuse une regle .btn sans le survol", () => {
    expect(valider(page(".btn { background: #ff6b2c; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 2 (focus visible sur le champ)", () => {
  const valider = validators[1];

  it("accepte un focus qui change la bordure", () => {
    expect(valider(page(".field:focus { border: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("accepte un focus qui pose un outline", () => {
    expect(valider(page(".field:focus { outline: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("refuse un focus sans retour visuel identifiable", () => {
    // Echec cible : la regle existe mais ne signale rien a l'oeil.
    expect(valider(page(".field:focus { color: white; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 3 (pseudo-element avant la citation)", () => {
  const valider = validators[2];

  it("accepte .quote::before avec un content", () => {
    expect(valider(page('.quote::before { content: "\\201C"; }')).ok).toBe(true);
  });

  it("refuse un pseudo-element sans content, qui ne s'affiche pas", () => {
    expect(valider(page(".quote::before { color: #ff6b2c; }")).ok).toBe(false);
  });

  it("refuse justify-content, qui n'est pas la propriete content", () => {
    // `justify-content` contient « content » precede d'un tiret : une
    // verification par \b l'accepterait, et le pseudo-element resterait vide.
    expect(valider(page(".quote::before { justify-content: center; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 4 (zebrure de la liste)", () => {
  const valider = validators[3];

  it("accepte li:nth-child(even) avec un background", () => {
    expect(valider(page("li:nth-child(even) { background: #0a1420; }")).ok).toBe(true);
  });

  it("accepte la variante odd", () => {
    expect(valider(page("li:nth-child(odd) { background: #0a1420; }")).ok).toBe(true);
  });

  it("refuse nth-child sans background, qui ne cree aucune zebrure", () => {
    expect(valider(page("li:nth-child(even) { color: white; }")).ok).toBe(false);
  });

  it("refuse un background pose sur tous les li sans distinction", () => {
    expect(valider(page("li { background: #0a1420; }")).ok).toBe(false);
  });
});
