/** Vitesse de révélation du texte des scènes (caractères/seconde). */
export const TYPEWRITER_CHARS_PER_SECOND = 40;

/** Portion du texte visible après `elapsedMs`. */
export function typewriterSlice(text: string, elapsedMs: number): string {
  if (elapsedMs <= 0) return "";
  const chars = Math.floor((elapsedMs / 1000) * TYPEWRITER_CHARS_PER_SECOND);
  return text.slice(0, Math.min(text.length, chars));
}
