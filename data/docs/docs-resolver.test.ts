import { describe, it, expect } from "vitest";
import { getDocEntry } from "./index";

describe("getDocEntry (multi-domain)", () => {
  it("resolves an HTML sheet", () => {
    expect(getDocEntry("html/a")?.id).toBe("html/a");
  });
  it("resolves a CSS sheet", () => {
    expect(getDocEntry("css/flexbox")?.id).toBe("css/flexbox");
  });
  it("resolves a JS sheet", () => {
    expect(getDocEntry("js/fetch")?.id).toBe("js/fetch");
  });
  it("returns undefined for an unknown id", () => {
    expect(getDocEntry("css/inconnu")).toBeUndefined();
  });
});
