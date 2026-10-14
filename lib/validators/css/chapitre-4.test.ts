import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * Chapter 4 — Flexbox: enable the container, then distribute and align.
 */

/** Full page with the given CSS, and a .container to turn into flex. */
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

describe("CSS chapter 4 — step 1 (enable flex)", () => {
  const validate = validators[0];

  it("accepts display: flex on .container", () => {
    expect(validate(page(".container { display: flex; }")).ok).toBe(true);
  });

  it("rejects display: block, which does not enable Flexbox", () => {
    // Targeted failure: the property is there, but not the value that enables flex.
    expect(validate(page(".container { display: block; }")).ok).toBe(false);
  });

  it("rejects flex set on another selector", () => {
    expect(validate(page(".carte { display: flex; }")).ok).toBe(false);
  });
});

describe("CSS chapter 4 — step 2 (horizontal distribution)", () => {
  const validate = validators[1];

  it("accepts justify-content on .container", () => {
    expect(
      validate(page(".container { display: flex; justify-content: space-between; }")).ok
    ).toBe(true);
  });

  it("rejects align-items, which aligns on the other axis", () => {
    expect(validate(page(".container { display: flex; align-items: center; }")).ok).toBe(
      false
    );
  });
});

describe("CSS chapter 4 — step 3 (vertical alignment)", () => {
  const validate = validators[2];

  it("accepts align-items on .container", () => {
    expect(validate(page(".container { display: flex; align-items: center; }")).ok).toBe(
      true
    );
  });

  it("rejects justify-content, which distributes along the main axis", () => {
    expect(
      validate(page(".container { display: flex; justify-content: center; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapter 4 — step 4 (spacing between items)", () => {
  const validate = validators[3];

  it("accepts the gap shorthand property", () => {
    expect(validate(page(".container { display: flex; gap: 12px; }")).ok).toBe(true);
  });

  it("accepts column-gap", () => {
    expect(validate(page(".container { display: flex; column-gap: 12px; }")).ok).toBe(
      true
    );
  });

  it("rejects a margin on the children, which is not the requested property", () => {
    expect(validate(page(".container { display: flex; } .carte { margin: 12px; }")).ok).toBe(
      false
    );
  });
});
