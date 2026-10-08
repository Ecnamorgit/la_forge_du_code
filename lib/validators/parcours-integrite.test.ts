import { describe, it, expect } from "vitest";

import { getChapterData, listCourseSlugs, listChapterSlugs } from "@/lib/courses-registry";
import { getValidators, listValidatorCourses } from "./index";
import { RUNTIME_CHAPTERS } from "./runtime";

/**
 * Balayage structurel du parcours entier.
 *
 * Les tests par chapitre vérifient qu'un validateur dit juste. Celui-ci vérifie
 * qu'il existe, qu'il est branché, et que l'étape qu'il garde n'est pas vide.
 * Tout est dérivé des deux registres : un nouveau chapitre est couvert sans
 * toucher à ce fichier.
 */

/**
 * Chapitres jugés sur une exécution (voir `runtime.ts`) : sans contexte, leurs
 * validateurs échouent quel que soit le startCode, l'invariant ne prouverait
 * rien. Des tests dédiés les couvrent avec un contexte réel.
 */
const ETAPES_RUNTIME = RUNTIME_CHAPTERS;

/** Un couple (cursus, chapitre) par chapitre déclaré au registre de contenu. */
const CHAPITRES = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("registres de contenu et de validateurs", () => {
  it("déclarent exactement les mêmes cursus", () => {
    expect([...listValidatorCourses()].sort()).toEqual([...listCourseSlugs()].sort());
  });

  it("exposent au moins un chapitre", () => {
    expect(CHAPITRES.length).toBeGreaterThan(0);
  });
});

describe("chaque chapitre est validable", () => {
  describe.each(CHAPITRES)("$course / $chapter", ({ course, chapter }) => {
    it("a autant de validateurs que d'étapes", () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} absent du registre de contenu`).not.toBeNull();

      const validators = getValidators(course, chapter);

      // Une étape sans validateur est invalidable : l'apprenant reste bloqué
      // sans recours. Un validateur sans étape ne s'exécutera jamais.
      expect(
        validators.length,
        `${course}/${chapter} : ${validators.length} validateur(s) pour ` +
          `${data!.steps.length} étape(s).`
      ).toBe(data!.steps.length);
    });
  });
});

describe("le code de départ ne valide jamais son étape", () => {
  const testables = CHAPITRES.filter(
    ({ course, chapter }) => !ETAPES_RUNTIME.has(`${course}/${chapter}`)
  );

  describe.each(testables)("$course / $chapter", ({ course, chapter }) => {
    const data = getChapterData(course, chapter)!;
    const validators = getValidators(course, chapter);

    data.steps.forEach((step, i) => {
      it(`étape ${i + 1}`, () => {
        const valider = validators[i];
        expect(valider, `pas de validateur pour l'étape ${i + 1}`).toBeTypeOf("function");

        // Si le startCode passe déjà, l'étape est vide : l'apprenant clique
        // « valider » et réussit sans rien écrire. Rien d'autre ne le signale.
        expect(
          valider(step.startCode).ok,
          `${course}/${chapter} étape ${i + 1} : le code de départ valide déjà. ` +
            `L'apprenant n'a rien à faire.`
        ).toBe(false);
      });
    });
  });
});
