import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-10";

/**
 * Chapter 10 — CSS variables and design system.
 */

/** Full page with the given CSS. */
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

describe("CSS chapter 10 — step 1 (declare a variable)", () => {
  const validate = validators[0];

  it("accepts --color-primary declared in :root", () => {
    expect(validate(page(":root { --color-primary: #00b8d4; }")).ok).toBe(true);
  });

  it("rejects a variable declared somewhere other than :root", () => {
    // Targeted failure: the variable exists, but not where the step asks for it.
    expect(validate(page(".btn { --color-primary: #00b8d4; }")).ok).toBe(false);
  });

  it("rejects a different variable name", () => {
    expect(validate(page(":root { --couleur: #00b8d4; }")).ok).toBe(false);
  });
});

describe("CSS chapter 10 — step 2 (centralize the color)", () => {
  const validate = validators[1];

  it("accepts three uses of var() and no hard-coded value left", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }
      h1 { background: var(--color-primary); }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects only two uses", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }`;
    expect(validate(page(css)).ok).toBe(false);
  });

  it("rejects a #00b8d4 left hard-coded outside :root", () => {
    // Targeted failure: the usage count is right, the centralization is not.
    const css = `:root { --color-primary: #00b8d4; }
      .btn { color: var(--color-primary); }
      .card { border-color: var(--color-primary); }
      h1 { background: var(--color-primary); border: 1px solid #00b8d4; }`;
    expect(validate(page(css)).ok).toBe(false);
  });
});

describe("CSS chapter 10 — step 3 (spacing variables)", () => {
  const validate = validators[2];

  it("accepts --space-md declared and used for padding", () => {
    const css = `:root { --space-md: 16px; }
      .card { padding: var(--space-md); }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("accepts a radius variable used for border-radius", () => {
    const css = `:root { --radius-md: 8px; }
      .card { border-radius: var(--radius-md); }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects a variable that is declared but never used", () => {
    const css = `:root { --space-md: 16px; }
      .card { padding: 16px; }`;
    expect(validate(page(css)).ok).toBe(false);
  });
});

describe("CSS chapter 10 — step 4 (alternate theme)", () => {
  const validate = validators[3];

  it("accepts a [data-theme] block that redefines a variable", () => {
    const css = `:root { --color-primary: #00b8d4; }
      [data-theme="clair"] { --color-primary: #005f6b; }`;
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects a [data-theme] block that redefines no variable", () => {
    // Targeted failure: the selector is right, but it re-themes nothing.
    const css = `:root { --color-primary: #00b8d4; }
      [data-theme="clair"] { background: white; }`;
    expect(validate(page(css)).ok).toBe(false);
  });

  it("rejects a .theme-clair class instead of the attribute", () => {
    const css = `:root { --color-primary: #00b8d4; }
      .theme-clair { --color-primary: #005f6b; }`;
    expect(validate(page(css)).ok).toBe(false);
  });
});
