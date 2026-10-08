import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";

/**
 * Chapitre 6 — le positionnement : relative, absolute, fixed, sticky.
 *
 * Chaque étape exige un couple (valeur de position + décalage) : les cas
 * d'échec isolent l'un ou l'autre, jamais les deux à la fois.
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
    <span class="badge">3</span>
    <div class="card"><span class="ribbon">Neuf</span></div>
    <header class="topbar">Nebula Command</header>
    <h2 class="section-title">Secteur 7</h2>
  </body>
</html>`;
}

describe("CSS chapitre 6 — etape 1 (position relative avec decalage)", () => {
  const valider = validators[0];

  it("accepte position: relative accompagne d'un top", () => {
    expect(valider(page(".badge { position: relative; top: -4px; }")).ok).toBe(true);
  });

  it("refuse position: relative sans aucun decalage", () => {
    // Échec ciblé : sans décalage, `relative` ne déplace rien.
    expect(valider(page(".badge { position: relative; }")).ok).toBe(false);
  });

  it("refuse un decalage sans position: relative", () => {
    expect(valider(page(".badge { top: -4px; }")).ok).toBe(false);
  });

  it("refuse padding-top, qui n'est pas un decalage de positionnement", () => {
    // `padding-top` contient « top » précédé d'un tiret : une vérification par
    // \b le compterait comme un décalage.
    expect(valider(page(".badge { position: relative; padding-top: 4px; }")).ok).toBe(
      false
    );
  });
});

describe("CSS chapitre 6 — etape 2 (enfant absolu dans un parent relatif)", () => {
  const valider = validators[1];

  const OK = ".card { position: relative; } .ribbon { position: absolute; top: 0; right: 0; }";

  it("accepte un parent relatif et un enfant absolu ancre", () => {
    expect(valider(page(OK)).ok).toBe(true);
  });

  it("refuse quand le parent n'est pas relatif", () => {
    expect(
      valider(page(".ribbon { position: absolute; top: 0; right: 0; }")).ok
    ).toBe(false);
  });

  it("refuse quand l'enfant absolu n'est pas ancre", () => {
    expect(
      valider(page(".card { position: relative; } .ribbon { position: absolute; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapitre 6 — etape 3 (barre fixe en haut)", () => {
  const valider = validators[2];

  it("accepte position: fixed avec top: 0", () => {
    expect(valider(page(".topbar { position: fixed; top: 0; }")).ok).toBe(true);
  });

  it("accepte top: 0px, la meme valeur ecrite avec son unite", () => {
    expect(valider(page(".topbar { position: fixed; top: 0px; }")).ok).toBe(true);
  });

  it("refuse position: absolute, qui ne reste pas au defilement", () => {
    expect(valider(page(".topbar { position: absolute; top: 0; }")).ok).toBe(false);
  });

  it("refuse un top non nul, qui n'ancre pas la barre en haut", () => {
    expect(valider(page(".topbar { position: fixed; top: 20px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 6 — etape 4 (titre collant)", () => {
  const valider = validators[3];

  it("accepte position: sticky avec un top defini", () => {
    expect(valider(page(".section-title { position: sticky; top: 0; }")).ok).toBe(true);
  });

  it("accepte position: sticky avec un bottom défini", () => {
    expect(valider(page(".section-title { position: sticky; bottom: 0; }")).ok).toBe(true);
  });

  it("refuse margin-bottom, qui ne remplace pas le bottom", () => {
    expect(
      valider(page(".section-title { position: sticky; margin-bottom: 10px; }")).ok
    ).toBe(false);
  });

  it("refuse sticky sans top, qui ne colle a rien", () => {
    expect(valider(page(".section-title { position: sticky; }")).ok).toBe(false);
  });

  it("refuse position: fixed, qui sort le titre du flux", () => {
    expect(valider(page(".section-title { position: fixed; top: 0; }")).ok).toBe(false);
  });

  it("refuse margin-top, qui ne remplace pas le top exige par sticky", () => {
    expect(
      valider(page(".section-title { position: sticky; margin-top: 10px; }")).ok
    ).toBe(false);
  });
});
