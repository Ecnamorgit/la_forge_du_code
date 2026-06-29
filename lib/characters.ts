/**
 * Narrative cast — single source of truth for character identity (name + glyph)
 * shown in the UI, aligned with docs/conception_storytelling.md §2.
 *
 * Kira Vesper voices the mission briefings; H.E.L.P. voices the in-editor hints;
 * the Spectre is reserved for trap/error framing (see lib/narrative-feedback.ts).
 */

export interface Character {
  /** Display name as shown to the cadet. */
  name: string;
  /** Short role/title shown alongside the name. */
  title: string;
  /** Decorative glyph prefixing the speaker label. */
  glyph: string;
}

export const CHARACTERS = {
  kira: { name: "Kira Vesper", title: "Ing. en chef", glyph: "👩‍✈️" },
  help: { name: "H.E.L.P.", title: "Assistant système", glyph: "🤖" },
  spectre: { name: "Le Spectre", title: "Signal inconnu", glyph: "👾" },
} as const satisfies Record<string, Character>;

export type CharacterId = keyof typeof CHARACTERS;
