import { describe, it, expect } from "vitest";
import { BADGES } from "./badges-catalog";
import {
  CONDUCT_BADGES,
  evaluateConductBadges,
  getConductBadge,
  type ConductContext,
} from "./conduct-badges";
import type { CompletionRecord } from "./quests";

function step(course: string, day: string, hour = "10"): CompletionRecord {
  return {
    course,
    chapter: "chapitre-1",
    stepIndex: 0,
    completedAt: `${day}T${hour}:00:00.000Z`,
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
  it("never collides with course badges", () => {
    const courseBadgeIds = new Set(BADGES.map((b) => b.id));
    for (const c of CONDUCT_BADGES) {
      expect(courseBadgeIds.has(c.id)).toBe(false);
    }
  });

  it("has unique identifiers", () => {
    const ids = CONDUCT_BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives each one an emoji icon, since there is no sprite sheet", () => {
    for (const b of CONDUCT_BADGES) expect(b.icon.length).toBeGreaterThan(0);
  });
});

describe("evaluateConductBadges", () => {
  it("gives nothing to a brand-new cadet", () => {
    expect(evaluateConductBadges(ctx())).toEqual([]);
  });

  it("awards the liaison tiers", () => {
    expect(evaluateConductBadges(ctx({ streak: 7 }))).toContain("liaison-7");
    expect(evaluateConductBadges(ctx({ streak: 30 }))).toContain("liaison-30");
    expect(evaluateConductBadges(ctx({ streak: 100 }))).toContain("liaison-100");
  });

  it("does not award a tier not yet reached", () => {
    expect(evaluateConductBadges(ctx({ streak: 6 }))).not.toContain("liaison-7");
  });

  it("awards the completed-orders tiers", () => {
    expect(evaluateConductBadges(ctx({ questsCompleted: 50 }))).toContain("quetes-50");
    expect(evaluateConductBadges(ctx({ questsCompleted: 49 }))).not.toContain("quetes-50");
  });

  it("awards 'Sans faute' for 5 complete briefings in a row", () => {
    expect(evaluateConductBadges(ctx({ perfectBriefingRun: 5 }))).toContain("briefing-5");
  });

  it("awards Polyglotte for 5 distinct courses", () => {
    const c = ["html", "css", "javascript", "react", "git"].map((x) => step(x, "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("polyglotte");
  });

  it("awards Sprinteur for 10 steps on the same day", () => {
    const c = Array.from({ length: 10 }, () => step("html", "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("sprint");
  });

  it("does not mistake 10 steps spread over two days for a sprint", () => {
    const c = [
      ...Array.from({ length: 5 }, () => step("html", "2026-08-18")),
      ...Array.from({ length: 5 }, () => step("html", "2026-08-19")),
    ];
    expect(evaluateConductBadges(ctx({ completions: c }))).not.toContain("sprint");
  });

  it("awards Veilleur for a step completed before 5 AM UTC", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "03")] }))
    ).toContain("veilleur");
  });

  it("does not award Veilleur in the middle of the day", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "14")] }))
    ).not.toContain("veilleur");
  });

  it("awards 'Le Retour' at the exact moment the liaison breaks", () => {
    expect(evaluateConductBadges(ctx({ justReturned: true }))).toContain("retour");
    expect(evaluateConductBadges(ctx({ justReturned: false }))).not.toContain("retour");
  });
});

describe("getConductBadge", () => {
  it("finds a definition by id", () => {
    expect(getConductBadge("liaison-7")?.label).toBeTruthy();
  });

  it("returns undefined for an unknown id", () => {
    expect(getConductBadge("inexistant")).toBeUndefined();
  });
});
