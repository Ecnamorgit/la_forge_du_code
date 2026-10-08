import { describe, it, expect } from "vitest";

import type { ChapterData } from "@/data/courses/html/types";
import { chapitre1 } from "@/data/courses/html/chapitre-1";
import { chapitre2 } from "@/data/courses/html/chapitre-2";
import { chapitre3 } from "@/data/courses/html/chapitre-3";
import { chapitre4 } from "@/data/courses/html/chapitre-4";
import { chapitre5 } from "@/data/courses/html/chapitre-5";
import { chapitre6 } from "@/data/courses/html/chapitre-6";
import { chapitre7 } from "@/data/courses/html/chapitre-7";
import { chapitre8 } from "@/data/courses/html/chapitre-8";
import { VALIDATORS_BY_CHAPTER } from "./index";

/**
 * Couverture complète du parcours HTML (8 chapitres, 31 étapes).
 *
 * Le cours est cumulatif : le `startCode` de l'étape N+1 est la solution
 * attendue de l'étape N. Chaque validateur doit donc refuser le `startCode` de
 * sa propre étape, accepter le suivant (ou une solution écrite à la main pour
 * la dernière étape), et renvoyer un `objList` identique aux `objectives`
 * déclarés dans le chapitre.
 */

// Solution de la dernière étape de chaque chapitre, qui n'a pas de
// `startCode` suivant d'où la dériver.
const LAST_STEP_SOLUTION: Record<string, string> = {
  "chapitre-1":
    "<!DOCTYPE html><html><head><title>T</title></head><body><h1>Hello World</h1></body></html>",
  "chapitre-2":
    '<!DOCTYPE html><html><body><h1>R</h1><nav><a href="https://developer.mozilla.org" target="_blank">MDN</a><a href="#missions">M</a><a href="#contact">C</a></nav><section id="missions"><h2>M</h2></section><section id="contact"><h2>C</h2></section></body></html>',
  "chapitre-3":
    '<!DOCTYPE html><html><body><figure><img src="x" alt="y" width="300" height="180"><figcaption>Legende</figcaption></figure></body></html>',
  "chapitre-4":
    "<!DOCTYPE html><html><body><table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></body></html>",
  "chapitre-5":
    '<!DOCTYPE html><html><body><form><select id="dest" name="dest"><option>Mars</option><option>Lune</option></select></form></body></html>',
  "chapitre-6":
    '<!DOCTYPE html><html lang="fr"><body><img src="x" alt="Surface lunaire"><a href="/" aria-current="page">Accueil</a></body></html>',
  "chapitre-7":
    '<!DOCTYPE html><html><head><link rel="icon" href="/favicon.ico"></head><body></body></html>',
  "chapitre-8":
    '<!DOCTYPE html><html><body><picture><source srcset="a.webp" type="image/webp"><source srcset="a.jpg" type="image/jpeg"><img src="a.jpg" alt="x"></picture></body></html>',
};

const CHAPTERS: ChapterData[] = [
  chapitre1,
  chapitre2,
  chapitre3,
  chapitre4,
  chapitre5,
  chapitre6,
  chapitre7,
  chapitre8,
];

for (const chapter of CHAPTERS) {
  const validators = VALIDATORS_BY_CHAPTER[chapter.slug];

  describe(`html / ${chapter.slug}`, () => {
    it("a exactement un validateur par étape", () => {
      expect(validators).toBeDefined();
      expect(validators.length).toBe(chapter.steps.length);
    });

    chapter.steps.forEach((step, i) => {
      const isLast = i === chapter.steps.length - 1;
      const solution = isLast
        ? LAST_STEP_SOLUTION[chapter.slug]
        : chapter.steps[i + 1].startCode;

      it(`étape ${i + 1} : refuse le code de départ`, () => {
        expect(validators[i](step.startCode).ok).toBe(false);
      });

      it(`étape ${i + 1} : accepte une solution valide et renvoie les bons objectifs`, () => {
        const result = validators[i](solution);
        expect(result.ok).toBe(true);
        expect(new Set(result.objList)).toEqual(
          new Set(step.objectives.map((o) => o.id))
        );
      });
    });

    it("seul le dernier validateur marque l'étape comme finale", () => {
      validators.forEach((validate, i) => {
        const isLast = i === chapter.steps.length - 1;
        const solution = isLast
          ? LAST_STEP_SOLUTION[chapter.slug]
          : chapter.steps[i + 1].startCode;
        expect(Boolean(validate(solution).final)).toBe(isLast);
      });
    });
  });
}
