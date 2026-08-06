import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-10";

/**
 * Chapitre 10 — variables CSS et design system.
 */

/** Page complete avec le CSS donne. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      ${css}
    </style>
  </head>
  <body>
    <button class="btn">Lancer</button>
    <div class="card">Sonde</div>
  </body>
</html>`;
}

describe("CSS chapitre 10 — etape 1 (declarer une variable)", () => {
  const valider = validators[0];

  it("accepte --color-primary declaree dans :root", () => {
    expect(valider(page(":root { --color-primary: #00b8d4; }")).ok).toBe(true);
  });

  it("refuse une variable declaree ailleurs que dans :root", () => {
    // Echec cible : la variable existe, mais pas la ou l'etape la demande.
    expect(valider(page(".btn { --color-primary: #00b8d4; }")).ok).toBe(false);
  });

  it("refuse un autre nom de variable", () => {
    expect(valider(page(":root { --couleur: #00b8d4; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 10 — etape 2 (centraliser la couleur)", () => {
  const valider = validators[1];

  it("accepte trois usages de var() et plus aucune valeur en dur", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }
      h1 { background: var(--color-primary); }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("refuse deux usages seulement", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }`;
    expect(valider(page(css)).ok).toBe(false);
  });

  it("refuse un #00b8d4 laisse en dur hors de :root", () => {
    // Echec cible : le compte d'usages est bon, la centralisation ne l'est pas.
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }
      h1 { background: var(--color-primary); border: 1px solid #00b8d4; }`;
    expect(valider(page(css)).ok).toBe(false);
  });
});

describe("CSS chapitre 10 — etape 3 (variables d'espacement)", () => {
  const valider = validators[2];

  it("accepte --space-md declaree et utilisee en padding", () => {
    const css = `:root { --space-md: 16px; }
      .card { padding: var(--space-md); }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("accepte une variable de rayon utilisee en border-radius", () => {
    const css = `:root { --radius-md: 8px; }
      .card { border-radius: var(--radius-md); }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("refuse une variable declaree mais jamais utilisee", () => {
    const css = `:root { --space-md: 16px; }
      .card { padding: 16px; }`;
    expect(valider(page(css)).ok).toBe(false);
  });
});

describe("CSS chapitre 10 — etape 4 (theme alternatif)", () => {
  const valider = validators[3];

  it("accepte un bloc [data-theme] qui redefinit une variable", () => {
    const css = `:root { --color-primary: #00b8d4; }
      [data-theme="clair"] { --color-primary: #005f6b; }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("refuse un bloc [data-theme] qui ne redefinit aucune variable", () => {
    // Echec cible : le selecteur est bon, il ne rethematise rien.
    const css = `:root { --color-primary: #00b8d4; }
      [data-theme="clair"] { background: white; }`;
    expect(valider(page(css)).ok).toBe(false);
  });

  it("refuse une classe .theme-clair a la place de l'attribut", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .theme-clair { --color-primary: #005f6b; }`;
    expect(valider(page(css)).ok).toBe(false);
  });
});
