import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";

/**
 * HTML chapter 7 — metadata: encoding, description, sharing, favicon.
 */

describe("HTML chapter 7 — step 1 (language, encoding, viewport)", () => {
  const validate = validators[0];

  const COMPLETE = `<html lang="fr"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head></html>`;

  it("accepts all three declarations", () => {
    expect(validate(COMPLETE).ok).toBe(true);
  });

  it("rejects a page without lang", () => {
    const code = `<html><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head></html>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a viewport without width=device-width", () => {
    // Targeted failure: the tag is there, but it does not make the page responsive.
    const code = `<html lang="fr"><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="initial-scale=1">
    </head></html>`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 7 — step 2 (description)", () => {
  const validate = validators[1];

  it("accepts a long enough description", () => {
    const code =
      '<meta name="description" content="Station orbitale Nebula Command : apprends le code en mission.">';
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a description that is too short", () => {
    // Targeted failure: a meta that is present but useless for SEO.
    expect(validate('<meta name="description" content="Nebula">').ok).toBe(false);
  });

  it("rejects a missing meta description", () => {
    expect(validate('<meta name="keywords" content="code, espace">').ok).toBe(false);
  });
});

describe("HTML chapter 7 — step 3 (social sharing)", () => {
  const validate = validators[2];

  it("accepts all three Open Graph tags", () => {
    const code = `<meta property="og:title" content="Nebula Command">
      <meta property="og:description" content="Apprends le code en mission.">
      <meta property="og:image" content="https://codeforge.space/og.png">`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a missing og:image", () => {
    const code = `<meta property="og:title" content="Nebula Command">
      <meta property="og:description" content="Apprends le code en mission.">`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an og:title with empty content", () => {
    // Targeted failure: the tag exists but carries nothing.
    const code = `<meta property="og:title" content="">
      <meta property="og:description" content="Apprends le code en mission.">
      <meta property="og:image" content="https://codeforge.space/og.png">`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 7 — step 4 (favicon)", () => {
  const validate = validators[3];

  it("accepts a rel=icon link with an href", () => {
    expect(validate('<link rel="icon" href="/favicon.ico">').ok).toBe(true);
  });

  it("accepts the legacy shortcut icon form", () => {
    expect(validate('<link rel="shortcut icon" href="/favicon.ico">').ok).toBe(true);
  });

  it("rejects a stylesheet link mistaken for a favicon", () => {
    // Targeted failure: the rel is not the expected one.
    expect(validate('<link rel="stylesheet" href="/style.css">').ok).toBe(false);
  });
});
