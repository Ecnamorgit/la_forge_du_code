import { describe, expect, it } from "vitest";

import { metadata as codexMetadata } from "./codex/page";
import { metadata as homeMetadata } from "./page";

// Relative canonical URLs resolve against `metadataBase` (APP_URL, root layout).
describe("canonical URLs of the public pages", () => {
  it("gives the landing page its own path", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
  });

  it("gives the codex its own path", () => {
    expect(codexMetadata.alternates?.canonical).toBe("/codex");
  });
});

describe("landing page title and description", () => {
  it("names the site and what it teaches, short enough for Google to show whole", () => {
    const title = String(homeMetadata.title);
    expect(title).toMatch(/^La Forge du Code/);
    expect(title).toMatch(/apprendre à coder/i);
    expect(title.length).toBeLessThanOrEqual(65);
  });

  it("describes the courses instead of the layout's generic sentence", () => {
    expect(String(homeMetadata.description)).toMatch(/HTML, CSS, JavaScript/);
  });
});

describe("codex title and description", () => {
  it("says what the codex is about, short enough for Google to show whole", () => {
    const title = String(codexMetadata.title);
    expect(title).toMatch(/Coalition Nebula/);
    expect(title).toMatch(/La Forge du Code$/);
    expect(title.length).toBeLessThanOrEqual(65);
    const description = String(codexMetadata.description);
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(160);
  });
});
