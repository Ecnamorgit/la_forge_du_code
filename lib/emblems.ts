/**
 * Les emblèmes — l'axe de personnalisation qui puise dans les DEUX catalogues
 * de badges.
 *
 * L'armurerie propose les 48 badges de cursus (`lib/badges-catalog.ts`) et les
 * 12 badges de conduite (`lib/conduct-badges.ts`), et `setCosmetics` accepte
 * n'importe quel badge réellement obtenu. Toute surface qui affiche l'emblème
 * porté doit donc savoir résoudre les deux familles : un cadet qui choisit
 * « Sprinteur » ou « Veilleur » voyait sa pastille disparaître de la carte de
 * cadet, sans erreur ni message, parce que la résolution ne regardait que le
 * catalogue des badges de cursus.
 *
 * Ce module est la seule liste : l'armurerie et la carte de cadet la
 * consomment toutes les deux, plutôt que d'en tenir chacune une version.
 */

import { BADGES, badgeFrameById } from "./badges-catalog";
import { CONDUCT_BADGES } from "./conduct-badges";

export interface EmblemOption {
  id: string;
  /** Icône emoji — le repli quand aucune frame de sprite n'existe. */
  icon: string;
  label: string;
  /** Sert de « condition » affichée sous le badge, obtenu ou non. */
  description: string;
  /**
   * Frame dans /sprites/badges.png, ou null pour les badges de conduite.
   * `badges.png` est une planche 8×6 dont la position EST l'index : les
   * badges de conduite n'y figurent pas et se rendent en emoji.
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

/** L'emblème correspondant à un id, cursus ou conduite. Null si inconnu. */
export function getEmblem(id: string | null): EmblemOption | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
