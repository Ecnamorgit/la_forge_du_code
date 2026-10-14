/**
 * The Coalition's grade ladder. Thresholds were calibrated for a full
 * 9,312 XP path; Amiral sits above it, so the last grade requires
 * having finished everything and having been consistent.
 */

export interface Grade {
  id: string;
  label: string;
  threshold: number;
}

export const GRADES: Grade[] = [
  { id: "cadet", label: "Cadet", threshold: 0 },
  { id: "aspirant", label: "Aspirant", threshold: 400 },
  { id: "enseigne", label: "Enseigne", threshold: 1200 },
  { id: "lieutenant", label: "Lieutenant", threshold: 2500 },
  { id: "commandant", label: "Commandant", threshold: 4500 },
  { id: "capitaine", label: "Capitaine", threshold: 7000 },
  { id: "amiral", label: "Amiral", threshold: 10000 },
];

/** Current grade for an XP total. Never null: Cadet is at 0. */
export function gradeFromXp(xp: number): Grade {
  let found = GRADES[0];
  for (const g of GRADES) {
    if (xp >= g.threshold) found = g;
    else break;
  }
  return found;
}

/** Next grade, or null if the cadet is at the top. */
export function nextGrade(xp: number): Grade | null {
  return GRADES.find((g) => g.threshold > xp) ?? null;
}

/**
 * Progress within the current grade, for a progress bar.
 * At the last grade, current === span (full bar).
 */
export function xpIntoGrade(xp: number): { current: number; span: number } {
  const grade = gradeFromXp(xp);
  const next = nextGrade(xp);
  if (!next) return { current: 1, span: 1 };
  return { current: xp - grade.threshold, span: next.threshold - grade.threshold };
}

/** Numeric level based on a square root: it rises quickly at first, then slows. */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 16)) + 1;
}
