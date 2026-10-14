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
    ["absent", null],
    ["vide", ""],
    ["relatif", "dashboard"],
    ["URL absolue", "https://piege.example/connexion"],
    ["URL sans protocole", "//piege.example"],
    ["antislash lu comme slash", "/\\piege.example"],
    ["double antislash", "\\\\piege.example"],
    ["tabulation qui reforme //", "/\t/piege.example"],
    ["retour à la ligne qui reforme //", "/\n/piege.example"],
    ["schéma javascript", "javascript:alert(1)"],
  ])("rejects %s", (_label, value) => {
    expect(safeInternalPath(value)).toBe("/dashboard");
  });

  it("uses the provided fallback destination", () => {
    expect(safeInternalPath("https://piege.example", "/profil")).toBe("/profil");
  });
});
