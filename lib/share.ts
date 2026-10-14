/**
 * Helpers for the shareable achievement card. The image route is public and
 * rendered from URL parameters: the provided text is sanitized and truncated
 * before it reaches the image.
 */

const MAX_NAME = 24;

/** Sanitizes a username for the public card. */
export function sanitizeShareName(input: string | null | undefined): string {
  if (!input) return "Cadet";
  const cleaned = Array.from(input)
    // Strips control characters (code < 32) and angle brackets (defense in depth).
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && ch !== "<" && ch !== ">";
    })
    .join("")
    .trim()
    .slice(0, MAX_NAME);
  return cleaned.length > 0 ? cleaned : "Cadet";
}

/** Reads a zero or positive XP value from a URL parameter. */
export function parseShareXp(input: string | null | undefined): number {
  const n = Number(input);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
