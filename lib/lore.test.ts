import { describe, expect, it } from "vitest";

import { CRAWL_LINES, CRAWL_WORD_BUDGET, LORE_SECTIONS } from "./lore";
import { INTRO_SCENES } from "./intro";
import { SPECTRE_TAUNTS } from "./narrative-feedback";
import { nullProgressLabel, nullProgressAriaLabel } from "./null-progress";

/** Termes bannis : anciens noms de la menace, remplacés par « Spectre ». */
const BANNED = [/\bnull\b/i, /\bglitch\b/i];

/**
 * Textes narratifs hors de lib/lore.ts et lib/intro.ts (retours d'erreur,
 * progression). On échantillonne les valeurs des fonctions concernées, pas
 * seulement des constantes.
 */
function scatteredNarrativeText(): string {
  const taunts = SPECTRE_TAUNTS.join(" ");
  const progressLabels = [0, 1, 42, 99, 100]
    .map((pct) => nullProgressLabel(pct).title)
    .join(" ");
  const ariaLabels = [0, 42, 100].map((pct) => nullProgressAriaLabel(pct)).join(" ");
  return `${taunts} ${progressLabels} ${ariaLabels}`;
}

function allNarrativeText(): string {
  const lore = LORE_SECTIONS.map((s) => `${s.title} ${s.body.join(" ")}`).join(" ");
  const crawl = CRAWL_LINES.map((l) => l.text).join(" ");
  const scenes = INTRO_SCENES.map((s) => s.narration).join(" ");
  return `${lore} ${crawl} ${scenes} ${scatteredNarrativeText()}`;
}

describe("intégrité narrative", () => {
  it("ne nomme jamais la menace « Null » ou « Glitch »", () => {
    const text = allNarrativeText();
    for (const pattern of BANNED) {
      expect(text, `terme banni ${pattern} trouvé`).not.toMatch(pattern);
    }
  });

  it("nomme la menace Spectre", () => {
    expect(allNarrativeText()).toMatch(/spectre/i);
  });

  it("garde le crawl dans son budget de mots", () => {
    const words = CRAWL_LINES.map((l) => l.text).join(" ").split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(CRAWL_WORD_BUDGET);
  });

  it("expose trois sections de lore non vides", () => {
    expect(LORE_SECTIONS).toHaveLength(3);
    for (const section of LORE_SECTIONS) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(0);
    }
  });
});
