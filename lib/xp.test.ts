import { describe, it, expect } from "vitest";
import { xpForStep, MAX_XP } from "./xp";

describe("xpForStep", () => {
  it("awards a base of 25 XP with no objective", () => {
    expect(xpForStep(0)).toBe(25);
  });

  it("adds 8 XP per objective", () => {
    expect(xpForStep(1)).toBe(33);
    expect(xpForStep(2)).toBe(41);
    expect(xpForStep(5)).toBe(65);
  });

  it("is strictly increasing with the number of objectives", () => {
    expect(xpForStep(3)).toBeGreaterThan(xpForStep(2));
  });

  it("exposes a positive MAX_XP cap", () => {
    expect(MAX_XP).toBeGreaterThan(0);
  });
});
