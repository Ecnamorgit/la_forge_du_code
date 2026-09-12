import { describe, it, expect } from "vitest";

import { safeInternalPath } from "./safe-redirect";

describe("safeInternalPath", () => {
  it.each(["/dashboard", "/profil", "/learn/html/chapitre-2", "/profil?onglet=badges#cadre"])(
    "garde le chemin interne %s",
    (chemin) => {
      expect(safeInternalPath(chemin)).toBe(chemin);
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
  ])("rejette %s", (_cas, valeur) => {
    expect(safeInternalPath(valeur)).toBe("/dashboard");
  });

  it("utilise la destination de repli fournie", () => {
    expect(safeInternalPath("https://piege.example", "/profil")).toBe("/profil");
  });
});
