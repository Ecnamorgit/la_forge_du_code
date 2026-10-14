import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";

/**
 * Chapter 7 — pseudo-classes and pseudo-elements.
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
    <input class="field" />
    <blockquote class="quote">Le vide n'est jamais vide.</blockquote>
    <ul><li>Sonde 1</li><li>Sonde 2</li></ul>
  </body>
</html>`;
}

describe("CSS chapter 7 — step 1 (button hover)", () => {
  const validate = validators[0];

  it("accepts a non-empty .btn:hover rule", () => {
    expect(validate(page(".btn:hover { background: #ff6b2c; }")).ok).toBe(true);
  });

  it("rejects an empty .btn:hover rule", () => {
    // Targeted failure: the selector is right, but it declares nothing.
    expect(validate(page(".btn:hover { }")).ok).toBe(false);
  });

  it("rejects a .btn rule without the hover", () => {
    expect(validate(page(".btn { background: #ff6b2c; }")).ok).toBe(false);
  });
});

describe("CSS chapter 7 — step 2 (visible focus on the field)", () => {
  const validate = validators[1];

  it("accepts a focus that changes the border", () => {
    expect(validate(page(".field:focus { border: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("accepts a focus that sets an outline", () => {
    expect(validate(page(".field:focus { outline: 2px solid #00b8d4; }")).ok).toBe(true);
  });

  it("rejects a focus with no identifiable visual feedback", () => {
    // Targeted failure: the rule exists but signals nothing to the eye.
    expect(validate(page(".field:focus { color: white; }")).ok).toBe(false);
  });
});

describe("CSS chapter 7 — step 3 (pseudo-element before the quote)", () => {
  const validate = validators[2];

  it("accepts .quote::before with a content", () => {
    expect(validate(page('.quote::before { content: "\\201C"; }')).ok).toBe(true);
  });

  it("rejects a pseudo-element without content, which does not render", () => {
    expect(validate(page(".quote::before { color: #ff6b2c; }")).ok).toBe(false);
  });

  it("rejects justify-content, which is not the content property", () => {
    // `justify-content` contains "content" preceded by a hyphen: a
    // \b-based check would accept it, and the pseudo-element would stay empty.
    expect(validate(page(".quote::before { justify-content: center; }")).ok).toBe(false);
  });
});

describe("CSS chapter 7 — step 4 (zebra-striped list)", () => {
  const validate = validators[3];

  it("accepts li:nth-child(even) with a background", () => {
    expect(validate(page("li:nth-child(even) { background: #0a1420; }")).ok).toBe(true);
  });

  it("accepts the odd variant", () => {
    expect(validate(page("li:nth-child(odd) { background: #0a1420; }")).ok).toBe(true);
  });

  it("rejects nth-child without background, which creates no striping", () => {
    expect(validate(page("li:nth-child(even) { color: white; }")).ok).toBe(false);
  });

  it("rejects a background set on every li indiscriminately", () => {
    expect(validate(page("li { background: #0a1420; }")).ok).toBe(false);
  });
});
