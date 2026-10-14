/**
 * Seen cinematics, persisted in localStorage (trial mode, no account).
 * Storage access is guarded by `typeof window` and never throws.
 */

export const CINE_SEEN_STORAGE_KEY = "nc_cine_seen";

/** Decodes an array of ids; [] if missing, corrupted or malformed. */
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
    /* private browsing or quota: the trial continues without persistence */
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
