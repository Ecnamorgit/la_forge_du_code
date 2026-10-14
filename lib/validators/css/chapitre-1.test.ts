import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Chapter 1 — hooking up a stylesheet and writing the first rules.
 *
 * Each step has a passing case taken from the course `hint`, and a failing case
 * that misses only that step's requirement.
 */

/** Full page with the given CSS in a <style> placed inside the <head>. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>Console</title>
    <style>
      ${css}
    </style>
  </head>
  <body>
    <h1>Statut equipage</h1>
    <p>Tous les systemes sont nominaux.</p>
  </body>
</html>`;
}

describe("CSS chapter 1 — step 1 (<style> inside the <head>)", () => {
  const validate = validators[0];

  it("accepts a <style> placed inside the <head>", () => {
    expect(validate(page("h1 { color: white; }")).ok).toBe(true);
  });

  it("rejects a <style> placed outside the <head>", () => {
    // Targeted failure: the tag exists, but not where the step asks for it.
    const code = `<!DOCTYPE html>
<html>
  <head><title>Console</title></head>
  <body>
    <style>h1 { color: white; }</style>
    <h1>Statut</h1>
  </body>
</html>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a document without a <head>", () => {
    expect(validate("<html><body><h1>Statut</h1></body></html>").ok).toBe(false);
  });
});

describe("CSS chapter 1 — step 2 (heading color)", () => {
  const validate = validators[1];

  it("accepts an h1 { color } rule", () => {
    expect(validate(page("h1 { color: #ff6b2c; }")).ok).toBe(true);
  });

  it("rejects background-color, which is not the text color", () => {
    expect(validate(page("h1 { background-color: #ff6b2c; }")).ok).toBe(false);
  });

  it("rejects a color set on another selector", () => {
    expect(validate(page("p { color: #ff6b2c; }")).ok).toBe(false);
  });
});

describe("CSS chapter 1 — step 3 (page background)", () => {
  const validate = validators[2];

  it("accepts a body { background-color } rule", () => {
    expect(validate(page("body { background-color: #03060d; }")).ok).toBe(true);
  });

  it("rejects color alone, which is not the background", () => {
    expect(validate(page("body { color: white; }")).ok).toBe(false);
  });
});

describe("CSS chapter 1 — step 4 (text size)", () => {
  const validate = validators[3];

  it("accepts a p { font-size } rule", () => {
    expect(validate(page("p { font-size: 18px; }")).ok).toBe(true);
  });

  it("rejects font-size set on the heading instead of the paragraph", () => {
    expect(validate(page("h1 { font-size: 18px; }")).ok).toBe(false);
  });

  it("rejects font-weight, which is not the size", () => {
    expect(validate(page("p { font-weight: bold; }")).ok).toBe(false);
  });
});
