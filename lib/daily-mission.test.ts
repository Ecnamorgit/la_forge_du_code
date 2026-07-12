import { describe, it, expect } from "vitest";
import { canClaimDailyMission, DAILY_MISSION_XP } from "./daily-mission";

describe("canClaimDailyMission", () => {
  it("autorise la réclamation un nouveau jour", () => {
    expect(canClaimDailyMission("2026-06-28", "2026-06-29")).toBe(true);
  });

  it("autorise la réclamation si jamais réclamée", () => {
    expect(canClaimDailyMission("", "2026-06-29")).toBe(true);
  });

  it("refuse une seconde réclamation le même jour", () => {
    expect(canClaimDailyMission("2026-06-29", "2026-06-29")).toBe(false);
  });

  it("refuse si la date du jour est inconnue", () => {
    expect(canClaimDailyMission("2026-06-28", "")).toBe(false);
  });

  it("expose un bonus XP positif", () => {
    expect(DAILY_MISSION_XP).toBeGreaterThan(0);
  });
});
