import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * Chapitre 3 — le modele de boite : dimensions, padding, margin, border.
 *
 * Les etapes 2 et 3 acceptent la propriete courte comme les quatre variantes
 * directionnelles ; les tests couvrent les deux formes, sans quoi une
 * regression sur les variantes passerait inapercue.
 */

/** Page complete avec le CSS donne, et un element .module a styler. */
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
    <div class="module">Module de survie</div>
  </body>
</html>`;
}

describe("CSS chapitre 3 — etape 1 (dimensions)", () => {
  const valider = validators[0];

  it("accepte width et height sur .module", () => {
    expect(valider(page(".module { width: 200px; height: 120px; }")).ok).toBe(true);
  });

  it("refuse width seul", () => {
    // Echec cible : l'etape demande les deux dimensions.
    expect(valider(page(".module { width: 200px; }")).ok).toBe(false);
  });

  it("refuse height seul", () => {
    expect(valider(page(".module { height: 120px; }")).ok).toBe(false);
  });

  it("refuse des dimensions posees sur un autre selecteur", () => {
    expect(valider(page("div { width: 200px; height: 120px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 2 (padding)", () => {
  const valider = validators[1];

  it("accepte la propriete courte padding", () => {
    expect(valider(page(".module { padding: 16px; }")).ok).toBe(true);
  });

  it("accepte une variante directionnelle padding-left", () => {
    expect(valider(page(".module { padding-left: 16px; }")).ok).toBe(true);
  });

  it("refuse margin, qui pousse depuis l'exterieur et non l'interieur", () => {
    expect(valider(page(".module { margin: 16px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 3 (margin)", () => {
  const valider = validators[2];

  it("accepte la propriete courte margin", () => {
    expect(valider(page(".module { margin: 24px; }")).ok).toBe(true);
  });

  it("accepte une variante directionnelle margin-top", () => {
    expect(valider(page(".module { margin-top: 24px; }")).ok).toBe(true);
  });

  it("refuse padding, qui n'ecarte pas les modules entre eux", () => {
    expect(valider(page(".module { padding: 24px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 4 (bordure)", () => {
  const valider = validators[3];

  it("accepte une border visible", () => {
    expect(valider(page(".module { border: 2px solid #ff6b2c; }")).ok).toBe(true);
  });

  it("refuse border: none, qui n'affiche aucune bordure", () => {
    expect(valider(page(".module { border: none; }")).ok).toBe(false);
  });

  it("refuse border-radius, qui arrondit sans tracer de bordure", () => {
    expect(valider(page(".module { border-radius: 8px; }")).ok).toBe(false);
  });
});
