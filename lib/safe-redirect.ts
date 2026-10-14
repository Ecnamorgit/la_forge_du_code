/**
 * Safe return destination from a `?from=` parameter (audit SRV-06).
 * Unfiltered, this parameter would be an open redirect:
 * `/avatar?from=https://piege.example` would send the user to a third-party site.
 *
 * `startsWith("/") && !startsWith("//")` is not enough: browsers read `\`
 * as `/`, and `/\piege.example` becomes `//piege.example`. So we resolve
 * the value the way the browser does and only accept what stays on the
 * same origin.
 */

const PLACEHOLDER_ORIGIN = "https://origine.invalid";

const BACKSLASH = 0x5c;
const DEL = 0x7f;

/**
 * Backslash, which the browser reads as a slash, and control characters
 * (tab, newline…), which it strips from URLs: both can re-form a `//` after
 * our check.
 */
function hasMisleadingCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === DEL || code === BACKSLASH) return true;
  }
  return false;
}

export function safeInternalPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || hasMisleadingCharacter(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
