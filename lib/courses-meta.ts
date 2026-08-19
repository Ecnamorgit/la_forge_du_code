import { isChapterComplete, type ChapterMeta, type UserState } from "./user-store";
import { CHAPTER_SUMMARIES } from "./chapter-summaries";

export interface ChapterMetaFull extends ChapterMeta {
  title: string;
  label: string;
}

export function getChaptersMeta(course: string): ChapterMetaFull[] {
  const summaries = CHAPTER_SUMMARIES[course];
  if (!summaries) return [];

  return summaries.map((s, i) => ({
    slug: s.slug,
    totalSteps: s.totalSteps,
    title: s.title,
    label: `Chapitre ${i + 1}`,
  }));
}

// Pre-computed per-course exports kept for backward compatibility with callers
// that prefer destructured imports. These are cheap (just object reshaping).
export const HTML_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("html");
export const CSS_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("css");
export const JS_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("javascript");
export const REACT_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("react");
export const TYPESCRIPT_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("typescript");
export const GIT_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("git");
export const SQL_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("sql");
export const NODEJS_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("nodejs");
export const TESTS_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("tests");
export const DEVOPS_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("devops");
export const MONGODB_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("mongodb");
export const SECURITY_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("security");
export const PYTHON_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("python");
export const ALGO_CHAPTERS_META: ChapterMetaFull[] = getChaptersMeta("algo");

/** Badge unlocked when a chapter is completed (per course). */
const BADGE_BY_CHAPTER: Record<string, Record<string, string>> = {
  html: {
    "chapitre-1": "selene",
    "chapitre-2": "relay",
    "chapitre-3": "archivist",
    "chapitre-4": "logistician",
    "chapitre-5": "operator",
    "chapitre-6": "html-architect",
    "chapitre-7": "html-signals",
    "chapitre-8": "html-media",
  },
  css: {
    "chapitre-1": "css-initiate",
    "chapitre-2": "css-palette",
    "chapitre-3": "css-modular",
    "chapitre-4": "css-pilot",
    "chapitre-5": "css-cartographer",
    "chapitre-6": "css-anchor",
    "chapitre-7": "css-invoker",
    "chapitre-8": "css-adaptive",
    "chapitre-9": "css-animator",
    "chapitre-10": "css-system",
  },
  javascript: {
    "chapitre-1": "js-radio",
    "chapitre-2": "js-analyst",
    "chapitre-3": "js-engineer",
    "chapitre-4": "js-quartermaster",
    "chapitre-5": "js-architect",
    "chapitre-6": "js-data",
    "chapitre-7": "js-dom",
    "chapitre-8": "js-events",
    "chapitre-9": "js-async",
    "chapitre-10": "js-storage",
    "chapitre-11": "js-fetch",
    "chapitre-12": "js-rest",
  },
  react: {
    "chapitre-1": "react-architect",
    "chapitre-2": "react-state",
    "chapitre-3": "react-effects",
    "chapitre-4": "react-router",
    "chapitre-5": "react-fleet",
    "chapitre-6": "react-forms",
    "chapitre-7": "react-hooks",
    "chapitre-8": "react-context",
  },
  typescript: { "chapitre-1": "ts-shield" },
  git: { "chapitre-1": "git-archivist" },
  sql: { "chapitre-1": "sql-keeper" },
  nodejs: { "chapitre-1": "nodejs-builder" },
  tests: { "chapitre-1": "tests-qa" },
  devops: { "chapitre-1": "devops-launcher" },
  mongodb: { "chapitre-1": "mongodb-leaf" },
  security: { "chapitre-1": "security-shield" },
  python: { "chapitre-1": "python-serpent" },
  algo: { "chapitre-1": "algo-strategist" },
};

export function getBadgeForChapter(course: string, chapter: string): string | null {
  return BADGE_BY_CHAPTER[course]?.[chapter] ?? null;
}

export interface CompletionStats {
  /** Nombre de cursus dont tous les chapitres sont bouclés. */
  coursesComplete: number;
  /** Nombre total de chapitres bouclés, tous cursus confondus. */
  chaptersComplete: number;
}

/**
 * Compte les cursus et chapitres bouclés pour un état utilisateur.
 *
 * Même motif que `app/profil/page.tsx` (`isChapterComplete` appliqué chapitre
 * par chapitre) : extrait ici pour ne pas le dupliquer entre `/profil` et le
 * dashboard, qui en a besoin pour nourrir `nextUnlock`.
 */
export function getCompletionStats(
  state: UserState,
  courseSlugs: string[]
): CompletionStats {
  let coursesComplete = 0;
  let chaptersComplete = 0;

  for (const slug of courseSlugs) {
    const chapters = getChaptersMeta(slug);
    if (chapters.length === 0) continue;

    let courseDone = true;
    for (const ch of chapters) {
      if (isChapterComplete(state, slug, ch.slug, ch.totalSteps)) {
        chaptersComplete += 1;
      } else {
        courseDone = false;
      }
    }
    if (courseDone) coursesComplete += 1;
  }

  return { coursesComplete, chaptersComplete };
}
