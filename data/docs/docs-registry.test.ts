import { describe, it, expect } from "vitest";
import { getDocEntry, htmlDocs } from "./html";

describe("registre des fiches HTML", () => {
  it("retourne une fiche connue par son id", () => {
    const entry = getDocEntry("html/doctype");
    expect(entry?.term).toBe("<!DOCTYPE html>");
  });

  it("retourne undefined pour un id inconnu", () => {
    expect(getDocEntry("html/inexistant")).toBeUndefined();
  });

  it("garde la cohérence clé/id pour chaque fiche", () => {
    for (const [key, entry] of Object.entries(htmlDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("html");
    }
  });
});
