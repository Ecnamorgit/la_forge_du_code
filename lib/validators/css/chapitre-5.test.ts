import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

/**
 * Chapter 5 — CSS Grid.
 *
 * Step 2 counts the declared columns, including through `repeat()`: the
 * tests cover the expanded form, the compact form, and a repeat() that
 * produces too few.
 */

/** Full page with the given CSS, and a .grid to lay out. */
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

describe("CSS chapter 5 — step 1 (enable grid)", () => {
  const validate = validators[0];

  it("accepts display: grid on .grid", () => {
    expect(validate(page(".grid { display: grid; }")).ok).toBe(true);
  });

  it("rejects display: flex, which is the other layout model", () => {
    expect(validate(page(".grid { display: flex; }")).ok).toBe(false);
  });
});

describe("CSS chapter 5 — step 2 (at least three columns)", () => {
  const validate = validators[1];

  it("accepts three tracks written out one by one", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }")).ok
    ).toBe(true);
  });

  it("accepts repeat(3, 1fr), which produces three tracks", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-columns: repeat(3, 1fr); }")).ok
    ).toBe(true);
  });

  it("rejects only two columns", () => {
    // Targeted failure: the property is correct, the count is not.
    expect(
      validate(page(".grid { display: grid; grid-template-columns: 1fr 1fr; }")).ok
    ).toBe(false);
  });

  it("rejects repeat(2, 1fr), which produces only two", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-columns: repeat(2, 1fr); }")).ok
    ).toBe(false);
  });

  it("rejects grid-template-rows instead of columns", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-rows: 1fr 1fr 1fr; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapter 5 — step 3 (grid spacing)", () => {
  const validate = validators[2];

  it("accepts the gap shorthand property", () => {
    expect(validate(page(".grid { display: grid; gap: 10px; }")).ok).toBe(true);
  });

  it("accepts row-gap", () => {
    expect(validate(page(".grid { display: grid; row-gap: 10px; }")).ok).toBe(true);
  });

  it("rejects padding, which spaces the edge rather than the cells", () => {
    expect(validate(page(".grid { display: grid; padding: 10px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 5 — step 4 (grid rows)", () => {
  const validate = validators[3];

  it("accepts grid-template-rows on .grid", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-rows: 80px 80px; }")).ok
    ).toBe(true);
  });

  it("rejects grid-template-columns, which defines the other axis", () => {
    expect(
      validate(page(".grid { display: grid; grid-template-columns: 1fr 1fr; }")).ok
    ).toBe(false);
  });
});
