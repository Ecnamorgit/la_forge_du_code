import { describe, it, expect } from "vitest";
import { cssDocs } from "./index";
import { htmlDocs } from "../html";

const entries = Object.values(cssDocs);
const known = new Set([...Object.keys(cssDocs), ...Object.keys(htmlDocs)]);

describe("fiches CSS", () => {
  it("contient les 10 fiches attendues", () => {
    expect(entries).toHaveLength(10);
  });

  it("chaque clé de registre == entry.id, domaine css, préfixe css/", () => {
    for (const [key, entry] of Object.entries(cssDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("css");
      expect(key.startsWith("css/")).toBe(true);
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

  it("chaque id related résout (html ou css)", () => {
    for (const e of entries) {
      for (const rel of e.related ?? []) {
        expect(known.has(rel), `related inconnu: ${rel} (dans ${e.id})`).toBe(true);
      }
    }
  });
});
