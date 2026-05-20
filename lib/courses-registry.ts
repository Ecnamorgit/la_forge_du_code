import { chapitre1 as htmlCh1 } from "@/data/courses/html/chapitre-1";
import { chapitre2 as htmlCh2 } from "@/data/courses/html/chapitre-2";
import { chapitre3 as htmlCh3 } from "@/data/courses/html/chapitre-3";
import { chapitre4 as htmlCh4 } from "@/data/courses/html/chapitre-4";
import { chapitre5 as htmlCh5 } from "@/data/courses/html/chapitre-5";
import { chapitre1 as cssCh1 } from "@/data/courses/css/chapitre-1";
import { chapitre2 as cssCh2 } from "@/data/courses/css/chapitre-2";
import { chapitre3 as cssCh3 } from "@/data/courses/css/chapitre-3";
import { chapitre4 as cssCh4 } from "@/data/courses/css/chapitre-4";
import { chapitre5 as cssCh5 } from "@/data/courses/css/chapitre-5";
import { chapitre1 as jsCh1 } from "@/data/courses/javascript/chapitre-1";
import { chapitre2 as jsCh2 } from "@/data/courses/javascript/chapitre-2";
import { chapitre3 as jsCh3 } from "@/data/courses/javascript/chapitre-3";
import { chapitre4 as jsCh4 } from "@/data/courses/javascript/chapitre-4";
import { chapitre5 as jsCh5 } from "@/data/courses/javascript/chapitre-5";
import type { ChapterData } from "@/data/courses/html/types";

function toMap(chapters: ChapterData[]): Record<string, ChapterData> {
  return Object.fromEntries(chapters.map((c) => [c.slug, c]));
}

/** Server-side lookup: full chapter data for a (course, chapter) pair. */
const REGISTRY: Record<string, Record<string, ChapterData>> = {
  html: toMap([htmlCh1, htmlCh2, htmlCh3, htmlCh4, htmlCh5]),
  css: toMap([cssCh1, cssCh2, cssCh3, cssCh4, cssCh5]),
  javascript: toMap([jsCh1, jsCh2, jsCh3, jsCh4, jsCh5]),
};

export function getChapterData(course: string, chapter: string): ChapterData | null {
  return REGISTRY[course]?.[chapter] ?? null;
}
