import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * Chapter 2 — selectors and color.
 *
 * Each step has a passing case taken from the course `hint`, and a failing case
 * that misses only that step's requirement. Never an empty string as a failing
 * case: it would fail anyway and prove nothing.
 */

/** Wraps the given CSS in a full page, like the course startCode. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background-color: #03060d; color: white; }
      ${css}
    </style>
  </head>
  <body>
    <h1>Statut equipage</h1>
    <p class="alert">Alerte : pression instable</p>
    <p id="status">Nominal</p>
  </body>
</html>`;
}

describe("CSS chapter 2 — step 1 (class selector)", () => {
  const validate = validators[0];

  it("accepts an .alert { color } rule", () => {
    expect(validate(page(".alert { color: red; }")).ok).toBe(true);
  });

  it("rejects a rule that targets the tag instead of the class", () => {
    // Targeted failure: there is a color on a <p>, but not on .alert.
    expect(validate(page("p { color: red; }")).ok).toBe(false);
  });

  it("rejects a document without a <style> tag", () => {
    expect(validate("<html><body><h1>x</h1></body></html>").ok).toBe(false);
  });

  it("rejects background-color, which is not the requested property", () => {
    // `background-color` contains "color": a \b-based check
    // would wrongly accept it.
    expect(validate(page(".alert { background-color: red; }")).ok).toBe(false);
  });
});

describe("CSS chapter 2 — step 2 (id selector)", () => {
  const validate = validators[1];

  it("accepts a #status { color } rule", () => {
    expect(validate(page("#status { color: cyan; }")).ok).toBe(true);
  });

  it("rejects a .status class instead of the id", () => {
    expect(validate(page(".status { color: cyan; }")).ok).toBe(false);
  });
});

describe("CSS chapter 2 — step 3 (hex or rgb color)", () => {
  const validate = validators[2];

  it("accepts a six-digit hexadecimal", () => {
    expect(validate(page("h1 { color: #ff6b2c; }")).ok).toBe(true);
  });

  it("accepts the rgb() notation", () => {
    expect(validate(page("h1 { color: rgb(255, 107, 44); }")).ok).toBe(true);
  });

  it("rejects a color name, which is neither hex nor rgb", () => {
    expect(validate(page("h1 { color: orange; }")).ok).toBe(false);
  });

  it("rejects an out-of-range rgb channel", () => {
    expect(validate(page("h1 { color: rgb(300, 0, 0); }")).ok).toBe(false);
  });
});

describe("CSS chapter 2 — step 4 (typography on two selectors)", () => {
  const validate = validators[3];

  it("accepts text-align on h1 and font-weight on .alert", () => {
    expect(
      validate(page("h1 { text-align: center; } .alert { font-weight: bold; }")).ok
    ).toBe(true);
  });

  it("rejects when only text-align is set", () => {
    expect(validate(page("h1 { text-align: center; }")).ok).toBe(false);
  });

  it("rejects when only font-weight is set", () => {
    expect(validate(page(".alert { font-weight: bold; }")).ok).toBe(false);
  });
});
