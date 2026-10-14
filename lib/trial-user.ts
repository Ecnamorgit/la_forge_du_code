/**
 * Progress state for trial mode (visitor without an account), keyed by the
 * chapter slugs of TRIAL_CHAPTERS (lib/public-routes.ts).
 *
 * Pure logic, no React; storage access is guarded by
 * `typeof window`, as in `lib/intro.ts`.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER, type UserState } from "./user-store";
import { xpForStep } from "./xp";

export const TRIAL_STORAGE_KEY = "nc_trial_state";

export interface TrialState {
  /** Sorted indexes of completed steps, per trial chapter slug. */
  chapters: Record<string, number[]>;
  xp: number;
}

export interface TrialStepResult {
  state: TrialState;
  awardedXp: number;
  alreadyDone: boolean;
}

export interface TrialStepRef {
  course: string;
  chapter: string;
  stepIndex: number;
}

/** Empty state, a new literal on every call (see `parseTrialState`). */
export function emptyTrialState(): TrialState {
  return { chapters: {}, xp: 0 };
}

function sanitizeChapters(value: unknown): Record<string, number[]> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const out: Record<string, number[]> = {};
  for (const [chapter, steps] of Object.entries(value)) {
    // Shape validated before the scope filter: a malformed entry, even
    // out of scope, invalidates the whole state.
    if (!Array.isArray(steps) || !steps.every((n) => typeof n === "number")) return null;
    if (!TRIAL_CHAPTERS.includes(chapter)) continue; // out of scope: ignored
    out[chapter] = [...steps];
  }
  return out;
}

/**
 * Decodes the stored trial state. Decoding lives here, as pure code, so it can
 * be tested under node; `readTrialState` only wraps `localStorage`. Returns the
 * empty state if the entry is missing, corrupted or invalid, without ever throwing.
 *
 * Migrates the legacy `{ completedSteps, xp }` shape (a single implicit chapter)
 * to `{ chapters, xp }`.
 */
export function parseTrialState(raw: string | null): TrialState {
  // Every default return is a fresh literal: with a shared constant, a
  // caller mutating `chapters` would corrupt the default state for the
  // whole process.
  if (!raw) return emptyTrialState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyTrialState();
    const v = parsed as Record<string, unknown>;
    if (typeof v.xp !== "number") return emptyTrialState();
    // New shape.
    if ("chapters" in v) {
      const chapters = sanitizeChapters(v.chapters);
      return chapters ? { chapters, xp: v.xp } : emptyTrialState();
    }
    // Legacy { completedSteps, xp } shape: migration.
    if (Array.isArray(v.completedSteps) && v.completedSteps.every((n) => typeof n === "number")) {
      return {
        chapters: { [TRIAL_CHAPTERS[0]]: [...v.completedSteps] },
        xp: v.xp,
      };
    }
    return emptyTrialState();
  } catch {
    return emptyTrialState();
  }
}

/** Reads the trial state; empty state if storage is unavailable. */
export function readTrialState(): TrialState {
  if (typeof window === "undefined") return emptyTrialState();
  try {
    return parseTrialState(window.localStorage.getItem(TRIAL_STORAGE_KEY));
  } catch {
    return emptyTrialState();
  }
}

/** Persists the state; no effect if storage is unavailable or full. */
export function writeTrialState(state: TrialState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private browsing or quota exceeded: the trial continues in memory */
  }
}

export function clearTrialState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Applies a step completion for a trial chapter. Same XP calculation as
 * `me-server.ts` (`xpForStep`).
 */
export function applyTrialStep(
  state: TrialState,
  chapter: string,
  stepIndex: number,
  objectivesCount: number
): TrialStepResult {
  if (!TRIAL_CHAPTERS.includes(chapter)) {
    throw new Error("Chapitre hors du périmètre d'essai");
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new Error("Index d'étape invalide");
  }

  const done = state.chapters[chapter] ?? [];
  if (done.includes(stepIndex)) {
    return { state, awardedXp: 0, alreadyDone: true };
  }

  const awardedXp = xpForStep(objectivesCount);
  return {
    state: {
      chapters: {
        ...state.chapters,
        [chapter]: [...done, stepIndex].sort((a, b) => a - b),
      },
      xp: state.xp + awardedXp,
    },
    awardedXp,
    alreadyDone: false,
  };
}

/** Projects the trial state into the `UserState` shape consumed by the UI. */
export function trialStateToUserState(state: TrialState): UserState {
  return {
    ...DEFAULT_USER,
    // The spread does not clone the reference-type fields of `DEFAULT_USER`,
    // which is shared by the whole process (see lib/use-user.ts): a `push` on
    // the trial state would corrupt it. Hence the explicit copies.
    badges: [...DEFAULT_USER.badges],
    unlocks: [...DEFAULT_USER.unlocks],
    liaison: { ...DEFAULT_USER.liaison, week: [...DEFAULT_USER.liaison.week] },
    // The briefing is computed server-side; a visitor without an account cannot
    // reach the dashboard (proxy.ts), so they have none.
    briefing: null,
    username: "Cadet",
    totalXp: state.xp,
    lastVisitedCourse: TRIAL_COURSE,
    completedSteps: Object.fromEntries(
      Object.entries(state.chapters).map(([chapter, steps]) => [
        `${TRIAL_COURSE}/${chapter}`,
        [...steps],
      ])
    ),
  };
}

/** Lists the completed steps, in the format expected by /api/me/trial-import. */
export function trialCompletedSteps(state: TrialState): TrialStepRef[] {
  return TRIAL_CHAPTERS.flatMap((chapter) =>
    (state.chapters[chapter] ?? []).map((stepIndex) => ({
      course: TRIAL_COURSE,
      chapter,
      stepIndex,
    }))
  );
}
