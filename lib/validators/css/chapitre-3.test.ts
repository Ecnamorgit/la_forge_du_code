import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * Chapitre 3 — le modèle de boîte : dimensions, padding, margin, border.
 *
 * Les étapes 2 et 3 acceptent la propriété courte comme les quatre variantes
 * directionnelles ; les tests couvrent les deux formes.
 */

/** Page complète avec le CSS donné, et un élément .module à styler. */
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
  const validate = validators[0];

  it("accepte width et height sur .module", () => {
    expect(validate(page(".module { width: 200px; height: 120px; }")).ok).toBe(true);
  });

  it("refuse width seul", () => {
    // Échec ciblé : l'étape demande les deux dimensions.
    expect(validate(page(".module { width: 200px; }")).ok).toBe(false);
  });

  it("refuse height seul", () => {
    expect(validate(page(".module { height: 120px; }")).ok).toBe(false);
  });

  it("refuse des dimensions posees sur un autre selecteur", () => {
    expect(validate(page("div { width: 200px; height: 120px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 2 (padding)", () => {
  const validate = validators[1];

  it("accepte la propriete courte padding", () => {
    expect(validate(page(".module { padding: 16px; }")).ok).toBe(true);
  });

  it("accepte une variante directionnelle padding-left", () => {
    expect(validate(page(".module { padding-left: 16px; }")).ok).toBe(true);
  });

  it("refuse margin, qui pousse depuis l'exterieur et non l'interieur", () => {
    expect(validate(page(".module { margin: 16px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 3 (margin)", () => {
  const validate = validators[2];

  it("accepte la propriete courte margin", () => {
    expect(validate(page(".module { margin: 24px; }")).ok).toBe(true);
  });

  it("accepte une variante directionnelle margin-top", () => {
    expect(validate(page(".module { margin-top: 24px; }")).ok).toBe(true);
  });

  it("refuse padding, qui n'ecarte pas les modules entre eux", () => {
    expect(validate(page(".module { padding: 24px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 3 — etape 4 (bordure)", () => {
  const validate = validators[3];

  it("accepte une border visible", () => {
    expect(validate(page(".module { border: 2px solid #ff6b2c; }")).ok).toBe(true);
  });

  it("refuse border: none, qui n'affiche aucune bordure", () => {
    expect(validate(page(".module { border: none; }")).ok).toBe(false);
  });

  it("refuse border-radius, qui arrondit sans tracer de bordure", () => {
    expect(validate(page(".module { border-radius: 8px; }")).ok).toBe(false);
  });
});
