import { describe, expect, it } from "vitest";

import { CRAWL_LINES, CRAWL_WORD_BUDGET, LORE_SECTIONS } from "./lore";
import { INTRO_SCENES } from "./intro";
import { SPECTRE_TAUNTS } from "./narrative-feedback";
import { nullProgressLabel, nullProgressAriaLabel } from "./null-progress";

/** Banned terms: former names of the threat, replaced by "Spectre". */
const BANNED = [/\bnull\b/i, /\bglitch\b/i];

/**
 * Narrative text outside lib/lore.ts and lib/intro.ts (error feedback,
 * progress). We sample the output of the relevant functions, not
 * just constants.
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

describe("narrative integrity", () => {
  it("never names the threat 'Null' or 'Glitch'", () => {
    const text = allNarrativeText();
    for (const pattern of BANNED) {
      expect(text, `terme banni ${pattern} trouvé`).not.toMatch(pattern);
    }
  });

  it("names the threat Spectre", () => {
    expect(allNarrativeText()).toMatch(/spectre/i);
  });

  it("keeps the crawl within its word budget", () => {
    const words = CRAWL_LINES.map((l) => l.text).join(" ").split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(CRAWL_WORD_BUDGET);
  });

  it("exposes three non-empty lore sections", () => {
    expect(LORE_SECTIONS).toHaveLength(3);
    for (const section of LORE_SECTIONS) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(0);
    }
  });
});
