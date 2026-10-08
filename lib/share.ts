/**
 * Utilitaires de la carte de réussite partageable. La route d'image est
 * publique et rendue à partir des paramètres d'URL : le texte fourni est
 * nettoyé et tronqué avant d'atteindre l'image.
 */

const MAX_NAME = 24;

/** Nettoie un pseudo pour la carte publique. */
export function sanitizeShareName(input: string | null | undefined): string {
  if (!input) return "Cadet";
  const cleaned = Array.from(input)
    // Retire les caractères de contrôle (code < 32) et les chevrons (défense en profondeur).
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && ch !== "<" && ch !== ">";
    })
    .join("")
    .trim()
    .slice(0, MAX_NAME);
  return cleaned.length > 0 ? cleaned : "Cadet";
}

/** Lit une valeur d'XP positive ou nulle depuis un paramètre d'URL. */
export function parseShareXp(input: string | null | undefined): number {
  const n = Number(input);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
