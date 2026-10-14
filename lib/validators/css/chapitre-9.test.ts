import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-9";

/**
 * Chapter 9 — transitions, transforms and animations.
 */

/** Full page with the given CSS. */
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

describe("CSS chapter 9 — step 1 (transition with a duration)", () => {
  const validate = validators[0];

  it("accepts a transition with a duration in seconds", () => {
    expect(validate(page(".btn { transition: all 0.3s ease; }")).ok).toBe(true);
  });

  it("rejects a transition without a duration", () => {
    // Targeted failure: the property is there, the duration is missing.
    expect(validate(page(".btn { transition: all; }")).ok).toBe(false);
  });

  it("rejects a duration in milliseconds, not covered by the instructions", () => {
    expect(validate(page(".btn { transition: all 300ms ease; }")).ok).toBe(false);
  });
});

describe("CSS chapter 9 — step 2 (transform on hover)", () => {
  const validate = validators[1];

  it("accepts transform: scale on .card hover", () => {
    expect(validate(page(".card:hover { transform: scale(1.05); }")).ok).toBe(true);
  });

  it("rejects a hover that does not transform", () => {
    expect(validate(page(".card:hover { background: #111; }")).ok).toBe(false);
  });

  it("rejects a transform set outside the hover", () => {
    expect(validate(page(".card { transform: scale(1.05); }")).ok).toBe(false);
  });
});

describe("CSS chapter 9 — step 3 (@keyframes applied)", () => {
  const validate = validators[2];

  it("accepts an @keyframes applied to .pulse", () => {
    const css = `@keyframes battement { 0% { opacity: 1; } 100% { opacity: 0.4; } }
      .pulse { animation: battement 2s infinite; }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects an @keyframes defined but never applied", () => {
    const css = `@keyframes battement { 0% { opacity: 1; } 100% { opacity: 0.4; } }
      .pulse { color: white; }`;
    expect(validate(page(css)).ok).toBe(false);
  });
});

describe("CSS chapter 9 — step 4 (infinite rotation)", () => {
  const validate = validators[3];

  const KEYFRAMES = `@keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  it("accepts the infinite keyword in the animation shorthand property", () => {
    // Form taught by the course.
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear infinite; }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("accepts animation-iteration-count: infinite", () => {
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear; animation-iteration-count: infinite; }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects an animation that runs only once", () => {
    // Targeted failure: everything is correct except the infinite repetition.
    const css = `${KEYFRAMES}
      .icon { animation: rotation 2s linear; }`;
    expect(validate(page(css)).ok).toBe(false);
  });

  it("rejects an @keyframes that does not rotate", () => {
    const css = `@keyframes fondu { from { opacity: 0; } to { opacity: 1; } }
      .icon { animation: fondu 2s linear infinite; }`;
    expect(validate(page(css)).ok).toBe(false);
  });
});
