import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * Chapitre 4 — Flexbox : activer le conteneur, puis répartir et aligner.
 */

/** Page complète avec le CSS donné, et un .container à mettre en flex. */
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
      <div class="carte">Sonde 1</div>
      <div class="carte">Sonde 2</div>
    </div>
  </body>
</html>`;
}

describe("CSS chapitre 4 — etape 1 (activer flex)", () => {
  const valider = validators[0];

  it("accepte display: flex sur .container", () => {
    expect(valider(page(".container { display: flex; }")).ok).toBe(true);
  });

  it("refuse display: block, qui n'active pas Flexbox", () => {
    // Échec ciblé : la propriété est là, mais pas la valeur qui active flex.
    expect(valider(page(".container { display: block; }")).ok).toBe(false);
  });

  it("refuse flex pose sur un autre selecteur", () => {
    expect(valider(page(".carte { display: flex; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 4 — etape 2 (repartition horizontale)", () => {
  const valider = validators[1];

  it("accepte justify-content sur .container", () => {
    expect(
      valider(page(".container { display: flex; justify-content: space-between; }")).ok
    ).toBe(true);
  });

  it("refuse align-items, qui aligne sur l'autre axe", () => {
    expect(valider(page(".container { display: flex; align-items: center; }")).ok).toBe(
      false
    );
  });
});

describe("CSS chapitre 4 — etape 3 (alignement vertical)", () => {
  const valider = validators[2];

  it("accepte align-items sur .container", () => {
    expect(valider(page(".container { display: flex; align-items: center; }")).ok).toBe(
      true
    );
  });

  it("refuse justify-content, qui repartit sur l'axe principal", () => {
    expect(
      valider(page(".container { display: flex; justify-content: center; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapitre 4 — etape 4 (espacement entre elements)", () => {
  const valider = validators[3];

  it("accepte la propriete courte gap", () => {
    expect(valider(page(".container { display: flex; gap: 12px; }")).ok).toBe(true);
  });

  it("accepte column-gap", () => {
    expect(valider(page(".container { display: flex; column-gap: 12px; }")).ok).toBe(
      true
    );
  });

  it("refuse un margin sur les enfants, qui n'est pas la propriete demandee", () => {
    expect(valider(page(".container { display: flex; } .carte { margin: 12px; }")).ok).toBe(
      false
    );
  });
});
