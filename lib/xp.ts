export const MAX_XP = 99999;

/** XP for a step, based on its number of objectives. */
export function xpForStep(objectivesCount: number): number {
  return 25 + objectivesCount * 8;
}
