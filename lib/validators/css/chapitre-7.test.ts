import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";

/**
 * Chapitre 7 — pseudo-classes et pseudo-éléments.
 */

/** Page complète avec le CSS donné. */
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
  const validate = validators[0];

  it("accepte une regle .btn:hover non vide", () => {
    expect(validate(page(".btn:hover { background: #ff6b2c; }")).ok).toBe(true);
  });

  it("refuse une regle .btn:hover vide", () => {
    // Échec ciblé : le sélecteur est bon, il ne déclare rien.
    expect(validate(page(".btn:hover { }")).ok).toBe(false);
  });

  it("refuse une regle .btn sans le survol", () => {
    expect(validate(page(".btn { background: #ff6b2c; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 2 (focus visible sur le champ)", () => {
  const validate = validators[1];

  it("accepte un focus qui change la bordure", () => {
    expect(validate(page(".field:focus { border: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("accepte un focus qui pose un outline", () => {
    expect(validate(page(".field:focus { outline: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("refuse un focus sans retour visuel identifiable", () => {
    // Échec ciblé : la règle existe mais ne signale rien à l'œil.
    expect(validate(page(".field:focus { color: white; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 3 (pseudo-element avant la citation)", () => {
  const validate = validators[2];

  it("accepte .quote::before avec un content", () => {
    expect(validate(page('.quote::before { content: "\\201C"; }')).ok).toBe(true);
  });

  it("refuse un pseudo-element sans content, qui ne s'affiche pas", () => {
    expect(validate(page(".quote::before { color: #ff6b2c; }")).ok).toBe(false);
  });

  it("refuse justify-content, qui n'est pas la propriete content", () => {
    // `justify-content` contient « content » précédé d'un tiret : une
    // vérification par \b l'accepterait, et le pseudo-élément resterait vide.
    expect(validate(page(".quote::before { justify-content: center; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 7 — etape 4 (zebrure de la liste)", () => {
  const validate = validators[3];

  it("accepte li:nth-child(even) avec un background", () => {
    expect(validate(page("li:nth-child(even) { background: #0a1420; }")).ok).toBe(true);
  });

  it("accepte la variante odd", () => {
    expect(validate(page("li:nth-child(odd) { background: #0a1420; }")).ok).toBe(true);
  });

  it("refuse nth-child sans background, qui ne cree aucune zebrure", () => {
    expect(validate(page("li:nth-child(even) { color: white; }")).ok).toBe(false);
  });

  it("refuse un background pose sur tous les li sans distinction", () => {
    expect(validate(page("li { background: #0a1420; }")).ok).toBe(false);
  });
});
