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
import type { ChapterData } from "@/data/courses/html/types";

function toMap(chapters: ChapterData[]): Record<string, ChapterData> {
  return Object.fromEntries(chapters.map((c) => [c.slug, c]));
}

/** Server-side lookup: full chapter data for a (course, chapter) pair. */
const REGISTRY: Record<string, Record<string, ChapterData>> = {
  html: toMap([htmlCh1, htmlCh2, htmlCh3, htmlCh4, htmlCh5, htmlCh6, htmlCh7, htmlCh8]),
  css: toMap([cssCh1, cssCh2, cssCh3, cssCh4, cssCh5, cssCh6, cssCh7, cssCh8, cssCh9, cssCh10]),
  javascript: toMap([jsCh1, jsCh2, jsCh3, jsCh4, jsCh5, jsCh6, jsCh7, jsCh8, jsCh9, jsCh10]),
};

export function getChapterData(course: string, chapter: string): ChapterData | null {
  return REGISTRY[course]?.[chapter] ?? null;
}
