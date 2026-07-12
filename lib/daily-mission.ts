/**
 * Daily mission — a once-per-calendar-day bonus that gives players a reason to
 * come back (and feeds the existing streak via the regular visit flow). Pure,
 * server- and client-shareable logic; the persistence lives in me-server.ts.
 */

/** XP awarded for claiming the daily mission. */
export const DAILY_MISSION_XP = 50;

/**
 * Whether the daily mission can be claimed today.
 * `lastClaimIso` / `todayIso` are yyyy-mm-dd strings. A claim is allowed when
 * today differs from the last claim day (and today is known).
 */
export function canClaimDailyMission(
  lastClaimIso: string,
  todayIso: string
): boolean {
  if (!todayIso) return false;
  return lastClaimIso !== todayIso;
}
