/**
 * Libellé narratif de la jauge « recul du Spectre » selon le pourcentage de
 * purge du cursus (0..100), calculé par getCourseProgress (lib/user-store.ts).
 *
 * Les noms de code (`nullProgressLabel`, `NullProgressBar`) gardent « null » ;
 * seul le texte affiché nomme la menace, et il doit dire « Spectre ».
 */

export type NullProgressTone = "corrupt" | "progress" | "purged";

export interface NullProgressLabel {
  title: string;
  tone: NullProgressTone;
}

/** Libellé et tonalité de la jauge selon le pourcentage de purge (0..100). */
export function nullProgressLabel(pct: number): NullProgressLabel {
  if (pct >= 100) return { title: "SECTEUR PURGÉ", tone: "purged" };
  if (pct <= 0) return { title: "SECTEUR CORROMPU", tone: "corrupt" };
  return { title: `SPECTRE REPOUSSÉ — ${Math.round(pct)}%`, tone: "progress" };
}

/**
 * Libellé accessible (aria-label) de la jauge, même règle narrative que
 * nullProgressLabel. Placé ici pour être testé sans rendre le composant
 * (cf. lore.test.ts).
 */
export function nullProgressAriaLabel(pct: number): string {
  return `Recul du Spectre : ${pct}% du secteur purgé`;
}
