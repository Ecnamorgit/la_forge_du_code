/**
 * Personnages : identité affichée (nom, glyphe), alignée sur
 * docs/conception_storytelling.md §2. Kira Vesper porte les briefings,
 * H.E.L.P. les indices de l'éditeur ; le Spectre est réservé aux pièges et
 * aux erreurs (lib/narrative-feedback.ts).
 */

export interface Character {
  /** Nom affiché au cadet. */
  name: string;
  /** Rôle ou titre court affiché à côté du nom. */
  title: string;
  /** Glyphe décoratif devant le nom de l'interlocuteur. */
  glyph: string;
}

export const CHARACTERS = {
  kira: { name: "Kira Vesper", title: "Ing. en chef", glyph: "👩‍✈️" },
  help: { name: "H.E.L.P.", title: "Assistant système", glyph: "🤖" },
  spectre: { name: "Le Spectre", title: "Signal inconnu", glyph: "👾" },
} as const satisfies Record<string, Character>;

export type CharacterId = keyof typeof CHARACTERS;
