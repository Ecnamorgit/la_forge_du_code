/**
 * Libellé narratif de la jauge « recul du Spectre » selon le pourcentage de
 * purge du cursus (0..100). La progression elle-même vient de
 * getCourseProgress (lib/user-store.ts) ; ce module ne fait que l'habiller.
 *
 * Nom de module et symboles (`nullProgressLabel`, `NullProgressBar`) conservés
 * tels quels : ce sont des noms de code, pas du texte affiché. Seul le texte
 * narratif ci-dessous nomme la menace, et il doit dire « Spectre ».
 */

export type NullProgressTone = "corrupt" | "progress" | "purged";

export interface NullProgressLabel {
  title: string;
  tone: NullProgressTone;
}

/** Libellé + tonalité de la jauge selon le pourcentage de purge (0..100). */
export function nullProgressLabel(pct: number): NullProgressLabel {
  if (pct >= 100) return { title: "SECTEUR PURGÉ", tone: "purged" };
  if (pct <= 0) return { title: "SECTEUR CORROMPU", tone: "corrupt" };
  return { title: `SPECTRE REPOUSSÉ — ${Math.round(pct)}%`, tone: "progress" };
}

/**
 * Libellé accessible (aria-label) de la jauge, même règle narrative que
 * nullProgressLabel. Extrait ici — plutôt que gardé en template inline dans
 * NullProgressBar.tsx — pour rester testable sans rendre le composant React
 * (cf. lore.test.ts).
 */
export function nullProgressAriaLabel(pct: number): string {
  return `Recul du Spectre : ${pct}% du secteur purgé`;
}
