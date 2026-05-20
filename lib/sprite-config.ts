import type { SpriteSheet } from "@/components/ui/Sprite";

/**
 * Central registry of pixel-art sprite sheets used across the app.
 *
 * Each sheet declared here MUST exist at the given public path with the
 * declared frame layout. When a sheet is missing, components consuming it
 * should fall back to their emoji equivalents.
 */

/** 32 mission icons (8 columns × 4 rows × 64×64 = 512×256). */
export const MISSION_ICONS: SpriteSheet = {
  src: "/sprites/mission-icons.png",
  frameWidth: 64,
  frameHeight: 64,
  columns: 8,
};

/** 16 banner-victory icons (4 columns × 4 rows × 96×96 = 384×384). */
export const BANNER_ICONS: SpriteSheet = {
  src: "/sprites/banner-icons.png",
  frameWidth: 96,
  frameHeight: 96,
  columns: 4,
};

/** 16 badges (4 columns × 4 rows × 128×128 = 512×512). */
export const BADGE_ICONS: SpriteSheet = {
  src: "/sprites/badges.png",
  frameWidth: 128,
  frameHeight: 128,
  columns: 4,
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
