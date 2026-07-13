import { describe, it, expect } from "vitest";
import { jsDocs } from "./index";
import { htmlDocs } from "../html";
import { cssDocs } from "../css";

const entries = Object.values(jsDocs);
const known = new Set([
  ...Object.keys(jsDocs),
  ...Object.keys(htmlDocs),
  ...Object.keys(cssDocs),
]);

describe("fiches JS", () => {
  it("contient les 12 fiches attendues", () => {
    expect(entries).toHaveLength(12);
  });

  it("chaque clé == entry.id, domaine js, préfixe js/", () => {
    for (const [key, entry] of Object.entries(jsDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("js");
      expect(key.startsWith("js/")).toBe(true);
    }
  });

  it("champs obligatoires non vides", () => {
    for (const e of entries) {
      expect(e.term.trim().length).toBeGreaterThan(0);
      expect(e.title.trim().length).toBeGreaterThan(0);
      expect(e.summary.trim().length).toBeGreaterThan(0);
      expect(e.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("chaque id related résout (js, html ou css)", () => {
    for (const e of entries) {
      for (const rel of e.related ?? []) {
        expect(known.has(rel), `related inconnu: ${rel} (dans ${e.id})`).toBe(true);
      }
    }
  });
});
