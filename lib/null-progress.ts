/**
 * Libellé narratif de la jauge « recul du Null » selon le pourcentage de purge
 * du cursus (0..100). La progression elle-même vient de getCourseProgress
 * (lib/user-store.ts) ; ce module ne fait que l'habiller.
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
  return { title: `NULL REPOUSSÉ — ${Math.round(pct)}%`, tone: "progress" };
}
