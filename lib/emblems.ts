/**
 * Emblems: a customization axis drawing on both badge catalogs, course
 * badges (`lib/badges-catalog.ts`) and conduct badges
 * (`lib/conduct-badges.ts`). `setCosmetics` accepts any earned badge, so
 * every surface that shows the emblem must resolve both families. Single
 * list, shared by the armory and the cadet card.
 */

import { BADGES, badgeFrameById } from "./badges-catalog";
import { CONDUCT_BADGES } from "./conduct-badges";

export interface EmblemOption {
  id: string;
  /** Emoji icon, used as a fallback when no sprite frame exists. */
  icon: string;
  label: string;
  /** Used as the "condition" shown under the badge, earned or not. */
  description: string;
  /**
   * Frame in /sprites/badges.png, or null for conduct badges, which are
   * not on the sheet and render as emoji.
   */
  frame: number | null;
}

export const EMBLEM_OPTIONS: EmblemOption[] = [
  ...BADGES.map((b) => ({
    id: b.id,
    icon: b.icon,
    label: b.label,
    description: b.description,
    frame: badgeFrameById(b.id),
  })),
  ...CONDUCT_BADGES.map((b) => ({
    id: b.id,
    icon: b.icon,
    label: b.label,
    description: b.description,
    frame: null,
  })),
];

const BY_ID = new Map(EMBLEM_OPTIONS.map((o) => [o.id, o]));

/** Emblem matching an id, course or conduct; null if unknown. */
export function getEmblem(id: string | null): EmblemOption | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
