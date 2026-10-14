import { describe, it, expect } from "vitest";
import { nullProgressLabel, nullProgressAriaLabel } from "./null-progress";

describe("nullProgressLabel", () => {
  it("0% → corrupted sector", () => {
    expect(nullProgressLabel(0)).toEqual({ title: "SECTEUR CORROMPU", tone: "corrupt" });
  });
  it("100% → purged sector", () => {
    expect(nullProgressLabel(100)).toEqual({ title: "SECTEUR PURGÉ", tone: "purged" });
  });
  it("in between → Spectre pushed back with the rounded percentage", () => {
    expect(nullProgressLabel(42)).toEqual({ title: "SPECTRE REPOUSSÉ — 42%", tone: "progress" });
    expect(nullProgressLabel(41.6)).toEqual({ title: "SPECTRE REPOUSSÉ — 42%", tone: "progress" });
  });
  it("clamp: <=0 → corrupt, >=100 → purged", () => {
    expect(nullProgressLabel(-5).tone).toBe("corrupt");
    expect(nullProgressLabel(150).tone).toBe("purged");
  });
});

describe("nullProgressAriaLabel", () => {
  it("names the Spectre threat", () => {
    expect(nullProgressAriaLabel(42)).toBe("Recul du Spectre : 42% du secteur purgé");
  });
});
