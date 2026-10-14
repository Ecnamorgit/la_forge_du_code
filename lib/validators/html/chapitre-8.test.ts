import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";

/**
 * HTML chapter 8 — media: video, audio, responsive images.
 */

describe("HTML chapter 8 — step 1 (video)", () => {
  const validate = validators[0];

  it("accepts a video with controls", () => {
    expect(validate('<video src="/vol.mp4" controls></video>').ok).toBe(true);
  });

  it("rejects a video without controls", () => {
    // Targeted failure: without controls, the user can neither play nor stop it.
    expect(validate('<video src="/vol.mp4"></video>').ok).toBe(false);
  });

  it("rejects a video tag that is never closed", () => {
    expect(validate('<video src="/vol.mp4" controls>').ok).toBe(false);
  });
});

describe("HTML chapter 8 — step 2 (audio)", () => {
  const validate = validators[1];

  it("accepts an audio with controls", () => {
    expect(validate('<audio src="/radio.mp3" controls></audio>').ok).toBe(true);
  });

  it("rejects an audio without controls", () => {
    expect(validate('<audio src="/radio.mp3"></audio>').ok).toBe(false);
  });

  it("rejects a video where an audio is expected", () => {
    expect(validate('<video src="/vol.mp4" controls></video>').ok).toBe(false);
  });
});

describe("HTML chapter 8 — step 3 (responsive image)", () => {
  const validate = validators[2];

  it("accepts an image with srcset and sizes", () => {
    const code =
      '<img src="/r.png" alt="Radar" srcset="/r-480.png 480w, /r-960.png 960w" sizes="(max-width: 600px) 480px, 960px">';
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a srcset without sizes", () => {
    // Targeted failure: without sizes, the browser does not know what to pick.
    const code = '<img src="/r.png" alt="Radar" srcset="/r-480.png 480w, /r-960.png 960w">';
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a plain image", () => {
    expect(validate('<img src="/r.png" alt="Radar">').ok).toBe(false);
  });
});

describe("HTML chapter 8 — step 4 (picture element)", () => {
  const validate = validators[3];

  it("accepts two sources and a fallback image", () => {
    const code = `<picture>
      <source srcset="/r.avif" type="image/avif">
      <source srcset="/r.webp" type="image/webp">
      <img src="/r.png" alt="Radar">
    </picture>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a picture without a fallback image", () => {
    // Targeted failure: without <img>, nothing renders in an older browser.
    const code = `<picture>
      <source srcset="/r.avif" type="image/avif">
      <source srcset="/r.webp" type="image/webp">
    </picture>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a picture with a single source", () => {
    const code = `<picture>
      <source srcset="/r.webp" type="image/webp">
      <img src="/r.png" alt="Radar">
    </picture>`;
    expect(validate(code).ok).toBe(false);
  });
});
