import { describe, it, expect } from "vitest";
import { advanceLiaison, daysBetweenIso, MAX_SHIELDS, type LiaisonState } from "./streak";

function etat(p: Partial<LiaisonState> = {}): LiaisonState {
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
  it("compte les jours entre deux dates ISO", () => {
    expect(daysBetweenIso("2026-08-18", "2026-08-19")).toBe(1);
    expect(daysBetweenIso("2026-08-01", "2026-08-19")).toBe(18);
  });
});

describe("advanceLiaison", () => {
  it("ne fait rien si le jour est déjà compté", () => {
    const t = advanceLiaison(etat({ streak: 5, lastActiveDay: "2026-08-19" }), "2026-08-19");
    expect(t.changed).toBe(false);
    expect(t.next.streak).toBe(5);
  });

  it("refuse une journée antérieure à la dernière activité", () => {
    const t = advanceLiaison(
      etat({ streak: 5, shields: 1, bestStreak: 10, lastActiveDay: "2026-08-19" }),
      "2026-08-18"
    );
    expect(t.changed).toBe(false);
    expect(t.next.streak).toBe(5);
    expect(t.next.shields).toBe(1);
    expect(t.next.bestStreak).toBe(10);
  });

  it("incrémente au lendemain", () => {
    const t = advanceLiaison(etat({ streak: 5 }), "2026-08-19");
    expect(t.next.streak).toBe(6);
    expect(t.broken).toBe(false);
  });

  it("démarre à 1 pour un cadet jamais actif", () => {
    const t = advanceLiaison(etat({ lastActiveDay: "", streak: 1 }), "2026-08-19");
    expect(t.next.streak).toBe(1);
    expect(t.next.lastActiveDay).toBe("2026-08-19");
  });

  it("consomme un relais pour couvrir un jour manqué", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 1, lastActiveDay: "2026-08-17" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(1);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
    expect(t.broken).toBe(false);
  });

  it("consomme deux relais pour couvrir deux jours manqués", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 2, lastActiveDay: "2026-08-16" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(2);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
  });

  it("rompt la liaison quand les relais ne suffisent pas", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 1, lastActiveDay: "2026-08-10" }),
      "2026-08-19"
    );
    expect(t.broken).toBe(true);
    expect(t.next.streak).toBe(1);
    expect(t.shieldsConsumed).toBe(0);
    expect(t.next.shields).toBe(1);
  });

  it("conserve le record quand la liaison est rompue", () => {
    const t = advanceLiaison(
      etat({ streak: 20, bestStreak: 20, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(1);
    expect(t.next.bestStreak).toBe(20);
  });

  it("attribue Le Retour seulement si la série rompue valait 7 jours ou plus", () => {
    const gros = advanceLiaison(
      etat({ streak: 7, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(gros.earnedReturn).toBe(true);

    const petit = advanceLiaison(
      etat({ streak: 6, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(petit.earnedReturn).toBe(false);
  });

  it("offre le premier relais au 3e jour, une seule fois", () => {
    const t = advanceLiaison(etat({ streak: 2 }), "2026-08-19");
    expect(t.next.streak).toBe(3);
    expect(t.next.shields).toBe(1);
    expect(t.next.shieldEverGranted).toBe(true);

    const rejoue = advanceLiaison(
      etat({ streak: 2, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(rejoue.next.shields).toBe(0);
  });

  it("donne un relais tous les 7 jours", () => {
    const t = advanceLiaison(
      etat({ streak: 6, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(7);
    expect(t.shieldEarned).toBe(true);
    expect(t.next.shields).toBe(1);
  });

  it("ne dépasse jamais le plafond de relais", () => {
    const t = advanceLiaison(
      etat({ streak: 13, shields: MAX_SHIELDS, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(14);
    expect(t.next.shields).toBe(MAX_SHIELDS);
  });

  it("met à jour le record quand la série dépasse l'ancien", () => {
    const t = advanceLiaison(etat({ streak: 9, bestStreak: 9 }), "2026-08-19");
    expect(t.next.bestStreak).toBe(10);
  });
});
