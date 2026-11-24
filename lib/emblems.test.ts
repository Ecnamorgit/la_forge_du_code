import { describe, it, expect } from "vitest";

import { BADGES, BADGE_FRAMES_DRAWN } from "./badges-catalog";
import { CONDUCT_BADGES } from "./conduct-badges";
import { EMBLEM_OPTIONS, getEmblem } from "./emblems";

describe("EMBLEM_OPTIONS", () => {
  it("covers both badge catalogs", () => {
    expect(EMBLEM_OPTIONS).toHaveLength(BADGES.length + CONDUCT_BADGES.length);
  });

  it("has unique identifiers", () => {
    const ids = EMBLEM_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives course badges a sprite frame, once drawn in the sheet", () => {
    BADGES.forEach((b, i) => {
      // Badges past the drawn frames (rust, agent-ia) render as emoji until
      // their pixel art joins /sprites/badges.png.
      expect(getEmblem(b.id)?.frame).toBe(i < BADGE_FRAMES_DRAWN ? i : null);
    });
  });

  it("has at least one badge still waiting for its sprite", () => {
    expect(BADGES.length).toBeGreaterThan(BADGE_FRAMES_DRAWN);
    expect(getEmblem("rust-master")?.frame).toBeNull();
  });

  it("leaves conduct badges without a frame — they render as emoji", () => {
    for (const b of CONDUCT_BADGES) {
      const opt = getEmblem(b.id);
      expect(opt?.frame).toBeNull();
      expect(opt?.icon).toBe(b.icon);
    }
  });
});

describe("getEmblem", () => {
  it("resolves a course badge", () => {
    expect(getEmblem("selene")?.label).toBe("Ingénieur Séléné");
  });

  it("resolves a conduct badge — the case that made the badge chip disappear", () => {
    expect(getEmblem("sprint")?.label).toBe("Sprinteur");
    expect(getEmblem("veilleur")?.label).toBe("Veilleur");
  });

  it("returns null for an unknown or missing id", () => {
    expect(getEmblem("nawak")).toBeNull();
    expect(getEmblem(null)).toBeNull();
  });
});
