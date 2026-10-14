import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * HTML chapter 3 — images: source, dimensions, link, caption.
 */

describe("HTML chapter 3 — step 1 (accessible image)", () => {
  const validate = validators[0];

  it("accepts an image with src and alt", () => {
    expect(validate('<img src="/radar.png" alt="Ecran radar">').ok).toBe(true);
  });

  it("rejects an image without alt", () => {
    // Targeted failure: the alt is the point of the step, not a detail.
    expect(validate('<img src="/radar.png">').ok).toBe(false);
  });

  it("rejects an empty alt", () => {
    expect(validate('<img src="/radar.png" alt="">').ok).toBe(false);
  });

  it("rejects an image without src", () => {
    expect(validate('<img alt="Ecran radar">').ok).toBe(false);
  });
});

describe("HTML chapter 3 — step 2 (dimensions)", () => {
  const validate = validators[1];

  it("accepts width and height on the image", () => {
    expect(
      validate('<img src="/radar.png" alt="Radar" width="640" height="360">').ok
    ).toBe(true);
  });

  it("rejects width alone", () => {
    expect(validate('<img src="/radar.png" alt="Radar" width="640">').ok).toBe(false);
  });

  it("rejects a non-numeric dimension", () => {
    // Targeted failure: the HTML attribute expects a number of pixels, not a unit.
    expect(
      validate('<img src="/radar.png" alt="Radar" width="auto" height="360">').ok
    ).toBe(false);
  });
});

describe("HTML chapter 3 — step 3 (clickable image)", () => {
  const validate = validators[2];

  it("accepts an image wrapped in a link", () => {
    expect(
      validate('<a href="/mission"><img src="/radar.png" alt="Radar"></a>').ok
    ).toBe(true);
  });

  it("rejects an image placed next to the link", () => {
    // Targeted failure: the nesting is what makes the image clickable.
    expect(
      validate('<a href="/mission">Mission</a><img src="/radar.png" alt="Radar">').ok
    ).toBe(false);
  });

  it("rejects a link without href around the image", () => {
    expect(validate('<a><img src="/radar.png" alt="Radar"></a>').ok).toBe(false);
  });
});

describe("HTML chapter 3 — step 4 (figure and caption)", () => {
  const validate = validators[3];

  it("accepts a figure containing the image and its caption", () => {
    const code = `<figure>
      <img src="/radar.png" alt="Radar">
      <figcaption>Balayage du secteur 7</figcaption>
    </figure>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an empty figcaption", () => {
    const code = `<figure>
      <img src="/radar.png" alt="Radar">
      <figcaption>  </figcaption>
    </figure>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an image left outside the figure", () => {
    // Targeted failure: the caption must be attached to the image.
    const code = `<img src="/radar.png" alt="Radar">
    <figure><figcaption>Balayage du secteur 7</figcaption></figure>`;
    expect(validate(code).ok).toBe(false);
  });
});
