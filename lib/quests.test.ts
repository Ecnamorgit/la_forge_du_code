import { describe, it, expect } from "vitest";
import {
  buildBriefing,
  splitCompletions,
  CLOSING_XP,
  QUEST_XP,
  applyBriefingPayout,
  type Briefing,
  type BriefingPayoutState,
  type CompletionRecord,
  type Quest,
  type QuestContext,
  type QuestSlot,
} from "./quests";

const CHAPTERS = {
  html: [
    { slug: "chapitre-1", totalSteps: 4 },
    { slug: "chapitre-2", totalSteps: 4 },
  ],
  css: [{ slug: "chapitre-1", totalSteps: 4 }],
  javascript: [{ slug: "chapitre-1", totalSteps: 4 }],
};

function step(
  course: string,
  chapter: string,
  stepIndex: number,
  day: string
): CompletionRecord {
  return { course, chapter, stepIndex, completedAt: `${day}T10:00:00.000Z` };
}

function ctx(p: Partial<QuestContext> = {}): QuestContext {
  return {
    userId: "cadet-1",
    todayIso: "2026-08-19",
    past: [],
    today: [],
    chaptersByCourse: CHAPTERS,
    ...p,
  };
}

/** N consecutive ISO days starting at `start`, to sweep the draw. */
function consecutiveDays(start: string, n: number): string[] {
  const days: string[] = [];
  const d = new Date(`${start}T00:00:00.000Z`);
  for (let i = 0; i < n; i++) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

describe("splitCompletions", () => {
  it("separates the strict past from the current day", () => {
    const all = [
      step("html", "chapitre-1", 0, "2026-08-18"),
      step("html", "chapitre-1", 1, "2026-08-19"),
    ];
    const { past, today } = splitCompletions(all, "2026-08-19");
    expect(past).toHaveLength(1);
    expect(today).toHaveLength(1);
    expect(today[0].stepIndex).toBe(1);
  });
});

/**
 * A past where each slot has several feasible archetypes, so the draw can
 * vary: html/chapitre-1 at 3/4 (boucler-chapitre),
 * html/chapitre-2 at 1/4 (serie-chapitre), css left idle since 2026-08-01
 * (cursus-dormant), javascript never opened (premiere-fois), two courses
 * touched (second-front).
 */
const RICH_PAST: CompletionRecord[] = [
  step("html", "chapitre-1", 0, "2026-08-18"),
  step("html", "chapitre-1", 1, "2026-08-18"),
  step("html", "chapitre-1", 2, "2026-08-18"),
  step("html", "chapitre-2", 0, "2026-08-18"),
  step("css", "chapitre-1", 0, "2026-08-01"),
];

const SLOTS = ["reprise", "effort", "curiosite"] as const;

describe("buildBriefing — determinism", () => {
  it("returns the same briefing for the same cadet on the same day", () => {
    const a = buildBriefing(ctx({ past: RICH_PAST }));
    const b = buildBriefing(ctx({ past: RICH_PAST }));
    expect(a.quests.map((q) => q.id)).toEqual(b.quests.map((q) => q.id));
  });

  it("each slot varies from one day to the next", () => {
    const days = consecutiveDays("2026-08-19", 20);
    for (const slot of SLOTS) {
      const idsPerDay = days.map(
        (j) =>
          buildBriefing(ctx({ past: RICH_PAST, todayIso: j })).quests.find(
            (q) => q.slot === slot
          )?.id
      );
      const distinctIds = new Set(idsPerDay);
      expect(
        distinctIds.size,
        `emplacement ${slot} sur ${days.length} jours : ${idsPerDay.join(", ")}`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("each slot varies from one cadet to another", () => {
    const cadets = Array.from({ length: 10 }, (_, i) => `cadet-${i + 1}`);
    for (const slot of SLOTS) {
      const idsPerCadet = cadets.map(
        (u) =>
          buildBriefing(ctx({ past: RICH_PAST, userId: u })).quests.find(
            (q) => q.slot === slot
          )?.id
      );
      const distinctIds = new Set(idsPerCadet);
      expect(
        distinctIds.size,
        `emplacement ${slot} sur ${cadets.length} cadets : ${idsPerCadet.join(", ")}`
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("buildBriefing — the feasibility trap", () => {
  it("does not change the draw when the cadet works during the day", () => {
    const past = [
      step("html", "chapitre-1", 0, "2026-08-01"),
      step("html", "chapitre-1", 1, "2026-08-01"),
      step("html", "chapitre-1", 2, "2026-08-01"),
    ];
    const before = buildBriefing(ctx({ past }));
    const after = buildBriefing(
      ctx({ past, today: [step("html", "chapitre-1", 3, "2026-08-19")] })
    );
    expect(after.quests.map((q) => q.id)).toEqual(before.quests.map((q) => q.id));
  });
});

describe("buildBriefing — progress", () => {
  it("counts today's steps for the reprise order", () => {
    const b = buildBriefing(
      ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] })
    );
    const resumeQuest = b.quests.find((q) => q.slot === "reprise");
    expect(resumeQuest?.progress).toBe(1);
  });

  it("never counts yesterday's steps", () => {
    const b = buildBriefing(
      ctx({ past: [step("html", "chapitre-1", 0, "2026-08-18")] })
    );
    const resumeQuest = b.quests.find((q) => q.slot === "reprise");
    expect(resumeQuest?.progress).toBe(0);
  });

  it("marks the briefing complete when every order is reached", () => {
    // Empty past: resumeQuest (1 or 2 steps), effort (5 steps), curiosity
    // (open the first untouched course in alphabetical order, css).
    const today = [
      ...Array.from({ length: 6 }, (_, i) => step("html", "chapitre-1", i % 4, "2026-08-19")),
      ...Array.from({ length: 6 }, (_, i) => step("css", "chapitre-1", i % 4, "2026-08-19")),
    ];
    const b = buildBriefing(ctx({ today }));
    expect(b.quests.every((q) => q.done)).toBe(true);
    expect(b.complete).toBe(true);
  });

  it("is not complete while an order is missing", () => {
    const b = buildBriefing(ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] }));
    expect(b.complete).toBe(false);
  });
});

describe("buildBriefing — feasibility", () => {
  it("issues at most one order per slot", () => {
    const b = buildBriefing(ctx());
    const slots = b.quests.map((q) => q.slot);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("gives a full briefing from the first day", () => {
    const b = buildBriefing(ctx());
    expect(b.quests.length).toBe(3);
  });

  it("never offers to finish a chapter that is already finished", () => {
    // html/chapitre-1 is finished (4/4): boucler-chapitre can only target
    // html/chapitre-2, which is 50% done. `drawn` guarantees the archetype was
    // actually drawn at least once.
    const past = [
      step("html", "chapitre-1", 0, "2026-08-01"),
      step("html", "chapitre-1", 1, "2026-08-01"),
      step("html", "chapitre-1", 2, "2026-08-01"),
      step("html", "chapitre-1", 3, "2026-08-01"),
      step("html", "chapitre-2", 0, "2026-08-01"),
      step("html", "chapitre-2", 1, "2026-08-01"),
    ];
    const days = consecutiveDays("2026-08-19", 20);
    let drawn = false;
    for (const day of days) {
      const b = buildBriefing(ctx({ past, todayIso: day }));
      const finishQuest = b.quests.find((q) => q.id === "boucler-chapitre");
      if (finishQuest) {
        drawn = true;
        expect(`${finishQuest.course}/${finishQuest.chapter}`).toBe("html/chapitre-2");
      }
    }
    expect(drawn, `boucler-chapitre jamais tiré sur ${days.length} jours`).toBe(true);
  });

  it("does not offer to open a course when all of them are started", () => {
    const past = ["html", "css", "javascript"].map((c) =>
      step(c, "chapitre-1", 0, "2026-08-01")
    );
    for (const day of ["2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22"]) {
      const b = buildBriefing(ctx({ past, todayIso: day }));
      expect(b.quests.some((q) => q.id === "premiere-fois")).toBe(false);
    }
  });

  it("issues fewer than three orders when a slot has nothing feasible", () => {
    // A single course, already started yesterday: no curiosity archetype fits.
    // second-front needs 2 courses, cursus-dormant needs 7 idle days,
    // premiere-fois needs an untouched course.
    const b = buildBriefing(
      ctx({
        chaptersByCourse: { html: CHAPTERS.html },
        past: [step("html", "chapitre-1", 0, "2026-08-18")],
      })
    );
    expect(b.quests.some((q) => q.slot === "curiosite")).toBe(false);
    expect(b.quests).toHaveLength(2);
  });
});

describe("scoring table", () => {
  it("caps the day at 60 XP", () => {
    const total = QUEST_XP.reprise + QUEST_XP.effort + QUEST_XP.curiosite + CLOSING_XP;
    expect(total).toBe(60);
  });
});

// Briefing payout

function quest(slot: QuestSlot, done: boolean, label = `ordre ${slot}`): Quest {
  return {
    id: `id-${slot}`,
    slot,
    label,
    progress: done ? 1 : 0,
    target: 1,
    done,
    course: null,
    chapter: null,
    xp: QUEST_XP[slot],
  };
}

function briefing(quests: Quest[], dateIso = "2026-08-19"): Briefing {
  return {
    dateIso,
    quests,
    complete: quests.length > 0 && quests.every((q) => q.done),
  };
}

function payoutState(p: Partial<BriefingPayoutState> = {}): BriefingPayoutState {
  return {
    claimedMask: 0,
    claimedDay: "",
    perfectRun: 0,
    lastPerfectDay: "",
    ...p,
  };
}

describe("applyBriefingPayout", () => {
  it("pays nothing when no order is fulfilled", () => {
    const b = briefing([quest("reprise", false), quest("effort", false)]);
    const out = applyBriefingPayout(b, payoutState(), "2026-08-19");

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
    expect(out.paidLabels).toEqual([]);
    expect(out.nextMask).toBe(0);
  });

  it("pays the fulfilled orders on a blank mask", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", false)]);
    const out = applyBriefingPayout(b, payoutState(), "2026-08-19");

    expect(out.bonusXp).toBe(QUEST_XP.reprise + QUEST_XP.effort);
    expect(out.questsPaid).toBe(2);
    expect(out.paidLabels).toEqual(["ordre reprise", "ordre effort"]);
    // bit 0 (resumeQuest) + bit 1 (effort), curiosity is still to be paid.
    expect(out.nextMask).toBe(0b011);
  });

  it("does not pay again for an order already paid today", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", false)]);
    const alreadyPaid = payoutState({ claimedMask: 0b001, claimedDay: "2026-08-19" });
    const out = applyBriefingPayout(b, alreadyPaid, "2026-08-19");

    expect(out.bonusXp).toBe(QUEST_XP.effort);
    expect(out.questsPaid).toBe(1);
    expect(out.paidLabels).toEqual(["ordre effort"]);
    expect(out.nextMask).toBe(0b011);
  });

  it("announces only the truly new orders, not all fulfilled ones", () => {
    // Second step of the day: all three orders are fulfilled, but two were
    // already paid out. The end-of-step screen must not re-announce them.
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ claimedMask: 0b011, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.paidLabels).toEqual(["ordre curiosite"]);
    expect(out.questsPaid).toBe(1);
  });

  it("ignores a mask carried over from another day", () => {
    // The cadet finished everything three days ago; their mask is full. It
    // must not block today's payout.
    const b = briefing([quest("reprise", true), quest("effort", false)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ claimedMask: 0b1111, claimedDay: "2026-08-16" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(QUEST_XP.reprise);
    expect(out.questsPaid).toBe(1);
    expect(out.nextMask).toBe(0b0001);
  });

  it("pays the completion bonus when every order is fulfilled", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(b, payoutState(), "2026-08-19");

    expect(out.bonusXp).toBe(
      QUEST_XP.reprise + QUEST_XP.effort + QUEST_XP.curiosite + CLOSING_XP
    );
    // The three orders + bit 3 reserved for the completion bonus.
    expect(out.nextMask).toBe(0b1111);
    // The completion bonus is not an order: it does not count in questsPaid.
    expect(out.questsPaid).toBe(3);
  });

  it("reaches exactly the 60 XP cap on a complete briefing", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    expect(applyBriefingPayout(b, payoutState(), "2026-08-19").bonusXp).toBe(60);
  });

  it("does not pay the completion bonus twice", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ claimedMask: 0b1111, claimedDay: "2026-08-19", perfectRun: 1, lastPerfectDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
    expect(out.perfectRun).toBe(1);
  });

  it("continues the perfect streak when the previous day was perfect", () => {
    const b = briefing([quest("reprise", true), quest("effort", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ perfectRun: 4, lastPerfectDay: "2026-08-18" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(5);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("restarts at 1 when a gap breaks the perfect streak", () => {
    const b = briefing([quest("reprise", true), quest("effort", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ perfectRun: 9, lastPerfectDay: "2026-08-16" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(1);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("starts the perfect streak at 1 when there never was one", () => {
    const b = briefing([quest("reprise", true)]);
    const out = applyBriefingPayout(b, payoutState(), "2026-08-19");

    expect(out.perfectRun).toBe(1);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("leaves the perfect streak untouched when the briefing is not finished", () => {
    const b = briefing([quest("reprise", true), quest("effort", false)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ perfectRun: 3, lastPerfectDay: "2026-08-18" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(3);
    expect(out.lastPerfectDay).toBe("2026-08-18");
  });

  it("bases the bit on the slot, not on the position in the array", () => {
    // Degraded briefing: curiosity is the only order issued, so at index 0.
    // Its bit must stay the curiosity bit (2).
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(b, payoutState(), "2026-08-19");

    expect(out.nextMask & 0b100).toBe(0b100);
    expect(out.nextMask & 0b001).toBe(0);
  });

  it("does not pay again for the already paid curiosity order of a degraded briefing", () => {
    // The only order issued is already paid (bit 2). The briefing is `complete`
    // and the completion bonus was never paid: it is due, the order is not.
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ claimedMask: 0b100, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.questsPaid).toBe(0);
    expect(out.paidLabels).toEqual([]);
    expect(out.bonusXp).toBe(CLOSING_XP);
  });

  it("pays nothing more when both the order and the completion bonus are paid", () => {
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      payoutState({ claimedMask: 0b1100, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
  });
});
