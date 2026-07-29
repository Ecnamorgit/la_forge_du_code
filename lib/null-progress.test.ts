import { describe, it, expect } from "vitest";
import { nullProgressLabel, nullProgressAriaLabel } from "./null-progress";

describe("nullProgressLabel", () => {
  it("0% → secteur corrompu", () => {
    expect(nullProgressLabel(0)).toEqual({ title: "SECTEUR CORROMPU", tone: "corrupt" });
  });
  it("100% → secteur purgé", () => {
    expect(nullProgressLabel(100)).toEqual({ title: "SECTEUR PURGÉ", tone: "purged" });
  });
  it("intermédiaire → spectre repoussé avec le pourcentage arrondi", () => {
    expect(nullProgressLabel(42)).toEqual({ title: "SPECTRE REPOUSSÉ — 42%", tone: "progress" });
    expect(nullProgressLabel(41.6)).toEqual({ title: "SPECTRE REPOUSSÉ — 42%", tone: "progress" });
  });
  it("clamp : <=0 → corrompu, >=100 → purgé", () => {
    expect(nullProgressLabel(-5).tone).toBe("corrupt");
    expect(nullProgressLabel(150).tone).toBe("purged");
  });
});

describe("nullProgressAriaLabel", () => {
  it("nomme la menace Spectre", () => {
    expect(nullProgressAriaLabel(42)).toBe("Recul du Spectre : 42% du secteur purgé");
  });
});
