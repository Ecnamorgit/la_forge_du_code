import { describe, it, expect } from "vitest";
import { advanceLiaison, daysBetweenIso, MAX_SHIELDS, type LiaisonState } from "./streak";

function liaisonState(p: Partial<LiaisonState> = {}): LiaisonState {
  return {
    streak: 1,
    bestStreak: 1,
    shields: 0,
    shieldEverGranted: false,
    lastActiveDay: "2026-08-18",
    ...p,
  };
}

describe("daysBetweenIso", () => {
  it("counts the days between two ISO dates", () => {
    expect(daysBetweenIso("2026-08-18", "2026-08-19")).toBe(1);
    expect(daysBetweenIso("2026-08-01", "2026-08-19")).toBe(18);
  });
});

describe("advanceLiaison", () => {
  it("does nothing if the day is already counted", () => {
    const t = advanceLiaison(liaisonState({ streak: 5, lastActiveDay: "2026-08-19" }), "2026-08-19");
    expect(t.changed).toBe(false);
    expect(t.next.streak).toBe(5);
  });

  it("rejects a day earlier than the last activity", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 5, shields: 1, bestStreak: 10, lastActiveDay: "2026-08-19" }),
      "2026-08-18"
    );
    expect(t.changed).toBe(false);
    expect(t.next.streak).toBe(5);
    expect(t.next.shields).toBe(1);
    expect(t.next.bestStreak).toBe(10);
  });

  it("increments on the next day", () => {
    const t = advanceLiaison(liaisonState({ streak: 5 }), "2026-08-19");
    expect(t.next.streak).toBe(6);
    expect(t.broken).toBe(false);
  });

  it("starts at 1 for a cadet who was never active", () => {
    const t = advanceLiaison(liaisonState({ lastActiveDay: "", streak: 1 }), "2026-08-19");
    expect(t.next.streak).toBe(1);
    expect(t.next.lastActiveDay).toBe("2026-08-19");
  });

  it("consumes a relay to cover a missed day", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 9, shields: 1, lastActiveDay: "2026-08-17" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(1);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
    expect(t.broken).toBe(false);
  });

  it("consumes two relays to cover two missed days", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 9, shields: 2, lastActiveDay: "2026-08-16" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(2);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
  });

  it("breaks the liaison when the relays are not enough", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 9, shields: 1, lastActiveDay: "2026-08-10" }),
      "2026-08-19"
    );
    expect(t.broken).toBe(true);
    expect(t.next.streak).toBe(1);
    expect(t.shieldsConsumed).toBe(0);
    expect(t.next.shields).toBe(1);
  });

  it("keeps the record when the liaison is broken", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 20, bestStreak: 20, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(1);
    expect(t.next.bestStreak).toBe(20);
  });

  it("awards Le Retour only if the broken streak was 7 days or more", () => {
    const large = advanceLiaison(
      liaisonState({ streak: 7, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(large.earnedReturn).toBe(true);

    const small = advanceLiaison(
      liaisonState({ streak: 6, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(small.earnedReturn).toBe(false);
  });

  it("grants the first relay on day 3, only once", () => {
    const t = advanceLiaison(liaisonState({ streak: 2 }), "2026-08-19");
    expect(t.next.streak).toBe(3);
    expect(t.next.shields).toBe(1);
    expect(t.next.shieldEverGranted).toBe(true);

    const replayed = advanceLiaison(
      liaisonState({ streak: 2, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(replayed.next.shields).toBe(0);
  });

  it("gives a relay every 7 days", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 6, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(7);
    expect(t.shieldEarned).toBe(true);
    expect(t.next.shields).toBe(1);
  });

  it("never exceeds the relay cap", () => {
    const t = advanceLiaison(
      liaisonState({ streak: 13, shields: MAX_SHIELDS, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(14);
    expect(t.next.shields).toBe(MAX_SHIELDS);
  });

  it("updates the record when the streak beats the old one", () => {
    const t = advanceLiaison(liaisonState({ streak: 9, bestStreak: 9 }), "2026-08-19");
    expect(t.next.bestStreak).toBe(10);
  });
});
