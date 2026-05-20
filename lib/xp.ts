export const MAX_XP = 99999;

/** XP awarded for a step, based on its objective count. */
export function xpForStep(objectivesCount: number): number {
  return 25 + objectivesCount * 8;
}
