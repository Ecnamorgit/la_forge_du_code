import type { SpriteSheet } from "@/components/ui/Sprite";

/**
 * Registry of pixel art sprite sheets.
 *
 * Each declared sheet must exist at the given path with the stated layout.
 * Frame tables and palette: docs/PIXEL_ART_GUIDE.md.
 */

/**
 * Per-sheet switches. While a flag is `false`, components show the fallback
 * emoji; set it to `true` once the PNG is delivered in
 * public/sprites/.
 */
export const SPRITE_SHEETS_READY = {
  mission: true,
  banner: true,
  badges: true,
  intro: false,
} as const;

/**
 * Course icons. Frame order follows COURSES_CATALOG
 * (lib/courses-catalog.ts): 0=html, 1=css, 2=javascript, 3=react,
 * 4=typescript, 5=git, 6=sql, 7=nodejs, 8=tests, 9=devops, 10=mongodb,
 * 11=security, 12=python, 13=algo; frames 14 to 31 reserved.
 * Sheet: 8 columns × 4 rows of 32×32 = 256×128.
 */
export const MISSION_ICONS: SpriteSheet = {
  src: "/sprites/mission-icons-v2.png",
  frameWidth: 32,
  frameHeight: 32,
  columns: 8,
};

/**
 * Victory banner icons, one per archetype (docs/PIXEL_ART_GUIDE.md).
 * Sheet: 4 columns × 4 rows of 48×48 = 192×192.
 */
export const BANNER_ICONS: SpriteSheet = {
  src: "/sprites/banner-icons.png",
  frameWidth: 48,
  frameHeight: 48,
  columns: 4,
};

/**
 * Badge icons. Frame order follows BADGES (lib/badges-catalog.ts).
 * Sheet: 8 columns × N rows of 64×64 (8×6 = 512×384 for 48 badges).
 */
export const BADGE_ICONS: SpriteSheet = {
  src: "/sprites/badges.png",
  frameWidth: 64,
  frameHeight: 64,
  columns: 8,
};

/**
 * Intro cutscene frames, one per scene in INTRO_SCENES order
 * (lib/intro.ts). Sheet: 5 columns × 1 row of 320×180 = 1600×180.
 * Not delivered yet: SPRITE_SHEETS_READY.intro stays false.
 */
export const INTRO_CINEMATIC: SpriteSheet = {
  src: "/sprites/intro-cinematic.png",
  frameWidth: 320,
  frameHeight: 180,
  columns: 5,
};

/** Chapter background per course. */
export const BACKGROUND_BY_COURSE: Record<string, string> = {
  // TODO: switch to /bg/html-chapter.png once the image is delivered.
  html: "/chapter-1-bg.webp",
  // TODO: switch to /bg/css-chapter.png once the image is delivered.
  css: "/chapter-1-bg.webp",
  // TODO: switch to /bg/js-chapter.png once the image is delivered.
  javascript: "/chapter-1-bg.webp",
};

export function getChapterBackground(course: string): string {
  return BACKGROUND_BY_COURSE[course] ?? "/chapter-1-bg.webp";
}
