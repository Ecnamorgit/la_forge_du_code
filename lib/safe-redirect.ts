/**
 * Destination de retour sûre à partir d'un paramètre `?from=` (audit SRV-06).
 * Non filtré, ce paramètre serait une redirection ouverte :
 * `/avatar?from=https://piege.example` renverrait vers un site tiers.
 *
 * `startsWith("/") && !startsWith("//")` ne suffit pas : les navigateurs
 * lisent `\` comme `/`, et `/\piege.example` devient `//piege.example`. On
 * résout donc la valeur comme le navigateur et on n'accepte que ce qui reste
 * sur la même origine.
 */

const PLACEHOLDER_ORIGIN = "https://origine.invalid";

const BACKSLASH = 0x5c;
const DEL = 0x7f;

/**
 * Antislash, lu comme un slash par le navigateur, et caractères de contrôle
 * (tabulation, retour à la ligne…), qu'il retire des URL : les deux peuvent
 * reformer un `//` après notre contrôle.
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
