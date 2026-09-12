/**
 * Destination de retour sûre à partir d'un paramètre `?from=` (constat SRV-06
 * de l'audit de sécurité du 2026-09-12).
 *
 * Un paramètre de retour non filtré est une redirection ouverte : un lien
 * `/avatar?from=https://piege.example` renverrait l'utilisateur vers un site
 * tiers juste après une action de confiance (hameçonnage).
 *
 * Tester `startsWith("/") && !startsWith("//")` ne suffit pas : les navigateurs
 * lisent `\` comme `/`, donc `/\piege.example` devient `//piege.example`, une
 * URL vers un autre domaine. On résout donc la valeur comme le ferait le
 * navigateur, et on n'accepte que ce qui reste sur la même origine.
 */

const ORIGINE_FICTIVE = "https://origine.invalid";

const ANTISLASH = 0x5c;
const DEL = 0x7f;

/**
 * Antislash, lu comme un slash par le navigateur, et caractères de contrôle
 * (tabulation, retour à la ligne…), qu'il retire des URL : les deux peuvent
 * reformer un `//` après notre contrôle.
 */
function contientCaractereTrompeur(valeur: string): boolean {
  for (let i = 0; i < valeur.length; i++) {
    const code = valeur.charCodeAt(i);
    if (code < 0x20 || code === DEL || code === ANTISLASH) return true;
  }
  return false;
}

export function safeInternalPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || contientCaractereTrompeur(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, ORIGINE_FICTIVE);
  } catch {
    return fallback;
  }
  if (url.origin !== ORIGINE_FICTIVE) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
