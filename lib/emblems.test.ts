import { describe, it, expect } from "vitest";

import { BADGES } from "./badges-catalog";
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

  it("gives course badges a sprite frame", () => {
    for (const b of BADGES) {
      expect(getEmblem(b.id)?.frame).toBe(BADGES.indexOf(b));
    }
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
