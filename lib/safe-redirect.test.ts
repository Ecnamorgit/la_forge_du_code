import { describe, it, expect } from "vitest";

import { safeInternalPath } from "./safe-redirect";

describe("safeInternalPath", () => {
  it.each(["/dashboard", "/profil", "/learn/html/chapitre-2", "/profil?onglet=badges#cadre"])(
    "keeps the internal path %s",
    (inputPath) => {
      expect(safeInternalPath(inputPath)).toBe(inputPath);
    }
  );

  it.each([
    ["missing", null],
    ["empty", ""],
    ["relative", "dashboard"],
    ["absolute URL", "https://evil.example/connexion"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash read as a slash", "/\\evil.example"],
    ["double backslash", "\\\\evil.example"],
    ["tab that rebuilds //", "/\t/evil.example"],
    ["newline that rebuilds //", "/\n/evil.example"],
    ["javascript scheme", "javascript:alert(1)"],
  ])("rejects %s", (_label, value) => {
    expect(safeInternalPath(value)).toBe("/dashboard");
  });

  it("uses the provided fallback destination", () => {
    expect(safeInternalPath("https://evil.example", "/profil")).toBe("/profil");
  });
});
