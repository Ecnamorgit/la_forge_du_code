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
import type { ChapterMeta } from "./user-store";

export interface ChapterMetaFull extends ChapterMeta {
  title: string;
  label: string;
}

function toMeta(chapter: ChapterData, index: number): ChapterMetaFull {
  return {
    slug: chapter.slug,
    totalSteps: chapter.steps.length,
    title: chapter.title.replace(/\n/g, " "),
    label: `Chapitre ${index + 1}`,
  };
}

export const HTML_CHAPTERS_META: ChapterMetaFull[] = [
  htmlCh1,
  htmlCh2,
  htmlCh3,
  htmlCh4,
  htmlCh5,
].map(toMeta);

export const CSS_CHAPTERS_META: ChapterMetaFull[] = [
  cssCh1,
  cssCh2,
  cssCh3,
  cssCh4,
  cssCh5,
].map(toMeta);

export const JS_CHAPTERS_META: ChapterMetaFull[] = [
  jsCh1,
  jsCh2,
  jsCh3,
  jsCh4,
  jsCh5,
].map(toMeta);

const CHAPTERS_BY_COURSE: Record<string, ChapterMetaFull[]> = {
  html: HTML_CHAPTERS_META,
  css: CSS_CHAPTERS_META,
  javascript: JS_CHAPTERS_META,
};

export function getChaptersMeta(course: string): ChapterMetaFull[] {
  return CHAPTERS_BY_COURSE[course] ?? [];
}

/** Badge unlocked when a chapter is completed (per course). */
const BADGE_BY_CHAPTER: Record<string, Record<string, string>> = {
  html: {
    "chapitre-1": "selene",
    "chapitre-2": "relay",
    "chapitre-3": "archivist",
    "chapitre-4": "logistician",
    "chapitre-5": "operator",
  },
  css: {
    "chapitre-1": "css-initiate",
    "chapitre-2": "css-palette",
    "chapitre-3": "css-modular",
    "chapitre-4": "css-pilot",
    "chapitre-5": "css-cartographer",
  },
  javascript: {
    "chapitre-1": "js-radio",
    "chapitre-2": "js-analyst",
    "chapitre-3": "js-engineer",
    "chapitre-4": "js-quartermaster",
    "chapitre-5": "js-architect",
  },
};

export function getBadgeForChapter(course: string, chapter: string): string | null {
  return BADGE_BY_CHAPTER[course]?.[chapter] ?? null;
}
