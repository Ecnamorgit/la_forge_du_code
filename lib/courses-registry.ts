import { chapitre1 as htmlCh1 } from "@/data/courses/html/chapitre-1";
import { chapitre2 as htmlCh2 } from "@/data/courses/html/chapitre-2";
import { chapitre3 as htmlCh3 } from "@/data/courses/html/chapitre-3";
import { chapitre4 as htmlCh4 } from "@/data/courses/html/chapitre-4";
import { chapitre5 as htmlCh5 } from "@/data/courses/html/chapitre-5";
import { chapitre6 as htmlCh6 } from "@/data/courses/html/chapitre-6";
import { chapitre7 as htmlCh7 } from "@/data/courses/html/chapitre-7";
import { chapitre8 as htmlCh8 } from "@/data/courses/html/chapitre-8";
import { chapitre1 as cssCh1 } from "@/data/courses/css/chapitre-1";
import { chapitre2 as cssCh2 } from "@/data/courses/css/chapitre-2";
import { chapitre3 as cssCh3 } from "@/data/courses/css/chapitre-3";
import { chapitre4 as cssCh4 } from "@/data/courses/css/chapitre-4";
import { chapitre5 as cssCh5 } from "@/data/courses/css/chapitre-5";
import { chapitre6 as cssCh6 } from "@/data/courses/css/chapitre-6";
import { chapitre7 as cssCh7 } from "@/data/courses/css/chapitre-7";
import { chapitre8 as cssCh8 } from "@/data/courses/css/chapitre-8";
import { chapitre9 as cssCh9 } from "@/data/courses/css/chapitre-9";
import { chapitre10 as cssCh10 } from "@/data/courses/css/chapitre-10";
import { chapitre1 as jsCh1 } from "@/data/courses/javascript/chapitre-1";
import { chapitre2 as jsCh2 } from "@/data/courses/javascript/chapitre-2";
import { chapitre3 as jsCh3 } from "@/data/courses/javascript/chapitre-3";
import { chapitre4 as jsCh4 } from "@/data/courses/javascript/chapitre-4";
import { chapitre5 as jsCh5 } from "@/data/courses/javascript/chapitre-5";
import { chapitre6 as jsCh6 } from "@/data/courses/javascript/chapitre-6";
import { chapitre7 as jsCh7 } from "@/data/courses/javascript/chapitre-7";
import { chapitre8 as jsCh8 } from "@/data/courses/javascript/chapitre-8";
import { chapitre9 as jsCh9 } from "@/data/courses/javascript/chapitre-9";
import { chapitre10 as jsCh10 } from "@/data/courses/javascript/chapitre-10";
import { chapitre11 as jsCh11 } from "@/data/courses/javascript/chapitre-11";
import { chapitre12 as jsCh12 } from "@/data/courses/javascript/chapitre-12";
import { chapitre1 as reactCh1 } from "@/data/courses/react/chapitre-1";
import { chapitre2 as reactCh2 } from "@/data/courses/react/chapitre-2";
import { chapitre3 as reactCh3 } from "@/data/courses/react/chapitre-3";
import { chapitre4 as reactCh4 } from "@/data/courses/react/chapitre-4";
import { chapitre5 as reactCh5 } from "@/data/courses/react/chapitre-5";
import { chapitre6 as reactCh6 } from "@/data/courses/react/chapitre-6";
import { chapitre7 as reactCh7 } from "@/data/courses/react/chapitre-7";
import { chapitre8 as reactCh8 } from "@/data/courses/react/chapitre-8";
import { chapitre1 as tsCh1 } from "@/data/courses/typescript/chapitre-1";
import { chapitre1 as gitCh1 } from "@/data/courses/git/chapitre-1";
import { chapitre1 as sqlCh1 } from "@/data/courses/sql/chapitre-1";
import { chapitre1 as nodejsCh1 } from "@/data/courses/nodejs/chapitre-1";
import { chapitre1 as testsCh1 } from "@/data/courses/tests/chapitre-1";
import { chapitre1 as devopsCh1 } from "@/data/courses/devops/chapitre-1";
import { chapitre1 as mongodbCh1 } from "@/data/courses/mongodb/chapitre-1";
import { chapitre1 as securityCh1 } from "@/data/courses/security/chapitre-1";
import { chapitre1 as pythonCh1 } from "@/data/courses/python/chapitre-1";
import { chapitre1 as algoCh1 } from "@/data/courses/algo/chapitre-1";
import type { ChapterData } from "@/data/courses/html/types";

function toMap(chapters: ChapterData[]): Record<string, ChapterData> {
  return Object.fromEntries(chapters.map((c) => [c.slug, c]));
}

const REGISTRY: Record<string, Record<string, ChapterData>> = {
  html: toMap([htmlCh1, htmlCh2, htmlCh3, htmlCh4, htmlCh5, htmlCh6, htmlCh7, htmlCh8]),
  css: toMap([cssCh1, cssCh2, cssCh3, cssCh4, cssCh5, cssCh6, cssCh7, cssCh8, cssCh9, cssCh10]),
  javascript: toMap([
    jsCh1, jsCh2, jsCh3, jsCh4, jsCh5, jsCh6, jsCh7, jsCh8, jsCh9, jsCh10, jsCh11, jsCh12,
  ]),
  react: toMap([
    reactCh1,
    reactCh2,
    reactCh3,
    reactCh4,
    reactCh5,
    reactCh6,
    reactCh7,
    reactCh8,
  ]),
  typescript: toMap([tsCh1]),
  git: toMap([gitCh1]),
  sql: toMap([sqlCh1]),
  nodejs: toMap([nodejsCh1]),
  tests: toMap([testsCh1]),
  devops: toMap([devopsCh1]),
  mongodb: toMap([mongodbCh1]),
  security: toMap([securityCh1]),
  python: toMap([pythonCh1]),
  algo: toMap([algoCh1]),
};

export function getChapterData(course: string, chapter: string): ChapterData | null {
  return REGISTRY[course]?.[chapter] ?? null;
}

/**
 * Slugs de tous les cursus, dans l'ordre du registre. Permet aux tests de
 * parcourir le contenu sans redéclarer de liste.
 */
export function listCourseSlugs(): string[] {
  return Object.keys(REGISTRY);
}

/** Slugs des chapitres d'un cursus, dans l'ordre. Vide si le cursus est inconnu. */
export function listChapterSlugs(course: string): string[] {
  return Object.keys(REGISTRY[course] ?? {});
}
