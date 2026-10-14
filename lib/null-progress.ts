/**
 * Narrative label for the "recul du Spectre" gauge, based on the course purge
 * percentage (0..100) computed by getCourseProgress (lib/user-store.ts).
 *
 * Code names (`nullProgressLabel`, `NullProgressBar`) keep "null"; only the
 * displayed text names the threat, and it must say "Spectre".
 */

export type NullProgressTone = "corrupt" | "progress" | "purged";

export interface NullProgressLabel {
  title: string;
  tone: NullProgressTone;
}

/** Gauge label and tone based on the purge percentage (0..100). */
export function nullProgressLabel(pct: number): NullProgressLabel {
  if (pct >= 100) return { title: "SECTEUR PURGÉ", tone: "purged" };
  if (pct <= 0) return { title: "SECTEUR CORROMPU", tone: "corrupt" };
  return { title: `SPECTRE REPOUSSÉ — ${Math.round(pct)}%`, tone: "progress" };
}

/**
 * Accessible label (aria-label) for the gauge, same narrative rule as
 * nullProgressLabel. Lives here so it can be tested without rendering the
 * component (see lore.test.ts).
 */
export function nullProgressAriaLabel(pct: number): string {
  return `Recul du Spectre : ${pct}% du secteur purgé`;
}
