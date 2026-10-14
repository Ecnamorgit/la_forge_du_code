/** Reveal speed of scene text (characters per second). */
export const TYPEWRITER_CHARS_PER_SECOND = 40;

/** Portion of the text visible after `elapsedMs`. */
export function typewriterSlice(text: string, elapsedMs: number): string {
  if (elapsedMs <= 0) return "";
  const chars = Math.floor((elapsedMs / 1000) * TYPEWRITER_CHARS_PER_SECOND);
  return text.slice(0, Math.min(text.length, chars));
}
