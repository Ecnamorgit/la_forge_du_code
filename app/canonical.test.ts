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
