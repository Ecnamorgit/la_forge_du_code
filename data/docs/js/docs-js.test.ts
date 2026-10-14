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

describe("JS reference sheets", () => {
  it("contains the 12 expected sheets", () => {
    expect(entries).toHaveLength(12);
  });

  it("every key == entry.id, js domain, js/ prefix", () => {
    for (const [key, entry] of Object.entries(jsDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("js");
      expect(key.startsWith("js/")).toBe(true);
    }
  });

  it("required fields are not empty", () => {
    for (const e of entries) {
      expect(e.term.trim().length).toBeGreaterThan(0);
      expect(e.title.trim().length).toBeGreaterThan(0);
      expect(e.summary.trim().length).toBeGreaterThan(0);
      expect(e.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("every related id resolves (js, html or css)", () => {
    for (const e of entries) {
      for (const rel of e.related ?? []) {
        expect(known.has(rel), `related inconnu: ${rel} (dans ${e.id})`).toBe(true);
      }
    }
  });
});
