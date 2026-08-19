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

  // Règle non négociable de la spec : un objet OBTENU ne redevient jamais
  // verrouillé. Trois conditions du catalogue sont réversibles (`double` 5 j,
  // `orbital` 7 j, `blanc-glacier` 14 j) puisque le streak retombe à 1 à la
  // rupture — le cadet garde pourtant sa ligne `UserUnlock`, et le serveur
  // continue d'accepter l'objet.
  it("garde obtenu un objet possédé dont la condition est redevenue fausse", () => {
    const apresRupture = ctx({ streak: 1, owned: ["blanc-glacier", "orbital", "double"] });
    const statuts = evaluateUnlocks(apresRupture);
    for (const id of ["blanc-glacier", "orbital", "double"]) {
      const statut = statuts.find((u) => u.def.id === id);
      expect(statut?.unlocked, id).toBe(true);
      expect(statut?.remaining, id).toBeNull();
    }
  });

  it("laisse verrouillé ce qui n'est ni satisfait ni possédé", () => {
    const statuts = evaluateUnlocks(ctx({ streak: 1, owned: ["blanc-glacier"] }));
    expect(statuts.find((u) => u.def.id === "orbital")?.unlocked).toBe(false);
    expect(statuts.find((u) => u.def.id === "orbital")?.remaining).toContain("6");
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

  it("ne propose jamais un objet déjà possédé", () => {
    // Streak retombé à 1 : `double` (5 j) redevient la cible mesurable la plus
    // proche — sauf qu'il est déjà possédé, et le reproposer serait une fausse
    // piste. C'est `orbital` (7 j) qui doit suivre.
    const suivant = nextUnlock(ctx({ streak: 4, owned: ["double"] }));
    expect(suivant?.def.id).toBe("orbital");
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

describe("cardBgImage", () => {
  it("donne un fichier à chacun des fonds du catalogue", () => {
    for (const def of UNLOCKS.filter((u) => u.axis === "cardBg")) {
      expect(CARD_BG_IMAGE[def.id], def.id).toBeDefined();
    }
  });

  it("ne déclare aucun fichier pour un id hors catalogue", () => {
    const ids = new Set(UNLOCKS.filter((u) => u.axis === "cardBg").map((u) => u.id));
    for (const id of Object.keys(CARD_BG_IMAGE)) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("retombe sur le fond par défaut quand rien n'est choisi ou que l'id est inconnu", () => {
    const parDefaut = CARD_BG_IMAGE[defaultFor("cardBg").id];
    expect(cardBgImage(null)).toBe(parDefaut);
    expect(cardBgImage("fond-inconnu")).toBe(parDefaut);
  });

  it("rend le fichier du fond porté", () => {
    expect(cardBgImage("planet-red")).toBe("/planet-red-v2.png");
    expect(cardBgImage("space-orange")).toBe("/space-background-orange.webp");
  });
});
