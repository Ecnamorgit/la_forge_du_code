/**
 * Liaison: the streak as a game object. It only advances on real work
 * (first step completed in the day), and a missed day does not break it if
 * the cadet holds a backup relay.
 *
 * Pure function: the current day is a parameter.
 */

/** Cap on relays held, so that being away still has a cost. */
export const MAX_SHIELDS = 2;

/** Broken streak length from which the "Le Retour" badge is earned. */
const RETURN_THRESHOLD = 7;

/** Liaison day on which the first relay is granted. */
const FIRST_SHIELD_AT = 3;

export interface LiaisonState {
  streak: number;
  bestStreak: number;
  shields: number;
  shieldEverGranted: boolean;
  /** ISO date (yyyy-mm-dd) of the last active day; "" if never active. */
  lastActiveDay: string;
}

export interface LiaisonTransition {
  next: LiaisonState;
  /** False when the day was already counted (nothing to write to the database). */
  changed: boolean;
  shieldsConsumed: number;
  broken: boolean;
  /** Break of a streak of at least 7 days: "Le Retour" badge. */
  earnedReturn: boolean;
  shieldEarned: boolean;
}

/** Number of calendar days between two ISO dates (yyyy-mm-dd). */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/**
 * Advances the liaison. Call it when the cadet completes a step (see
 * `completeStep`), never on a mere visit; idempotent within a day.
 */
export function advanceLiaison(
  current: LiaisonState,
  todayIso: string
): LiaisonTransition {
  const unchanged: LiaisonTransition = {
    next: current,
    changed: false,
    shieldsConsumed: 0,
    broken: false,
    earnedReturn: false,
    shieldEarned: false,
  };

  if (!todayIso) return unchanged;
  if (current.lastActiveDay === todayIso) return unchanged;

  let streak: number;
  let shields = current.shields;
  let shieldsConsumed = 0;
  let broken = false;
  let earnedReturn = false;

  if (!current.lastActiveDay) {
    streak = 1;
  } else {
    const gap = daysBetweenIso(current.lastActiveDay, todayIso);
    if (gap <= 0) return unchanged; // inconsistent clock: do not break anything
    if (gap === 1) {
      streak = current.streak + 1;
    } else {
      const missed = gap - 1;
      if (missed <= shields) {
        shields -= missed;
        shieldsConsumed = missed;
        streak = current.streak + 1;
      } else {
        broken = true;
        earnedReturn = current.streak >= RETURN_THRESHOLD;
        streak = 1;
      }
    }
  }

  // Relay granted on day 3, only once in the account's lifetime.
  let shieldEverGranted = current.shieldEverGranted;
  let shieldEarned = false;
  if (streak === FIRST_SHIELD_AT && !shieldEverGranted) {
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEverGranted = true;
    shieldEarned = true;
  } else if (streak > 0 && streak % 7 === 0) {
    const before = shields;
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEarned = shields > before;
  }

  return {
    next: {
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      shields,
      shieldEverGranted,
      lastActiveDay: todayIso,
    },
    changed: true,
    shieldsConsumed,
    broken,
    earnedReturn,
    shieldEarned,
  };
}
