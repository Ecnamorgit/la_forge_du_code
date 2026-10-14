/**
 * Minimal counting for the acquisition funnel.
 *
 * No personal data, no persistent visitor id: we count timestamped
 * occurrences, not people. No cookie and no third-party processor
 * (docs/RGPD.md).
 */

export const TRACK_EVENTS = ["landing_vue", "essai_lance", "inscription"] as const;

export type TrackEvent = (typeof TRACK_EVENTS)[number];

export function isTrackEvent(value: unknown): value is TrackEvent {
  return typeof value === "string" && (TRACK_EVENTS as readonly string[]).includes(value);
}
