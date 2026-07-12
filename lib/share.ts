/**
 * Helpers for the shareable success card (growth loop). The share image route
 * is public and rendered from query params, so user-supplied text is sanitized
 * and capped before it ever reaches the generated image.
 */

const MAX_NAME = 24;

/** Clean a pseudo for display on the public share card. */
export function sanitizeShareName(input: string | null | undefined): string {
  if (!input) return "Cadet";
  const cleaned = Array.from(input)
    // Drop control chars (code < 32) and angle brackets (defense-in-depth).
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && ch !== "<" && ch !== ">";
    })
    .join("")
    .trim()
    .slice(0, MAX_NAME);
  return cleaned.length > 0 ? cleaned : "Cadet";
}

/** Parse a non-negative XP value from a query string. */
export function parseShareXp(input: string | null | undefined): number {
  const n = Number(input);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
