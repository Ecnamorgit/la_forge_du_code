import type { Briefing } from "./quests";

/** Client view of the liaison, computed by the server. */
export interface LiaisonPublic {
  streak: number;
  bestStreak: number;
  shields: number;
  /** The last 7 days, oldest to most recent. */
  week: boolean[];
  /**
   * True if the day is already counted in `streak`. False until a step has
   * been completed today: `streak` is then yesterday's count.
   */
  activeToday: boolean;
  /**
   * True if completing a step now would break the streak (absence longer
   * than the relays cover). Lets us announce the break rather than show a
   * stale counter. Always false if `activeToday`.
   */
  wouldBreakToday: boolean;
}

export interface UserState {
  username: string;
  totalXp: number;
  lastVisit: string;
  // Day (yyyy-mm-dd) the briefing payout mask refers to; "" if never.
  lastDailyMission: string;
  // Last course opened or worked on, preselected by the dashboard.
  // Null before a chapter is first opened.
  lastVisitedCourse: string | null;
  badges: string[];
  // Key `${course}/${chapter}`, value: sorted indexes of completed steps.
  completedSteps: Record<string, number[]>;
  joinedAt: string;
  // ISO date the first-login briefing was closed; null before that.
  onboardedAt: string | null;
  // Avatar (cosmetic). Null until the first visit to /avatar.
  species: string | null;
  uniformColor: string | null;
  role: string | null;

  // Daily loop
  /** Daily briefing, computed server-side. Null in trial mode (local visitor). */
  briefing: Briefing | null;
  /** Sole source of the liaison counter on the client. */
  liaison: LiaisonPublic;
  /** Ids of unlocked cosmetics, as owned in the database. */
  unlocks: string[];
  /** Total orders completed (conduct badge progress). */
  questsCompleted: number;
  frame: string | null;
  title: string | null;
  emblem: string | null;
  cardBg: string | null;
}

export const DEFAULT_USER: UserState = {
  username: "",
  totalXp: 0,
  lastVisit: "",
  lastDailyMission: "",
  lastVisitedCourse: null,
  badges: [],
  completedSteps: {},
  joinedAt: "",
  onboardedAt: null,
  species: null,
  uniformColor: null,
  role: null,
  briefing: null,
  liaison: {
    streak: 1,
    bestStreak: 1,
    shields: 0,
    week: [false, false, false, false, false, false, false],
    activeToday: false,
    wouldBreakToday: false,
  },
  unlocks: [],
  questsCompleted: 0,
  frame: null,
  title: null,
  emblem: null,
  cardBg: null,
};

/** True if the avatar is chosen (all three fields set). */
export function hasAvatar(state: UserState): boolean {
  return state.species !== null && state.uniformColor !== null && state.role !== null;
}

/** Indexes of the completed steps in a chapter. */
export function getCompletedSteps(
  state: UserState,
  course: string,
  chapter: string
): number[] {
  return state.completedSteps[`${course}/${chapter}`] ?? [];
}

export function isChapterComplete(
  state: UserState,
  course: string,
  chapter: string,
  totalSteps: number
): boolean {
  return getCompletedSteps(state, course, chapter).length >= totalSteps;
}

export interface ChapterMeta {
  slug: string;
  totalSteps: number;
}

/** Course progress as a percentage (completed steps / total steps). */
export function getCourseProgress(
  state: UserState,
  course: string,
  chapters: ChapterMeta[]
): number {
  if (chapters.length === 0) return 0;
  const totalSteps = chapters.reduce((s, c) => s + c.totalSteps, 0);
  if (totalSteps === 0) return 0;
  const completed = chapters.reduce(
    (s, c) => s + getCompletedSteps(state, course, c.slug).length,
    0
  );
  return Math.round((completed / totalSteps) * 100);
}

export interface NextStep {
  chapterSlug: string;
  stepIndex: number;
  isFirst: boolean;
}

/** Next step to do in a course. */
export function getNextStep(
  state: UserState,
  course: string,
  chapters: ChapterMeta[]
): NextStep | null {
  for (const ch of chapters) {
    const done = getCompletedSteps(state, course, ch.slug);
    if (done.length < ch.totalSteps) {
      const nextStepIdx = done.length;
      return {
        chapterSlug: ch.slug,
        stepIndex: nextStepIdx,
        isFirst: nextStepIdx === 0 && done.length === 0,
      };
    }
  }
  return null;
}

function countCompleted(state: UserState, courseSlug: string): number {
  const prefix = `${courseSlug}/`;
  let completed = 0;
  for (const [key, steps] of Object.entries(state.completedSteps)) {
    if (key.startsWith(prefix)) completed += steps.length;
  }
  return completed;
}

/**
 * Course the user is most likely working on: the last one visited if it is
 * a candidate and unfinished, otherwise the most advanced unfinished course,
 * otherwise the first candidate.
 */
export function getActiveCourseSlug(
  state: UserState,
  candidateSlugs: string[],
  totalStepsByCourse: Record<string, number>
): string {
  if (candidateSlugs.length === 0) return "";

  const validSet = new Set(candidateSlugs);

  // Last visited course, if it is still unfinished.
  if (state.lastVisitedCourse && validSet.has(state.lastVisitedCourse)) {
    const total = totalStepsByCourse[state.lastVisitedCourse] ?? 0;
    const done = countCompleted(state, state.lastVisitedCourse);
    if (total > 0 && done < total) return state.lastVisitedCourse;
  }

  // Otherwise, the most advanced unfinished course.
  let bestSlug = candidateSlugs[0];
  let bestProgress = -1;
  for (const slug of candidateSlugs) {
    const total = totalStepsByCourse[slug] ?? 0;
    if (total === 0) continue;
    const done = countCompleted(state, slug);
    if (done >= total) continue;
    if (done > bestProgress) {
      bestProgress = done;
      bestSlug = slug;
    }
  }

  return bestSlug;
}
