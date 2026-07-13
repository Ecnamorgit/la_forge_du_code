import { describe, it, expect } from "vitest";
import { getDocEntry } from "./index";

describe("getDocEntry (multi-domaine)", () => {
  it("résout une fiche HTML", () => {
    expect(getDocEntry("html/a")?.id).toBe("html/a");
  });
  it("résout une fiche CSS", () => {
    expect(getDocEntry("css/flexbox")?.id).toBe("css/flexbox");
  });
  it("renvoie undefined pour un id inconnu", () => {
    expect(getDocEntry("css/inconnu")).toBeUndefined();
  });
});
