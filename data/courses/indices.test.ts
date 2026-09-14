import { describe, it, expect } from "vitest";

import { getChapterData, listChapterSlugs, listCourseSlugs } from "@/lib/courses-registry";

/**
 * Les indices sont affichés comme du texte, jamais interprétés (constat EXE-04
 * de l'audit de sécurité du 2026-09-12). Une entité HTML y apparaîtrait donc
 * telle quelle (« &lt; ») : les chevrons s'écrivent en clair.
 *
 * Dérivé des registres : un chapitre ajouté demain est couvert.
 */

const ENTITE_HTML = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i;

const CHAPITRES = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("indices affichés en texte", () => {
  it.each(CHAPITRES)("$course / $chapter : aucune entité HTML", ({ course, chapter }) => {
    getChapterData(course, chapter)!.steps.forEach((step, i) => {
      expect(ENTITE_HTML.test(step.hint), `étape ${i + 1} : ${step.hint}`).toBe(false);
    });
  });
});
