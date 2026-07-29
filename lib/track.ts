/**
 * Comptage minimal du tunnel d'acquisition.
 *
 * Aucune donnée personnelle, aucun identifiant de visiteur persistant : on
 * compte des occurrences horodatées, pas des personnes. Pas de cookie, pas de
 * sous-traitant tiers — cf. docs/RGPD.md.
 */

export const TRACK_EVENTS = ["landing_vue", "essai_lance", "inscription"] as const;

export type TrackEvent = (typeof TRACK_EVENTS)[number];

export function isTrackEvent(value: unknown): value is TrackEvent {
  return typeof value === "string" && (TRACK_EVENTS as readonly string[]).includes(value);
}
