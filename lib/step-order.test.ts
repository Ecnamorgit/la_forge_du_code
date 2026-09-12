import { describe, it, expect } from "vitest";

import { getChaptersMeta } from "./courses-meta";
import { getChapterData, listChapterSlugs, listCourseSlugs } from "./courses-registry";
import { checkStepOrder, type DoneStep } from "./step-order";

const CHAPITRES = [
  { slug: "chapitre-1", totalSteps: 3 },
  { slug: "chapitre-2", totalSteps: 2 },
];

const faites = (...etapes: [string, number][]): DoneStep[] =>
  etapes.map(([chapter, stepIndex]) => ({ chapter, stepIndex }));

describe("checkStepOrder", () => {
  it("accepte la première étape du premier chapitre", () => {
    expect(checkStepOrder(CHAPITRES, [], "chapitre-1", 0)).toEqual({ ok: true });
  });

  it("accepte l'étape qui suit une étape faite", () => {
    expect(checkStepOrder(CHAPITRES, faites(["chapitre-1", 0]), "chapitre-1", 1).ok).toBe(true);
  });

  it("refuse une étape dont la précédente manque", () => {
    expect(checkStepOrder(CHAPITRES, faites(["chapitre-1", 0]), "chapitre-1", 2).ok).toBe(false);
  });

  it("refuse le début d'un chapitre tant que le précédent n'est pas terminé", () => {
    const done = faites(["chapitre-1", 0], ["chapitre-1", 1]);
    expect(checkStepOrder(CHAPITRES, done, "chapitre-2", 0).ok).toBe(false);
  });

  it("accepte le début d'un chapitre quand le précédent est terminé", () => {
    const done = faites(["chapitre-1", 0], ["chapitre-1", 1], ["chapitre-1", 2]);
    expect(checkStepOrder(CHAPITRES, done, "chapitre-2", 0).ok).toBe(true);
  });

  it("ne confond pas chapitre-1 et chapitre-10", () => {
    const parcours = [
      { slug: "chapitre-1", totalSteps: 1 },
      { slug: "chapitre-10", totalSteps: 1 },
      { slug: "chapitre-11", totalSteps: 1 },
    ];
    expect(checkStepOrder(parcours, faites(["chapitre-1", 0]), "chapitre-11", 0).ok).toBe(false);
  });

  it("refuse un chapitre absent du parcours", () => {
    expect(checkStepOrder(CHAPITRES, [], "chapitre-9", 0).ok).toBe(false);
  });
});

/**
 * Le serveur ordonne les chapitres selon `getChaptersMeta` (la carte), et
 * compte les étapes selon le registre de contenu. Si les deux divergent, il
 * refuserait des étapes que l'interface propose : un apprenant honnête serait
 * bloqué. Invariant dérivé des registres, donc un chapitre ajouté demain est
 * couvert.
 */
describe("la carte et le registre décrivent le même parcours", () => {
  it.each(listCourseSlugs())("%s", (course) => {
    const carte = getChaptersMeta(course);
    expect(carte.map((c) => c.slug)).toEqual(listChapterSlugs(course));
    for (const c of carte) {
      expect(c.totalSteps, `${course}/${c.slug}`).toBe(getChapterData(course, c.slug)!.steps.length);
    }
  });
});
