import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * Chapter 3 — the box model: dimensions, padding, margin, border.
 *
 * Steps 2 and 3 accept the shorthand property as well as the four directional
 * variants; the tests cover both forms.
 */

/** Full page with the given CSS, and a .module element to style. */
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

describe("CSS chapter 3 — step 1 (dimensions)", () => {
  const validate = validators[0];

  it("accepts width and height on .module", () => {
    expect(validate(page(".module { width: 200px; height: 120px; }")).ok).toBe(true);
  });

  it("rejects width alone", () => {
    // Targeted failure: the step asks for both dimensions.
    expect(validate(page(".module { width: 200px; }")).ok).toBe(false);
  });

  it("rejects height alone", () => {
    expect(validate(page(".module { height: 120px; }")).ok).toBe(false);
  });

  it("rejects dimensions set on another selector", () => {
    expect(validate(page("div { width: 200px; height: 120px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 3 — step 2 (padding)", () => {
  const validate = validators[1];

  it("accepts the padding shorthand property", () => {
    expect(validate(page(".module { padding: 16px; }")).ok).toBe(true);
  });

  it("accepts a directional variant, padding-left", () => {
    expect(validate(page(".module { padding-left: 16px; }")).ok).toBe(true);
  });

  it("rejects margin, which pushes from the outside rather than the inside", () => {
    expect(validate(page(".module { margin: 16px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 3 — step 3 (margin)", () => {
  const validate = validators[2];

  it("accepts the margin shorthand property", () => {
    expect(validate(page(".module { margin: 24px; }")).ok).toBe(true);
  });

  it("accepts a directional variant, margin-top", () => {
    expect(validate(page(".module { margin-top: 24px; }")).ok).toBe(true);
  });

  it("rejects padding, which does not space the modules apart", () => {
    expect(validate(page(".module { padding: 24px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 3 — step 4 (border)", () => {
  const validate = validators[3];

  it("accepts a visible border", () => {
    expect(validate(page(".module { border: 2px solid #ff6b2c; }")).ok).toBe(true);
  });

  it("rejects border: none, which displays no border", () => {
    expect(validate(page(".module { border: none; }")).ok).toBe(false);
  });

  it("rejects border-radius, which rounds corners without drawing a border", () => {
    expect(validate(page(".module { border-radius: 8px; }")).ok).toBe(false);
  });
});
