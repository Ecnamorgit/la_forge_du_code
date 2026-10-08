/**
 * Échelle de grades de la Coalition. Les seuils ont été calibrés pour un
 * parcours complet de 9 312 XP ; Amiral est placé au-dessus, le dernier grade
 * demandant d'avoir tout terminé et d'avoir été régulier.
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

/** Grade courant pour un total d'XP. Jamais null : Cadet est à 0. */
export function gradeFromXp(xp: number): Grade {
  let found = GRADES[0];
  for (const g of GRADES) {
    if (xp >= g.threshold) found = g;
    else break;
  }
  return found;
}

/** Grade suivant, ou null si le cadet est au sommet. */
export function nextGrade(xp: number): Grade | null {
  return GRADES.find((g) => g.threshold > xp) ?? null;
}

/**
 * Avancée dans le grade courant, pour une barre de progression.
 * Au dernier grade, current === span (barre pleine).
 */
export function xpIntoGrade(xp: number): { current: number; span: number } {
  const grade = gradeFromXp(xp);
  const next = nextGrade(xp);
  if (!next) return { current: 1, span: 1 };
  return { current: xp - grade.threshold, span: next.threshold - grade.threshold };
}

/** Niveau chiffré en racine carrée : il monte vite au début puis ralentit. */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 16)) + 1;
}
