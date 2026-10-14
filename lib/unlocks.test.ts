import { describe, it, expect } from "vitest";
import {
  CARD_BG_IMAGE,
  UNLOCKS,
  cardBgImage,
  defaultFor,
  evaluateUnlocks,
  nextUnlock,
  type UnlockContext,
} from "./unlocks";

function ctx(p: Partial<UnlockContext> = {}): UnlockContext {
  return {
    streak: 1,
    questsCompleted: 0,
    totalXp: 0,
    badges: [],
    coursesComplete: 0,
    chaptersComplete: 0,
    owned: [],
    ...p,
  };
}

describe("UNLOCKS", () => {
  it("has unique ids", () => {
    const ids = UNLOCKS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exposes exactly one default per axis", () => {
    for (const axe of ["frame", "title", "uniform", "cardBg"] as const) {
      const defaults = UNLOCKS.filter((u) => u.axis === axe && u.condition.kind === "default");
      expect(defaults).toHaveLength(1);
    }
  });

  it("has at least 25 items", () => {
    expect(UNLOCKS.length).toBeGreaterThanOrEqual(25);
  });
});

describe("evaluateUnlocks", () => {
  it("gives the defaults to a new cadet, and nothing else", () => {
    const unlockedItems = evaluateUnlocks(ctx()).filter((u) => u.unlocked);
    expect(unlockedItems).toHaveLength(4);
    expect(unlockedItems.every((u) => u.def.condition.kind === "default")).toBe(true);
  });

  it("unlocks on a liaison milestone", () => {
    const statuses = evaluateUnlocks(ctx({ streak: 7 }));
    expect(statuses.find((u) => u.def.id === "orbital")?.unlocked).toBe(true);
    expect(statuses.find((u) => u.def.id === "blanc-glacier")?.unlocked).toBe(false);
  });

  it("unlocks on rank", () => {
    const statuses = evaluateUnlocks(ctx({ totalXp: 10000 }));
    expect(statuses.find((u) => u.def.id === "frame-amiral")?.unlocked).toBe(true);
  });

  it("unlocks on an owned badge", () => {
    const statuses = evaluateUnlocks(ctx({ badges: ["security-shield"] }));
    expect(statuses.find((u) => u.def.id === "corrompu")?.unlocked).toBe(true);
    expect(statuses.find((u) => u.def.id === "rouge-spectre")?.unlocked).toBe(true);
  });

  it("states the remaining distance of a locked item", () => {
    const unlockStatus = evaluateUnlocks(ctx({ streak: 4 })).find((u) => u.def.id === "orbital");
    expect(unlockStatus?.unlocked).toBe(false);
    expect(unlockStatus?.remaining).toContain("3");
  });

  it("states no distance for an obtained item", () => {
    const unlockStatus = evaluateUnlocks(ctx({ streak: 7 })).find((u) => u.def.id === "orbital");
    expect(unlockStatus?.remaining).toBeNull();
  });

  // An obtained item never becomes locked again, even when the streak drops
  // back to 1 when it breaks: the cadet keeps their `UserUnlock` row.
  it("keeps an owned item obtained when its condition turns false again", () => {
    const afterBreak = ctx({ streak: 1, owned: ["blanc-glacier", "orbital", "double"] });
    const statuses = evaluateUnlocks(afterBreak);
    for (const id of ["blanc-glacier", "orbital", "double"]) {
      const unlockStatus = statuses.find((u) => u.def.id === id);
      expect(unlockStatus?.unlocked, id).toBe(true);
      expect(unlockStatus?.remaining, id).toBeNull();
    }
  });

  it("leaves locked what is neither satisfied nor owned", () => {
    const statuses = evaluateUnlocks(ctx({ streak: 1, owned: ["blanc-glacier"] }));
    expect(statuses.find((u) => u.def.id === "orbital")?.unlocked).toBe(false);
    expect(statuses.find((u) => u.def.id === "orbital")?.remaining).toContain("6");
  });
});

describe("nextUnlock", () => {
  it("picks the closest locked item", () => {
    const nextItem = nextUnlock(ctx({ streak: 4 }));
    expect(nextItem).not.toBeNull();
    expect(nextItem?.unlocked).toBe(false);
    // With streak: 4, the closest is double (streak 5, distance = 1)
    expect(nextItem?.def.id).toBe("double");
  });

  it("ranks badges after the measurable conditions", () => {
    // Context where every measurable condition is met, but no badge
    const allButBadges = ctx({
      streak: 100,
      questsCompleted: 500,
      totalXp: 20000,
      badges: [],
      coursesComplete: 14,
      chaptersComplete: 51,
    });
    const nextItem = nextUnlock(allButBadges);
    expect(nextItem).not.toBeNull();
    // The only locked item left is gated by a badge
    expect(nextItem?.def.condition.kind).toBe("badge");
    // Badges are tied (infinite distance): catalog order breaks the tie,
    // so it is the first item with a badge condition.
    const firstBadgeUnlock = UNLOCKS.find((u) => u.condition.kind === "badge");
    expect(nextItem?.def.id).toBe(firstBadgeUnlock?.id);
  });

  it("never offers an item already owned", () => {
    // With a streak of 4, `double` (5 d) would be the closest target, but it
    // is already owned: `orbital` (7 d) must come next.
    const nextItem = nextUnlock(ctx({ streak: 4, owned: ["double"] }));
    expect(nextItem?.def.id).toBe("orbital");
  });

  it("returns null when everything is obtained", () => {
    // Every badge a title depends on must be listed here, otherwise the
    // matching titles stay locked and nextUnlock is not null.
    const everything = ctx({
      streak: 100,
      questsCompleted: 500,
      totalXp: 20000,
      badges: [
        "security-shield",
        "veilleur",
        "sprint",
        "polyglotte",
        "confins",
        "quetes-50",
        "quetes-200",
        "liaison-30",
        "liaison-100",
        "retour",
      ],
      coursesComplete: 14,
      chaptersComplete: 51,
    });
    expect(nextUnlock(everything)).toBeNull();
  });
});

describe("defaultFor", () => {
  it("gives the default for each axis", () => {
    expect(defaultFor("frame").id).toBe("standard");
    expect(defaultFor("title").id).toBe("cadet");
  });
});

describe("cardBgImage", () => {
  it("gives a file to every background in the catalog", () => {
    for (const def of UNLOCKS.filter((u) => u.axis === "cardBg")) {
      expect(CARD_BG_IMAGE[def.id], def.id).toBeDefined();
    }
  });

  it("declares no file for an id outside the catalog", () => {
    const ids = new Set(UNLOCKS.filter((u) => u.axis === "cardBg").map((u) => u.id));
    for (const id of Object.keys(CARD_BG_IMAGE)) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("falls back to the default background when nothing is chosen or the id is unknown", () => {
    const defaultImage = CARD_BG_IMAGE[defaultFor("cardBg").id];
    expect(cardBgImage(null)).toBe(defaultImage);
    expect(cardBgImage("fond-inconnu")).toBe(defaultImage);
  });

  it("returns the file of the equipped background", () => {
    expect(cardBgImage("planet-red")).toBe("/planet-red-v2.png");
    expect(cardBgImage("space-orange")).toBe("/space-background-orange.webp");
  });
});
