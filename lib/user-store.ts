export interface UserState {
  username: string;
  totalXp: number;
  streak: number;
  lastVisit: string;
  badges: string[];
  // key = `${course}/${chapter}`, value = sorted step indexes done
  completedSteps: Record<string, number[]>;
  joinedAt: string;
}

export const DEFAULT_USER: UserState = {
  username: "",
  totalXp: 0,
  streak: 1,
  lastVisit: "",
  badges: [],
  completedSteps: {},
  joinedAt: "",
};

/** Compute level from XP (every 100 XP = 1 level) */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/** Compute rank label from XP */
export function rankFromXp(xp: number): string {
  if (xp >= 1000) return "Or";
  if (xp >= 500) return "Argent";
  return "Bronze";
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
