import { describe, it, expect } from "vitest";
import { getDocEntry, htmlDocs } from "./html";

describe("HTML reference sheet registry", () => {
  it("returns a known sheet by its id", () => {
    const entry = getDocEntry("html/doctype");
    expect(entry?.term).toBe("<!DOCTYPE html>");
  });

  it("returns undefined for an unknown id", () => {
    expect(getDocEntry("html/inexistant")).toBeUndefined();
  });

  it("keeps key/id consistent for every sheet", () => {
    for (const [key, entry] of Object.entries(htmlDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("html");
    }
  });
});
