import { describe, it, expect } from "vitest";
import { cssDocs } from "./index";
import { htmlDocs } from "../html";

const entries = Object.values(cssDocs);
const known = new Set([...Object.keys(cssDocs), ...Object.keys(htmlDocs)]);

describe("CSS reference sheets", () => {
  it("contains the 10 expected sheets", () => {
    expect(entries).toHaveLength(10);
  });

  it("every registry key == entry.id, css domain, css/ prefix", () => {
    for (const [key, entry] of Object.entries(cssDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("css");
      expect(key.startsWith("css/")).toBe(true);
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

  it("every related id resolves (html or css)", () => {
    for (const e of entries) {
      for (const rel of e.related ?? []) {
        expect(known.has(rel), `unknown related: ${rel} (in ${e.id})`).toBe(true);
      }
    }
  });
});
