import { describe, it, expect } from "vitest";
import { xpForStep, MAX_XP } from "./xp";

describe("xpForStep", () => {
  it("attribue 25 XP de base sans objectif", () => {
    expect(xpForStep(0)).toBe(25);
  });

  it("ajoute 8 XP par objectif", () => {
    expect(xpForStep(1)).toBe(33);
    expect(xpForStep(2)).toBe(41);
    expect(xpForStep(5)).toBe(65);
  });

  it("est strictement croissante avec le nombre d'objectifs", () => {
    expect(xpForStep(3)).toBeGreaterThan(xpForStep(2));
  });

  it("expose un plafond MAX_XP positif", () => {
    expect(MAX_XP).toBeGreaterThan(0);
  });
});
