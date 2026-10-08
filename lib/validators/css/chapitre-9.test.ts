import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-9";

/**
 * Chapitre 9 — transitions, transforms et animations.
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
    <div class="card">Sonde</div>
    <div class="pulse">Balise</div>
    <div class="icon">Radar</div>
  </body>
</html>`;
}

describe("CSS chapitre 9 — etape 1 (transition avec duree)", () => {
  const valider = validators[0];

  it("accepte une transition avec une duree en secondes", () => {
    expect(valider(page(".btn { transition: all 0.3s ease; }")).ok).toBe(true);
  });

  it("refuse une transition sans duree", () => {
    // Échec ciblé : la propriété est là, la durée manque.
    expect(valider(page(".btn { transition: all; }")).ok).toBe(false);
  });

  it("refuse une duree en millisecondes, non couverte par l'enonce", () => {
    expect(valider(page(".btn { transition: all 300ms ease; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 9 — etape 2 (transform au survol)", () => {
  const valider = validators[1];

  it("accepte transform: scale au survol de .card", () => {
    expect(valider(page(".card:hover { transform: scale(1.05); }")).ok).toBe(true);
  });

  it("refuse un survol qui ne transforme pas", () => {
    expect(valider(page(".card:hover { background: #111; }")).ok).toBe(false);
  });

  it("refuse un transform pose hors du survol", () => {
    expect(valider(page(".card { transform: scale(1.05); }")).ok).toBe(false);
  });
});

describe("CSS chapitre 9 — etape 3 (@keyframes appliquee)", () => {
  const valider = validators[2];

  it("accepte une @keyframes appliquee a .pulse", () => {
    const css = `@keyframes battement { 0% { opacity: 1; } 100% { opacity: 0.4; } }
      .pulse { animation: battement 2s infinite; }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("refuse une @keyframes definie mais jamais appliquee", () => {
    const css = `@keyframes battement { 0% { opacity: 1; } 100% { opacity: 0.4; } }
      .pulse { color: white; }`;
    expect(valider(page(css)).ok).toBe(false);
  });
});

describe("CSS chapitre 9 — etape 4 (rotation infinie)", () => {
  const valider = validators[3];

  const KEYFRAMES = `@keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  it("accepte le mot-cle infinite dans la propriete raccourcie animation", () => {
    // Forme enseignée par le cours.
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear infinite; }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("accepte animation-iteration-count: infinite", () => {
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear; animation-iteration-count: infinite; }`;
    expect(valider(page(css)).ok).toBe(true);
  });

  it("refuse une animation qui ne tourne qu'une fois", () => {
    // Échec ciblé : tout est correct sauf le caractère infini.
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear; }`;
    expect(valider(page(css)).ok).toBe(false);
  });

  it("refuse une @keyframes qui ne fait pas tourner", () => {
    const css = `@keyframes fondu { from { opacity: 0; } to { opacity: 1; } }
      .icon { animation: fondu 2s linear infinite; }`;
    expect(valider(page(css)).ok).toBe(false);
  });
});
