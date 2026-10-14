import { describe, it, expect } from "vitest";

import type { ChapterData } from "@/data/courses/html/types";
import { chapter1 } from "@/data/courses/html/chapitre-1";
import { chapter2 } from "@/data/courses/html/chapitre-2";
import { chapter3 } from "@/data/courses/html/chapitre-3";
import { chapter4 } from "@/data/courses/html/chapitre-4";
import { chapter5 } from "@/data/courses/html/chapitre-5";
import { chapter6 } from "@/data/courses/html/chapitre-6";
import { chapter7 } from "@/data/courses/html/chapitre-7";
import { chapter8 } from "@/data/courses/html/chapitre-8";
import { VALIDATORS_BY_CHAPTER } from "./index";

/**
 * Full coverage of the HTML track (8 chapters, 31 steps).
 *
 * The course is cumulative: the `startCode` of step N+1 is the expected
 * solution of step N. Each validator must therefore reject its own step's
 * `startCode`, accept the next one (or a hand-written solution for the
 * last step), and return an `objList` identical to the `objectives`
 * declared in the chapter.
 */

// Solution for the last step of each chapter, which has no following
// `startCode` to derive it from.
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
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
  chapter8,
];

for (const chapter of CHAPTERS) {
  const validators = VALIDATORS_BY_CHAPTER[chapter.slug];

  describe(`html / ${chapter.slug}`, () => {
    it("has exactly one validator per step", () => {
      expect(validators).toBeDefined();
      expect(validators.length).toBe(chapter.steps.length);
    });

    chapter.steps.forEach((step, i) => {
      const isLast = i === chapter.steps.length - 1;
      const solution = isLast
        ? LAST_STEP_SOLUTION[chapter.slug]
        : chapter.steps[i + 1].startCode;

      it(`step ${i + 1}: rejects the starting code`, () => {
        expect(validators[i](step.startCode).ok).toBe(false);
      });

      it(`step ${i + 1}: accepts a valid solution and returns the right objectives`, () => {
        const result = validators[i](solution);
        expect(result.ok).toBe(true);
        expect(new Set(result.objList)).toEqual(
          new Set(step.objectives.map((o) => o.id))
        );
      });
    });

    it("only the last validator marks the step as final", () => {
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
