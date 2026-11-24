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

/**
 * Frame of each speaker in /sprites/characters.png, in the order of
 * CHARACTER_PAINTERS (scripts/generate_spritesheets.py). "system" is the
 * neutral voice of the cinematics: it has a portrait but is not a character.
 */
export const CHARACTER_FRAMES = { system: 0, kira: 1, help: 2, spectre: 3 } as const;

export type SpeakerId = keyof typeof CHARACTER_FRAMES;

export const CHARACTERS = {
  kira: { name: "Kira Vesper", title: "Ing. en chef", glyph: "👩‍✈️" },
  help: { name: "H.E.L.P.", title: "Assistant système", glyph: "🤖" },
  spectre: { name: "Le Spectre", title: "Signal inconnu", glyph: "👾" },
} as const satisfies Record<string, Character>;

export type CharacterId = keyof typeof CHARACTERS;
