import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";

/**
 * Chapter 8 — responsive: fluid widths, media queries, clamp().
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
    <div class="container">
      <h1>Statut equipage</h1>
      <div class="grid"><div>A</div><div>B</div><div>C</div></div>
    </div>
  </body>
</html>`;
}

describe("CSS chapter 8 — step 1 (fluid width)", () => {
  const validate = validators[0];

  it("accepts max-width on .container", () => {
    expect(validate(page(".container { max-width: 800px; }")).ok).toBe(true);
  });

  it("accepts max-width together with width: 100%", () => {
    expect(validate(page(".container { max-width: 800px; width: 100%; }")).ok).toBe(true);
  });

  it("rejects a width left hard-coded at 800px", () => {
    // Targeted failure: max-width is there, but the fixed width cancels the fluidity.
    expect(validate(page(".container { max-width: 800px; width: 800px; }")).ok).toBe(false);
  });

  it("rejects width alone, without max-width", () => {
    expect(validate(page(".container { width: 100%; }")).ok).toBe(false);
  });
});

describe("CSS chapter 8 — step 2 (media query on the heading)", () => {
  const validate = validators[1];

  it("accepts a media query that redefines font-size on h1", () => {
    const css = "@media (max-width: 600px) { h1 { font-size: 24px; } }";
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects a media query that does not touch the h1", () => {
    const css = "@media (max-width: 600px) { .container { padding: 8px; } }";
    expect(validate(page(css)).ok).toBe(false);
  });

  it("rejects a font-size on h1 set outside any media query", () => {
    expect(validate(page("h1 { font-size: 24px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 8 — step 3 (grid collapsed to one column)", () => {
  const validate = validators[2];

  it("accepts .grid reduced to one column in a media query", () => {
    const css = "@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }";
    expect(validate(page(css)).ok).toBe(true);
  });

  it("rejects a media query that leaves two columns", () => {
    const css = "@media (max-width: 600px) { .grid { grid-template-columns: 1fr 1fr; } }";
    expect(validate(page(css)).ok).toBe(false);
  });

  it("rejects a single column set outside a media query", () => {
    expect(validate(page(".grid { grid-template-columns: 1fr; }")).ok).toBe(false);
  });
});

describe("CSS chapter 8 — step 4 (fluid typography with clamp)", () => {
  const validate = validators[3];

  it("accepts clamp() with a vw unit", () => {
    expect(validate(page("h1 { font-size: clamp(24px, 4vw, 48px); }")).ok).toBe(true);
  });

  it("rejects clamp() without a viewport-relative unit", () => {
    // Targeted failure: the function is there, but nothing varies with the screen.
    expect(validate(page("h1 { font-size: clamp(24px, 32px, 48px); }")).ok).toBe(false);
  });

  it("rejects a fixed size, without clamp()", () => {
    expect(validate(page("h1 { font-size: 32px; }")).ok).toBe(false);
  });
});
