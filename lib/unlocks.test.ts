import { describe, it, expect } from "vitest";
import {
  UNLOCKS,
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
    ...p,
  };
}

describe("UNLOCKS", () => {
  it("a des identifiants uniques", () => {
    const ids = UNLOCKS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expose exactement un défaut par axe", () => {
    for (const axe of ["frame", "title", "uniform", "cardBg"] as const) {
      const defauts = UNLOCKS.filter((u) => u.axis === axe && u.condition.kind === "default");
      expect(defauts).toHaveLength(1);
    }
  });

  it("compte au moins 25 objets", () => {
    expect(UNLOCKS.length).toBeGreaterThanOrEqual(25);
  });
});

describe("evaluateUnlocks", () => {
  it("donne les défauts à un cadet neuf, et rien d'autre", () => {
    const debloque = evaluateUnlocks(ctx()).filter((u) => u.unlocked);
    expect(debloque).toHaveLength(4);
    expect(debloque.every((u) => u.def.condition.kind === "default")).toBe(true);
  });

  it("débloque sur palier de liaison", () => {
    const statuts = evaluateUnlocks(ctx({ streak: 7 }));
    expect(statuts.find((u) => u.def.id === "orbital")?.unlocked).toBe(true);
    expect(statuts.find((u) => u.def.id === "blanc-glacier")?.unlocked).toBe(false);
  });

  it("débloque sur grade", () => {
    const statuts = evaluateUnlocks(ctx({ totalXp: 10000 }));
    expect(statuts.find((u) => u.def.id === "frame-amiral")?.unlocked).toBe(true);
  });

  it("débloque sur badge possédé", () => {
    const statuts = evaluateUnlocks(ctx({ badges: ["security-shield"] }));
    expect(statuts.find((u) => u.def.id === "corrompu")?.unlocked).toBe(true);
    expect(statuts.find((u) => u.def.id === "rouge-spectre")?.unlocked).toBe(true);
  });

  it("annonce la distance restante d'un objet verrouillé", () => {
    const statut = evaluateUnlocks(ctx({ streak: 4 })).find((u) => u.def.id === "orbital");
    expect(statut?.unlocked).toBe(false);
    expect(statut?.remaining).toContain("3");
  });

  it("n'annonce aucune distance sur un objet obtenu", () => {
    const statut = evaluateUnlocks(ctx({ streak: 7 })).find((u) => u.def.id === "orbital");
    expect(statut?.remaining).toBeNull();
  });
});

describe("nextUnlock", () => {
  it("désigne l'objet verrouillé le plus proche", () => {
    const suivant = nextUnlock(ctx({ streak: 4 }));
    expect(suivant).not.toBeNull();
    expect(suivant?.unlocked).toBe(false);
    // Avec streak: 4, le plus proche est double (streak 5, distance = 1)
    expect(suivant?.def.id).toBe("double");
  });

  it("classe les badges après les conditions mesurables", () => {
    // Contexte où toutes les conditions mesurables sont satisfaites, mais aucun badge
    const toutSaufBadges = ctx({
      streak: 100,
      questsCompleted: 500,
      totalXp: 20000,
      badges: [],
      coursesComplete: 14,
      chaptersComplete: 51,
    });
    const suivant = nextUnlock(toutSaufBadges);
    expect(suivant).not.toBeNull();
    // Le seul objet verrouillé restant est conditionné par un badge
    expect(suivant?.def.condition.kind).toBe("badge");
    // Les badges sont à égalité par construction (distance = Infinity pour tous).
    // L'ordre du catalogue tranche : c'est le premier objet à condition badge.
    const firstBadgeUnlock = UNLOCKS.find((u) => u.condition.kind === "badge");
    expect(suivant?.def.id).toBe(firstBadgeUnlock?.id);
  });

  it("retourne null quand tout est obtenu", () => {
    // Tous les badges dont dépend un titre doivent figurer ici, sinon les
    // titres correspondants restent verrouillés et nextUnlock n'est pas null.
    const tout = ctx({
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
    expect(nextUnlock(tout)).toBeNull();
  });
});

describe("defaultFor", () => {
  it("donne le défaut de chaque axe", () => {
    expect(defaultFor("frame").id).toBe("standard");
    expect(defaultFor("title").id).toBe("cadet");
  });
});
