import type { SpriteSheet } from "@/components/ui/Sprite";

/**
 * Central registry of pixel-art sprite sheets used across the app.
 *
 * Each sheet declared here MUST exist at the given public path with the
 * declared frame layout. When a sheet is missing, components consuming it
 * should fall back to their emoji equivalents.
 */

// Layout contract for the artist + the wiring code. See docs/PIXEL_ART_GUIDE.md
// for the full frame-index → meaning tables and palette.

/**
 * Drop-in switches. Each stays `false` until the corresponding PNG ships in
 * public/sprites/. While false, consuming components render the emoji fallback,
 * so there is zero visual change until the art is ready — then flip the flag.
 */
export const SPRITE_SHEETS_READY = {
  mission: true,
  banner: true,
  badges: true,
} as const;

/**
 * Course/mission icons. Frame order MUST follow COURSES_CATALOG
 * (lib/courses-catalog.ts): 0=html, 1=css, 2=javascript, 3=react,
 * 4=typescript, 5=git, 6=sql, 7=nodejs, 8=tests, 9=devops, 10=mongodb,
 * 11=security, 12=python, 13=algo. Frames 14-31 reserved.
 * Sheet: 8 columns × 4 rows × 64×64 = 512×256.
 */
export const MISSION_ICONS: SpriteSheet = {
  src: "/sprites/mission-icons-v2.png",
  frameWidth: 32,
  frameHeight: 32,
  columns: 8,
};

/**
 * Victory-banner icons (one per achievement archetype). See the BANNER enum in
 * the guide. Sheet: 4 columns × 4 rows × 48×48 = 192×192.
 */
export const BANNER_ICONS: SpriteSheet = {
  src: "/sprites/banner-icons.png",
  frameWidth: 48,
  frameHeight: 48,
  columns: 4,
};

/**
 * Badge icons. Frame order MUST follow the ALL_BADGES array (app/profil/page.tsx),
 * which itself must be kept in sync with BADGE_BY_CHAPTER (lib/courses-meta.ts).
 * Sheet: 8 columns × N rows × 64×64 (e.g. 8×6 = 512×384 covers 48 badges).
 */
export const BADGE_ICONS: SpriteSheet = {
  src: "/sprites/badges.png",
  frameWidth: 64,
  frameHeight: 64,
  columns: 8,
};

/** Per-course chapter background. */
export const BACKGROUND_BY_COURSE: Record<string, string> = {
  // TODO: swap to /bg/html-chapter.png when the asset ships.
  html: "/chapter-1-bg.png",
  // TODO: swap to /bg/css-chapter.png when the asset ships.
  css: "/chapter-1-bg.png",
  // TODO: swap to /bg/js-chapter.png when the asset ships.
  javascript: "/chapter-1-bg.png",
};

export function getChapterBackground(course: string): string {
  return BACKGROUND_BY_COURSE[course] ?? "/chapter-1-bg.png";
}
