import { describe, it, expect } from "vitest";
import { BADGES } from "./badges-catalog";
import {
  CONDUCT_BADGES,
  evaluateConductBadges,
  getConductBadge,
  type ConductContext,
} from "./conduct-badges";
import type { CompletionRecord } from "./quests";

function step(course: string, jour: string, heure = "10"): CompletionRecord {
  return {
    course,
    chapter: "chapitre-1",
    stepIndex: 0,
    completedAt: `${jour}T${heure}:00:00.000Z`,
  };
}

function ctx(p: Partial<ConductContext> = {}): ConductContext {
  return {
    streak: 1,
    questsCompleted: 0,
    perfectBriefingRun: 0,
    completions: [],
    justReturned: false,
    ...p,
  };
}

describe("CONDUCT_BADGES", () => {
  it("n'entre jamais en collision avec les badges de cursus", () => {
    const cursus = new Set(BADGES.map((b) => b.id));
    for (const c of CONDUCT_BADGES) {
      expect(cursus.has(c.id)).toBe(false);
    }
  });

  it("a des identifiants uniques", () => {
    const ids = CONDUCT_BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("donne une icône emoji à chacun, faute de planche de sprites", () => {
    for (const b of CONDUCT_BADGES) expect(b.icon.length).toBeGreaterThan(0);
  });
});

describe("evaluateConductBadges", () => {
  it("ne donne rien à un cadet neuf", () => {
    expect(evaluateConductBadges(ctx())).toEqual([]);
  });

  it("attribue les paliers de liaison", () => {
    expect(evaluateConductBadges(ctx({ streak: 7 }))).toContain("liaison-7");
    expect(evaluateConductBadges(ctx({ streak: 30 }))).toContain("liaison-30");
    expect(evaluateConductBadges(ctx({ streak: 100 }))).toContain("liaison-100");
  });

  it("n'attribue pas un palier non atteint", () => {
    expect(evaluateConductBadges(ctx({ streak: 6 }))).not.toContain("liaison-7");
  });

  it("attribue les paliers d'ordres validés", () => {
    expect(evaluateConductBadges(ctx({ questsCompleted: 50 }))).toContain("quetes-50");
    expect(evaluateConductBadges(ctx({ questsCompleted: 49 }))).not.toContain("quetes-50");
  });

  it("attribue Sans faute à 5 briefings complets d'affilée", () => {
    expect(evaluateConductBadges(ctx({ perfectBriefingRun: 5 }))).toContain("briefing-5");
  });

  it("attribue Polyglotte à 5 cursus distincts", () => {
    const c = ["html", "css", "javascript", "react", "git"].map((x) => step(x, "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("polyglotte");
  });

  it("attribue Sprinteur à 10 étapes dans la même journée", () => {
    const c = Array.from({ length: 10 }, () => step("html", "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("sprint");
  });

  it("ne confond pas 10 étapes réparties sur deux jours avec un sprint", () => {
    const c = [
      ...Array.from({ length: 5 }, () => step("html", "2026-08-18")),
      ...Array.from({ length: 5 }, () => step("html", "2026-08-19")),
    ];
    expect(evaluateConductBadges(ctx({ completions: c }))).not.toContain("sprint");
  });

  it("attribue Veilleur pour une étape validée avant 5 h UTC", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "03")] }))
    ).toContain("veilleur");
  });

  it("n'attribue pas Veilleur en pleine journée", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "14")] }))
    ).not.toContain("veilleur");
  });

  it("attribue Le Retour au moment exact de la rupture", () => {
    expect(evaluateConductBadges(ctx({ justReturned: true }))).toContain("retour");
    expect(evaluateConductBadges(ctx({ justReturned: false }))).not.toContain("retour");
  });
});

describe("getConductBadge", () => {
  it("retrouve une définition par id", () => {
    expect(getConductBadge("liaison-7")?.label).toBeTruthy();
  });

  it("retourne undefined pour un id inconnu", () => {
    expect(getConductBadge("inexistant")).toBeUndefined();
  });
});
