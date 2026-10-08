/**
 * Cinématiques vues, persistées dans localStorage (mode essai, sans compte).
 * Les accès au stockage sont gardés par `typeof window` et ne lèvent jamais.
 */

export const CINE_SEEN_STORAGE_KEY = "nc_cine_seen";

/** Décode un tableau d'ids ; [] si absent, corrompu ou de forme invalide. */
export function parseSeenIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === "string")) {
      return [];
    }
    return [...new Set(parsed)];
  } catch {
    return [];
  }
}

export function readLocalSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseSeenIds(window.localStorage.getItem(CINE_SEEN_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeLocalSeen(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CINE_SEEN_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* navigation privée ou quota : l'essai continue sans persistance */
  }
}

export function clearLocalSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CINE_SEEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
