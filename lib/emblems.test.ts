import { describe, it, expect } from "vitest";

import { BADGES } from "./badges-catalog";
import { CONDUCT_BADGES } from "./conduct-badges";
import { EMBLEM_OPTIONS, getEmblem } from "./emblems";

describe("EMBLEM_OPTIONS", () => {
  it("couvre les deux catalogues de badges", () => {
    expect(EMBLEM_OPTIONS).toHaveLength(BADGES.length + CONDUCT_BADGES.length);
  });

  it("a des identifiants uniques", () => {
    const ids = EMBLEM_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("donne une frame de sprite aux badges de cursus", () => {
    for (const b of BADGES) {
      expect(getEmblem(b.id)?.frame).toBe(BADGES.indexOf(b));
    }
  });

  it("laisse les badges de conduite sans frame — ils se rendent en emoji", () => {
    for (const b of CONDUCT_BADGES) {
      const opt = getEmblem(b.id);
      expect(opt?.frame).toBeNull();
      expect(opt?.icon).toBe(b.icon);
    }
  });
});

describe("getEmblem", () => {
  it("résout un badge de cursus", () => {
    expect(getEmblem("selene")?.label).toBe("Ingénieur Séléné");
  });

  it("résout un badge de conduite — le cas qui faisait disparaître la pastille", () => {
    expect(getEmblem("sprint")?.label).toBe("Sprinteur");
    expect(getEmblem("veilleur")?.label).toBe("Veilleur");
  });

  it("rend null sur un id inconnu ou absent", () => {
    expect(getEmblem("nawak")).toBeNull();
    expect(getEmblem(null)).toBeNull();
  });
});
