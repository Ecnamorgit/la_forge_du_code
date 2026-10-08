/**
 * Helpers des validateurs JS : vérifications statiques du code source et
 * vérifications de l'exécution (logs, erreur, dernière valeur).
 */

export function stripComments(code: string): string {
  // Un mot-clé cité en commentaire ne doit pas compter.
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

export function hasKeyword(code: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(stripComments(code));
}

export function hasConsoleLog(code: string): boolean {
  return /\bconsole\s*\.\s*(?:log|info|warn|error|debug)\s*\(/.test(
    stripComments(code)
  );
}

/** Vrai si une ligne de log vaut `text` (espaces de bord ignorés). */
export function logsInclude(logs: string[], text: string): boolean {
  return logs.some((l) => l.trim() === text.trim());
}

/** Vrai si une ligne de log contient `substring`. */
export function logsContain(logs: string[], substring: string): boolean {
  return logs.some((l) => l.includes(substring));
}
