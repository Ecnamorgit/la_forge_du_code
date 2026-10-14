import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";

/**
 * Chapitre 8 — responsive : largeurs fluides, media queries, clamp().
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
    <div class="container">
      <h1>Statut equipage</h1>
      <div class="grid"><div>A</div><div>B</div><div>C</div></div>
    </div>
  </body>
</html>`;
}

describe("CSS chapitre 8 — etape 1 (largeur fluide)", () => {
  const validate = validators[0];

  it("accepte max-width sur .container", () => {
    expect(validate(page(".container { max-width: 800px; }")).ok).toBe(true);
  });

  it("accepte max-width accompagne de width: 100%", () => {
    expect(validate(page(".container { max-width: 800px; width: 100%; }")).ok).toBe(true);
  });

  it("refuse une largeur figee a 800px laissee en dur", () => {
    // Échec ciblé : max-width est là, mais le width figé annule la fluidité.
    expect(validate(page(".container { max-width: 800px; width: 800px; }")).ok).toBe(false);
  });

  it("refuse width seul, sans max-width", () => {
    expect(validate(page(".container { width: 100%; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 8 — etape 2 (media query sur le titre)", () => {
  const validate = validators[1];

  it("accepte une media query qui redefinit font-size sur h1", () => {
    const css = "@media (max-width: 600px) { h1 { font-size: 24px; } }";
    expect(validate(page(css)).ok).toBe(true);
  });

  it("refuse une media query qui ne touche pas au h1", () => {
    const css = "@media (max-width: 600px) { .container { padding: 8px; } }";
    expect(validate(page(css)).ok).toBe(false);
  });

  it("refuse un font-size sur h1 pose hors de toute media query", () => {
    expect(validate(page("h1 { font-size: 24px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 8 — etape 3 (grille repliee en une colonne)", () => {
  const validate = validators[2];

  it("accepte .grid ramene a une colonne dans une media query", () => {
    const css = "@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }";
    expect(validate(page(css)).ok).toBe(true);
  });

  it("refuse une media query qui laisse deux colonnes", () => {
    const css = "@media (max-width: 600px) { .grid { grid-template-columns: 1fr 1fr; } }";
    expect(validate(page(css)).ok).toBe(false);
  });

  it("refuse une colonne unique posee hors media query", () => {
    expect(validate(page(".grid { grid-template-columns: 1fr; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 8 — etape 4 (typographie fluide au clamp)", () => {
  const validate = validators[3];

  it("accepte clamp() avec une unite vw", () => {
    expect(validate(page("h1 { font-size: clamp(24px, 4vw, 48px); }")).ok).toBe(true);
  });

  it("refuse clamp() sans unite relative au viewport", () => {
    // Échec ciblé : la fonction est là, mais rien ne varie avec l'écran.
    expect(validate(page("h1 { font-size: clamp(24px, 32px, 48px); }")).ok).toBe(false);
  });

  it("refuse une taille fixe, sans clamp()", () => {
    expect(validate(page("h1 { font-size: 32px; }")).ok).toBe(false);
  });
});
