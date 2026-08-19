export interface UserState {
  username: string;
  totalXp: number;
  streak: number;
  lastVisit: string;
  // ISO date (yyyy-mm-dd) the daily mission was last claimed; "" if never.
  lastDailyMission: string;
  // Slug of the last course the user interacted with (visited or completed a
  // step in). Used by the dashboard to pre-select the "active" cursus. Null
  // until the user first opens any chapter.
  lastVisitedCourse: string | null;
  badges: string[];
  // key = `${course}/${chapter}`, value = sorted step indexes done
  completedSteps: Record<string, number[]>;
  joinedAt: string;
  // ISO date string when the user dismissed the first-login briefing; null until then.
  onboardedAt: string | null;
  // Avatar customization (purely cosmetic). All null until first /avatar visit.
  species: string | null;
  uniformColor: string | null;
  role: string | null;
}

export const DEFAULT_USER: UserState = {
  username: "",
  totalXp: 0,
  streak: 1,
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
};

/** Has the user picked an avatar (all 3 fields populated) ? */
export function hasAvatar(state: UserState): boolean {
  return state.species !== null && state.uniformColor !== null && state.role !== null;
}

/** Get array of completed step indexes for a chapter */
export function getCompletedSteps(
  state: UserState,
  course: string,
  chapter: string
): number[] {
  return state.completedSteps[`${course}/${chapter}`] ?? [];
}

/** Check if a chapter is fully completed */
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

/** Course progress percent (completed steps / total steps) */
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

/** Find the next step the user should do in a course */
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
 * Pick the course the user is most likely working on right now.
 *
 * Strategy:
 * 1. Prefer state.lastVisitedCourse if it's still valid (in the candidate list
 *    and not 100 % completed). This handles "user just opened React, then went
 *    back to the dashboard" — we want to show React.
 * 2. Otherwise pick the candidate with the most completed steps that isn't
 *    fully done (handles users who came back later with no fresh visit).
 * 3. Otherwise fall back to the first slug given (a fresh user).
 */
export function getActiveCourseSlug(
  state: UserState,
  candidateSlugs: string[],
  totalStepsByCourse: Record<string, number>
): string {
  if (candidateSlugs.length === 0) return "";

  const validSet = new Set(candidateSlugs);

  // (1) Honour the explicit lastVisitedCourse if it's still incomplete.
  if (state.lastVisitedCourse && validSet.has(state.lastVisitedCourse)) {
    const total = totalStepsByCourse[state.lastVisitedCourse] ?? 0;
    const done = countCompleted(state, state.lastVisitedCourse);
    if (total > 0 && done < total) return state.lastVisitedCourse;
  }

  // (2) Fall back to the most-progressed unfinished course.
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
