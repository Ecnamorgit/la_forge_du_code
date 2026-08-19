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

const CHAPITRES = {
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
  jour: string
): CompletionRecord {
  return { course, chapter, stepIndex, completedAt: `${jour}T10:00:00.000Z` };
}

function ctx(p: Partial<QuestContext> = {}): QuestContext {
  return {
    userId: "cadet-1",
    todayIso: "2026-08-19",
    past: [],
    today: [],
    chaptersByCourse: CHAPITRES,
    ...p,
  };
}

/**
 * N jours ISO consécutifs à partir de `depart`. Donnée de test pour balayer
 * le tirage sur plusieurs jours — ce n'est pas une lecture d'horloge
 * applicative, `buildBriefing` reste nourri par un `todayIso` explicite.
 */
function joursConsecutifs(depart: string, n: number): string[] {
  const jours: string[] = [];
  const d = new Date(`${depart}T00:00:00.000Z`);
  for (let i = 0; i < n; i++) {
    jours.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return jours;
}

describe("splitCompletions", () => {
  it("sépare le passé strict du jour courant", () => {
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
 * Passé « riche » : chaque emplacement a plusieurs archétypes faisables, donc
 * le tirage a réellement de quoi varier. Avec un passé vide, l'emplacement
 * effort n'aurait qu'un seul candidat et les tests de variété seraient vrais
 * par accident.
 *   - html/chapitre-1 à 3/4  → boucler-chapitre faisable (≥ 50 %)
 *   - html/chapitre-2 à 1/4  → serie-chapitre faisable (≥ 3 restantes)
 *   - css touché le 2026-08-01 → cursus-dormant faisable (≥ 7 jours)
 *   - javascript jamais touché → premiere-fois faisable
 *   - 2 cursus touchés        → second-front faisable
 */
const PASSE_RICHE: CompletionRecord[] = [
  step("html", "chapitre-1", 0, "2026-08-18"),
  step("html", "chapitre-1", 1, "2026-08-18"),
  step("html", "chapitre-1", 2, "2026-08-18"),
  step("html", "chapitre-2", 0, "2026-08-18"),
  step("css", "chapitre-1", 0, "2026-08-01"),
];

const EMPLACEMENTS = ["reprise", "effort", "curiosite"] as const;

describe("buildBriefing — déterminisme", () => {
  it("rend le même briefing pour le même cadet le même jour", () => {
    const a = buildBriefing(ctx({ past: PASSE_RICHE }));
    const b = buildBriefing(ctx({ past: PASSE_RICHE }));
    expect(a.quests.map((q) => q.id)).toEqual(b.quests.map((q) => q.id));
  });

  it("chaque emplacement varie d'un jour à l'autre", () => {
    const jours = joursConsecutifs("2026-08-19", 20);
    for (const slot of EMPLACEMENTS) {
      const idsParJour = jours.map(
        (j) =>
          buildBriefing(ctx({ past: PASSE_RICHE, todayIso: j })).quests.find(
            (q) => q.slot === slot
          )?.id
      );
      const distincts = new Set(idsParJour);
      expect(
        distincts.size,
        `emplacement ${slot} sur ${jours.length} jours : ${idsParJour.join(", ")}`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("chaque emplacement varie d'un cadet à l'autre", () => {
    const cadets = Array.from({ length: 10 }, (_, i) => `cadet-${i + 1}`);
    for (const slot of EMPLACEMENTS) {
      const idsParCadet = cadets.map(
        (u) =>
          buildBriefing(ctx({ past: PASSE_RICHE, userId: u })).quests.find(
            (q) => q.slot === slot
          )?.id
      );
      const distincts = new Set(idsParCadet);
      expect(
        distincts.size,
        `emplacement ${slot} sur ${cadets.length} cadets : ${idsParCadet.join(", ")}`
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("buildBriefing — le piège de la faisabilité", () => {
  it("ne change pas le tirage quand le cadet travaille dans la journée", () => {
    const past = [
      step("html", "chapitre-1", 0, "2026-08-01"),
      step("html", "chapitre-1", 1, "2026-08-01"),
      step("html", "chapitre-1", 2, "2026-08-01"),
    ];
    const avant = buildBriefing(ctx({ past }));
    const apres = buildBriefing(
      ctx({ past, today: [step("html", "chapitre-1", 3, "2026-08-19")] })
    );
    expect(apres.quests.map((q) => q.id)).toEqual(avant.quests.map((q) => q.id));
  });
});

describe("buildBriefing — progression", () => {
  it("compte les étapes du jour pour l'ordre de reprise", () => {
    const b = buildBriefing(
      ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] })
    );
    const reprise = b.quests.find((q) => q.slot === "reprise");
    expect(reprise?.progress).toBe(1);
  });

  it("ne compte jamais les étapes d'hier", () => {
    const b = buildBriefing(
      ctx({ past: [step("html", "chapitre-1", 0, "2026-08-18")] })
    );
    const reprise = b.quests.find((q) => q.slot === "reprise");
    expect(reprise?.progress).toBe(0);
  });

  it("marque le briefing complet quand tous les ordres sont atteints", () => {
    // Passé vide → reprise (1 ou 2 étapes), effort (5 étapes), curiosité
    // (ouvrir le premier cursus vierge par ordre alphabétique : css).
    const today = [
      ...Array.from({ length: 6 }, (_, i) => step("html", "chapitre-1", i % 4, "2026-08-19")),
      ...Array.from({ length: 6 }, (_, i) => step("css", "chapitre-1", i % 4, "2026-08-19")),
    ];
    const b = buildBriefing(ctx({ today }));
    expect(b.quests.every((q) => q.done)).toBe(true);
    expect(b.complete).toBe(true);
  });

  it("n'est pas complet tant qu'un ordre manque", () => {
    const b = buildBriefing(ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] }));
    expect(b.complete).toBe(false);
  });
});

describe("buildBriefing — faisabilité", () => {
  it("émet au plus un ordre par emplacement", () => {
    const b = buildBriefing(ctx());
    const slots = b.quests.map((q) => q.slot);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("donne un briefing complet dès le premier jour", () => {
    const b = buildBriefing(ctx());
    expect(b.quests.length).toBe(3);
  });

  it("ne propose jamais de boucler un chapitre déjà bouclé", () => {
    // html/chapitre-1 est terminé (4/4) : chaptersInProgress l'exclut, donc
    // boucler-chapitre ne peut viser que html/chapitre-2, entamé à 50 %.
    // Sans un chapitre réellement en cours au-delà de la moitié, l'archétype
    // ne serait jamais faisable et ce test passerait sans jamais s'exécuter.
    const past = [
      step("html", "chapitre-1", 0, "2026-08-01"),
      step("html", "chapitre-1", 1, "2026-08-01"),
      step("html", "chapitre-1", 2, "2026-08-01"),
      step("html", "chapitre-1", 3, "2026-08-01"),
      step("html", "chapitre-2", 0, "2026-08-01"),
      step("html", "chapitre-2", 1, "2026-08-01"),
    ];
    const jours = joursConsecutifs("2026-08-19", 20);
    let tire = false;
    for (const jour of jours) {
      const b = buildBriefing(ctx({ past, todayIso: jour }));
      const boucle = b.quests.find((q) => q.id === "boucler-chapitre");
      if (boucle) {
        tire = true;
        expect(`${boucle.course}/${boucle.chapter}`).toBe("html/chapitre-2");
      }
    }
    expect(tire, `boucler-chapitre jamais tiré sur ${jours.length} jours`).toBe(true);
  });

  it("ne propose pas d'ouvrir un cursus quand tous sont entamés", () => {
    const past = ["html", "css", "javascript"].map((c) =>
      step(c, "chapitre-1", 0, "2026-08-01")
    );
    for (const jour of ["2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22"]) {
      const b = buildBriefing(ctx({ past, todayIso: jour }));
      expect(b.quests.some((q) => q.id === "premiere-fois")).toBe(false);
    }
  });

  it("émet moins de trois ordres quand un emplacement n'a rien de faisable", () => {
    // Un seul cursus, déjà entamé hier : aucun archétype de curiosité ne tient.
    // second-front veut 2 cursus, cursus-dormant veut 7 jours d'oubli,
    // premiere-fois veut un cursus vierge.
    const b = buildBriefing(
      ctx({
        chaptersByCourse: { html: CHAPITRES.html },
        past: [step("html", "chapitre-1", 0, "2026-08-18")],
      })
    );
    expect(b.quests.some((q) => q.slot === "curiosite")).toBe(false);
    expect(b.quests).toHaveLength(2);
  });
});

describe("barème", () => {
  it("plafonne la journée à 60 XP", () => {
    const total = QUEST_XP.reprise + QUEST_XP.effort + QUEST_XP.curiosite + CLOSING_XP;
    expect(total).toBe(60);
  });
});

// --- Versement du briefing ------------------------------------------------

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

function etat(p: Partial<BriefingPayoutState> = {}): BriefingPayoutState {
  return {
    claimedMask: 0,
    claimedDay: "",
    perfectRun: 0,
    lastPerfectDay: "",
    ...p,
  };
}

describe("applyBriefingPayout", () => {
  it("ne paie rien quand aucun ordre n'est accompli", () => {
    const b = briefing([quest("reprise", false), quest("effort", false)]);
    const out = applyBriefingPayout(b, etat(), "2026-08-19");

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
    expect(out.paidLabels).toEqual([]);
    expect(out.nextMask).toBe(0);
  });

  it("paie les ordres accomplis sur un masque vierge", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", false)]);
    const out = applyBriefingPayout(b, etat(), "2026-08-19");

    expect(out.bonusXp).toBe(QUEST_XP.reprise + QUEST_XP.effort);
    expect(out.questsPaid).toBe(2);
    expect(out.paidLabels).toEqual(["ordre reprise", "ordre effort"]);
    // bit 0 (reprise) + bit 1 (effort), la curiosité reste à payer.
    expect(out.nextMask).toBe(0b011);
  });

  it("ne repaie pas un ordre déjà payé aujourd'hui", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", false)]);
    const dejaPaye = etat({ claimedMask: 0b001, claimedDay: "2026-08-19" });
    const out = applyBriefingPayout(b, dejaPaye, "2026-08-19");

    expect(out.bonusXp).toBe(QUEST_XP.effort);
    expect(out.questsPaid).toBe(1);
    expect(out.paidLabels).toEqual(["ordre effort"]);
    expect(out.nextMask).toBe(0b011);
  });

  it("n'annonce que les ordres réellement neufs, pas tous les accomplis", () => {
    // Deuxième étape de la journée : les trois ordres sont accomplis, mais deux
    // ont déjà été payés. L'écran de fin d'étape ne doit pas les réannoncer.
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ claimedMask: 0b011, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.paidLabels).toEqual(["ordre curiosite"]);
    expect(out.questsPaid).toBe(1);
  });

  it("ignore un masque hérité d'un autre jour", () => {
    // Le cadet a tout bouclé il y a trois jours ; son masque est plein. Il ne
    // doit pas empêcher le versement d'aujourd'hui.
    const b = briefing([quest("reprise", true), quest("effort", false)]);
    const out = applyBriefingPayout(
      b,
      etat({ claimedMask: 0b1111, claimedDay: "2026-08-16" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(QUEST_XP.reprise);
    expect(out.questsPaid).toBe(1);
    expect(out.nextMask).toBe(0b0001);
  });

  it("verse le bonus de clôture quand tous les ordres sont accomplis", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(b, etat(), "2026-08-19");

    expect(out.bonusXp).toBe(
      QUEST_XP.reprise + QUEST_XP.effort + QUEST_XP.curiosite + CLOSING_XP
    );
    // Les trois ordres + le bit 3 réservé à la clôture.
    expect(out.nextMask).toBe(0b1111);
    // La clôture n'est pas un ordre : elle ne compte pas dans questsPaid.
    expect(out.questsPaid).toBe(3);
  });

  it("atteint exactement le plafond de 60 XP sur un briefing complet", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    expect(applyBriefingPayout(b, etat(), "2026-08-19").bonusXp).toBe(60);
  });

  it("ne verse pas deux fois le bonus de clôture", () => {
    const b = briefing([quest("reprise", true), quest("effort", true), quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ claimedMask: 0b1111, claimedDay: "2026-08-19", perfectRun: 1, lastPerfectDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
    expect(out.perfectRun).toBe(1);
  });

  it("continue la série parfaite quand la veille l'était", () => {
    const b = briefing([quest("reprise", true), quest("effort", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ perfectRun: 4, lastPerfectDay: "2026-08-18" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(5);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("repart à 1 quand un trou coupe la série parfaite", () => {
    const b = briefing([quest("reprise", true), quest("effort", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ perfectRun: 9, lastPerfectDay: "2026-08-16" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(1);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("démarre la série parfaite à 1 quand il n'y en avait jamais eu", () => {
    const b = briefing([quest("reprise", true)]);
    const out = applyBriefingPayout(b, etat(), "2026-08-19");

    expect(out.perfectRun).toBe(1);
    expect(out.lastPerfectDay).toBe("2026-08-19");
  });

  it("laisse la série parfaite intacte quand le briefing n'est pas bouclé", () => {
    const b = briefing([quest("reprise", true), quest("effort", false)]);
    const out = applyBriefingPayout(
      b,
      etat({ perfectRun: 3, lastPerfectDay: "2026-08-18" }),
      "2026-08-19"
    );

    expect(out.perfectRun).toBe(3);
    expect(out.lastPerfectDay).toBe("2026-08-18");
  });

  it("assied le bit sur l'emplacement, pas sur la position dans le tableau", () => {
    // Briefing dégradé : la curiosité est le SEUL ordre émis, donc à l'index 0.
    // Son bit doit rester celui de la curiosité (2), sans quoi un jour à deux
    // ordres et un jour à trois ordres se marcheraient dessus dans le masque.
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(b, etat(), "2026-08-19");

    expect(out.nextMask & 0b100).toBe(0b100);
    expect(out.nextMask & 0b001).toBe(0);
  });

  it("ne repaie pas la curiosité d'un briefing dégradé déjà payée", () => {
    // Le seul ordre émis est déjà payé (bit 2). Un briefing dégradé dont
    // l'unique ordre est accompli est `complete` : la clôture, elle, n'a jamais
    // été versée, elle est donc due — mais l'ordre, non.
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ claimedMask: 0b100, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.questsPaid).toBe(0);
    expect(out.paidLabels).toEqual([]);
    expect(out.bonusXp).toBe(CLOSING_XP);
  });

  it("ne repaie plus rien quand ordre et clôture sont tous deux payés", () => {
    const b = briefing([quest("curiosite", true)]);
    const out = applyBriefingPayout(
      b,
      etat({ claimedMask: 0b1100, claimedDay: "2026-08-19" }),
      "2026-08-19"
    );

    expect(out.bonusXp).toBe(0);
    expect(out.questsPaid).toBe(0);
  });
});
