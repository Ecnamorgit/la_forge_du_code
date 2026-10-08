import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

/**
 * Chapitre 5 — CSS Grid.
 *
 * L'étape 2 compte les colonnes déclarées, y compris à travers `repeat()` : les
 * tests couvrent la forme développée, la forme compactée, et un repeat() qui en
 * produit trop peu.
 */

/** Page complète avec le CSS donné, et un .grid à cartographier. */
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
    <div class="grid">
      <div>Secteur 1</div>
      <div>Secteur 2</div>
      <div>Secteur 3</div>
    </div>
  </body>
</html>`;
}

describe("CSS chapitre 5 — etape 1 (activer grid)", () => {
  const valider = validators[0];

  it("accepte display: grid sur .grid", () => {
    expect(valider(page(".grid { display: grid; }")).ok).toBe(true);
  });

  it("refuse display: flex, qui est l'autre modele de mise en page", () => {
    expect(valider(page(".grid { display: flex; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 5 — etape 2 (au moins trois colonnes)", () => {
  const valider = validators[1];

  it("accepte trois pistes ecrites une par une", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }")).ok
    ).toBe(true);
  });

  it("accepte repeat(3, 1fr), qui produit trois pistes", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-columns: repeat(3, 1fr); }")).ok
    ).toBe(true);
  });

  it("refuse deux colonnes seulement", () => {
    // Échec ciblé : la propriété est correcte, le compte ne l'est pas.
    expect(
      valider(page(".grid { display: grid; grid-template-columns: 1fr 1fr; }")).ok
    ).toBe(false);
  });

  it("refuse repeat(2, 1fr), qui n'en produit que deux", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-columns: repeat(2, 1fr); }")).ok
    ).toBe(false);
  });

  it("refuse grid-template-rows a la place des colonnes", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-rows: 1fr 1fr 1fr; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapitre 5 — etape 3 (espacement de la grille)", () => {
  const valider = validators[2];

  it("accepte la propriete courte gap", () => {
    expect(valider(page(".grid { display: grid; gap: 10px; }")).ok).toBe(true);
  });

  it("accepte row-gap", () => {
    expect(valider(page(".grid { display: grid; row-gap: 10px; }")).ok).toBe(true);
  });

  it("refuse padding, qui espace le bord et non les cellules", () => {
    expect(valider(page(".grid { display: grid; padding: 10px; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 5 — etape 4 (lignes de la grille)", () => {
  const valider = validators[3];

  it("accepte grid-template-rows sur .grid", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-rows: 80px 80px; }")).ok
    ).toBe(true);
  });

  it("refuse grid-template-columns, qui trace l'autre axe", () => {
    expect(
      valider(page(".grid { display: grid; grid-template-columns: 1fr 1fr; }")).ok
    ).toBe(false);
  });
});
