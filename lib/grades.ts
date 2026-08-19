/**
 * Échelle de progression de la Coalition. Remplace l'ancien couple
 * levelFromXp / rankFromXp de lib/user-store.ts, qui plafonnait à « Or » dès
 * 1 000 XP (11 % du parcours) et menait au niveau 94 en fin de cursus.
 *
 * Les seuils sont calibrés sur les 9 312 XP réels du cursus complet
 * (51 chapitres, 192 étapes, mesurés sur data/courses/). Amiral est
 * volontairement placé au-dessus : le dernier grade demande d'avoir tout
 * terminé ET d'avoir été régulier.
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

/**
 * Niveau chiffré, courbé. Monte vite au début, ralentit ensuite, culmine à 25
 * au bout du cursus. L'ancienne formule linéaire (xp/100 + 1) menait à 94.
 */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 16)) + 1;
}
