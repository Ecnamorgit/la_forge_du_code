/**
 * Emblèmes : axe de personnalisation qui puise dans les deux catalogues de
 * badges, de cursus (`lib/badges-catalog.ts`) et de conduite
 * (`lib/conduct-badges.ts`). `setCosmetics` accepte tout badge obtenu, donc
 * toute surface qui affiche l'emblème doit résoudre les deux familles. Liste
 * unique, partagée par l'armurerie et la carte de cadet.
 */

import { BADGES, badgeFrameById } from "./badges-catalog";
import { CONDUCT_BADGES } from "./conduct-badges";

export interface EmblemOption {
  id: string;
  /** Icône emoji, en repli quand aucune frame de sprite n'existe. */
  icon: string;
  label: string;
  /** Sert de « condition » affichée sous le badge, obtenu ou non. */
  description: string;
  /**
   * Frame dans /sprites/badges.png, ou null pour les badges de conduite,
   * absents de la planche et rendus en emoji.
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

/** Emblème correspondant à un id, cursus ou conduite ; null si inconnu. */
export function getEmblem(id: string | null): EmblemOption | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
