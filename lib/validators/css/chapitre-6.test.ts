import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";

/**
 * Chapter 6 — positioning: relative, absolute, fixed, sticky.
 *
 * Each step requires a pair (position value + offset): the failing cases
 * isolate one or the other, never both at once.
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
    <span class="badge">3</span>
    <div class="card"><span class="ribbon">Neuf</span></div>
    <header class="topbar">Nebula Command</header>
    <h2 class="section-title">Secteur 7</h2>
  </body>
</html>`;
}

describe("CSS chapter 6 — step 1 (relative position with an offset)", () => {
  const validate = validators[0];

  it("accepts position: relative together with a top", () => {
    expect(validate(page(".badge { position: relative; top: -4px; }")).ok).toBe(true);
  });

  it("rejects position: relative without any offset", () => {
    // Targeted failure: without an offset, `relative` moves nothing.
    expect(validate(page(".badge { position: relative; }")).ok).toBe(false);
  });

  it("rejects an offset without position: relative", () => {
    expect(validate(page(".badge { top: -4px; }")).ok).toBe(false);
  });

  it("rejects padding-top, which is not a positioning offset", () => {
    // `padding-top` contains "top" preceded by a hyphen: a \b-based check
    // would count it as an offset.
    expect(validate(page(".badge { position: relative; padding-top: 4px; }")).ok).toBe(
      false
    );
  });
});

describe("CSS chapter 6 — step 2 (absolute child inside a relative parent)", () => {
  const validate = validators[1];

  const OK = ".card { position: relative; } .ribbon { position: absolute; top: 0; right: 0; }";

  it("accepts a relative parent and an anchored absolute child", () => {
    expect(validate(page(OK)).ok).toBe(true);
  });

  it("rejects when the parent is not relative", () => {
    expect(
      validate(page(".ribbon { position: absolute; top: 0; right: 0; }")).ok
    ).toBe(false);
  });

  it("rejects when the absolute child is not anchored", () => {
    expect(
      validate(page(".card { position: relative; } .ribbon { position: absolute; }")).ok
    ).toBe(false);
  });
});

describe("CSS chapter 6 — step 3 (bar fixed at the top)", () => {
  const validate = validators[2];

  it("accepts position: fixed with top: 0", () => {
    expect(validate(page(".topbar { position: fixed; top: 0; }")).ok).toBe(true);
  });

  it("accepts top: 0px, the same value written with its unit", () => {
    expect(validate(page(".topbar { position: fixed; top: 0px; }")).ok).toBe(true);
  });

  it("rejects position: absolute, which does not stay put on scroll", () => {
    expect(validate(page(".topbar { position: absolute; top: 0; }")).ok).toBe(false);
  });

  it("rejects a non-zero top, which does not anchor the bar at the top", () => {
    expect(validate(page(".topbar { position: fixed; top: 20px; }")).ok).toBe(false);
  });
});

describe("CSS chapter 6 — step 4 (sticky heading)", () => {
  const validate = validators[3];

  it("accepts position: sticky with a top set", () => {
    expect(validate(page(".section-title { position: sticky; top: 0; }")).ok).toBe(true);
  });

  it("accepts position: sticky with a bottom set", () => {
    expect(validate(page(".section-title { position: sticky; bottom: 0; }")).ok).toBe(true);
  });

  it("rejects margin-bottom, which does not replace bottom", () => {
    expect(
      validate(page(".section-title { position: sticky; margin-bottom: 10px; }")).ok
    ).toBe(false);
  });

  it("rejects sticky without top, which sticks to nothing", () => {
    expect(validate(page(".section-title { position: sticky; }")).ok).toBe(false);
  });

  it("rejects position: fixed, which takes the heading out of the flow", () => {
    expect(validate(page(".section-title { position: fixed; top: 0; }")).ok).toBe(false);
  });

  it("rejects margin-top, which does not replace the top that sticky requires", () => {
    expect(
      validate(page(".section-title { position: sticky; margin-top: 10px; }")).ok
    ).toBe(false);
  });
});
