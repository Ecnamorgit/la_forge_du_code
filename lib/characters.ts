/**
 * Characters: displayed identity (name, glyph), aligned with
 * docs/conception_storytelling.md §2. Kira Vesper delivers the briefings,
 * H.E.L.P. the editor hints; the Spectre is reserved for traps and
 * errors (lib/narrative-feedback.ts).
 */

export interface Character {
  /** Name shown to the cadet. */
  name: string;
  /** Role or short title shown next to the name. */
  title: string;
  /** Decorative glyph in front of the speaker's name. */
  glyph: string;
}

export const CHARACTERS = {
  kira: { name: "Kira Vesper", title: "Ing. en chef", glyph: "👩‍✈️" },
  help: { name: "H.E.L.P.", title: "Assistant système", glyph: "🤖" },
  spectre: { name: "Le Spectre", title: "Signal inconnu", glyph: "👾" },
} as const satisfies Record<string, Character>;

export type CharacterId = keyof typeof CHARACTERS;
