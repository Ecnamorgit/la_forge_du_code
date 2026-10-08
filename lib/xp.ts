export const MAX_XP = 99999;

/** XP d'une étape, selon son nombre d'objectifs. */
export function xpForStep(objectivesCount: number): number {
  return 25 + objectivesCount * 8;
}
