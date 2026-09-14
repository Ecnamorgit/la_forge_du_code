import { describe, it, expect } from "vitest";

import { getChapterData, listCourseSlugs, listChapterSlugs } from "@/lib/courses-registry";
import { getValidators, listValidatorCourses } from "./index";
import { RUNTIME_CHAPTERS } from "./runtime";

/**
 * Balayage structurel du parcours entier.
 *
 * Les tests par chapitre vérifient qu'un validateur dit juste. Celui-ci vérifie
 * qu'il existe, qu'il est branché, et que l'étape qu'il garde n'est pas vide.
 * Aucun cas n'est écrit à la main : tout est dérivé des deux registres, donc un
 * chapitre ajouté demain est couvert sans qu'on touche à ce fichier.
 *
 * Cf. docs/superpowers/specs/2026-08-06-couverture-validateurs-design.md
 */

/**
 * Chapitres dont les validateurs jugent une EXÉCUTION, pas un texte : ils
 * lisent `ctx.logs` ou `ctx.sql`. Appelés sans contexte ils échouent pour
 * absence de contexte — pas parce que le startCode est incomplet. L'invariant b
 * serait vert sans rien prouver, on les en exclut.
 *
 * L'exclusion est nommée **chapitre par chapitre**, et non par cursus : les
 * chapitres 11 et 12 de `javascript` sont statiques (l'hôte d'API est fictif et
 * ne résout jamais dans le sandbox), donc l'invariant s'y applique. Un chapitre
 * ajouté demain est couvert par défaut ; s'il est runtime, l'invariant échouera
 * bruyamment et il faudra l'inscrire ici — c'est le bon sens de la faute.
 *
 * Leur couverture passe par des tests dédiés qui fournissent un contexte réel.
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
