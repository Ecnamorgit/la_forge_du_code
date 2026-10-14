import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * HTML chapter 2 — external links, internal anchors and navigation.
 */

describe("HTML chapter 2 — step 1 (external link)", () => {
  const validate = validators[0];

  it("accepts an http link with target _blank", () => {
    expect(
      validate('<a href="https://developer.mozilla.org" target="_blank">MDN</a>').ok
    ).toBe(true);
  });

  it("rejects an external link without target _blank", () => {
    expect(validate('<a href="https://developer.mozilla.org">MDN</a>').ok).toBe(false);
  });

  it("rejects an internal link, which is not an external gateway", () => {
    // Targeted failure: the href exists but does not leave the site.
    expect(validate('<a href="/missions" target="_blank">Missions</a>').ok).toBe(false);
  });

  it("ignores a link inside an HTML comment", () => {
    expect(
      validate('<!-- <a href="https://mdn.io" target="_blank">MDN</a> -->').ok
    ).toBe(false);
  });
});

describe("HTML chapter 2 — step 2 (two landmarks)", () => {
  const validate = validators[1];

  it("accepts two sections with distinct ids", () => {
    expect(
      validate('<section id="missions">A</section><section id="contact">B</section>').ok
    ).toBe(true);
  });

  it("rejects two sections with the same id", () => {
    // Targeted failure: an id must be unique to serve as an anchor.
    expect(
      validate('<section id="missions">A</section><section id="missions">B</section>').ok
    ).toBe(false);
  });

  it("rejects a single section", () => {
    expect(validate('<section id="missions">A</section>').ok).toBe(false);
  });
});

describe("HTML chapter 2 — step 3 (internal links)", () => {
  const validate = validators[2];

  const TARGETS = '<section id="missions">A</section><section id="contact">B</section>';

  it("accepts two anchors pointing to existing ids", () => {
    const code = `<a href="#missions">M</a><a href="#contact">C</a>${TARGETS}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an anchor that matches no id", () => {
    // Targeted failure: the link exists but leads nowhere.
    const code = `<a href="#missions">M</a><a href="#equipage">E</a>${TARGETS}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a single anchor", () => {
    const code = `<a href="#missions">M</a>${TARGETS}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 2 — step 4 (navigation bar)", () => {
  const validate = validators[3];

  it("accepts a nav with an external link and two anchors", () => {
    const code = `<nav>
      <a href="https://developer.mozilla.org" target="_blank">MDN</a>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
    </nav>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a nav that lost the external link", () => {
    const code = `<nav>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
      <a href="#equipage">Equipage</a>
    </nav>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects three links left outside a nav", () => {
    // Targeted failure: the semantic grouping is what the step teaches.
    const code = `<div>
      <a href="https://developer.mozilla.org">MDN</a>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
    </div>`;
    expect(validate(code).ok).toBe(false);
  });
});
