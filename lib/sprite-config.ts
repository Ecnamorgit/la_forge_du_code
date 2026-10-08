import type { SpriteSheet } from "@/components/ui/Sprite";

/**
 * Registre des planches de sprites pixel art.
 *
 * Chaque planche déclarée doit exister au chemin indiqué avec la disposition
 * annoncée. Tables des frames et palette : docs/PIXEL_ART_GUIDE.md.
 */

/**
 * Interrupteurs par planche. Tant qu'un drapeau vaut `false`, les composants
 * affichent l'emoji de repli ; le passer à `true` une fois le PNG livré dans
 * public/sprites/.
 */
export const SPRITE_SHEETS_READY = {
  mission: true,
  banner: true,
  badges: true,
  intro: false,
} as const;

/**
 * Icônes de cursus. L'ordre des frames suit COURSES_CATALOG
 * (lib/courses-catalog.ts) : 0=html, 1=css, 2=javascript, 3=react,
 * 4=typescript, 5=git, 6=sql, 7=nodejs, 8=tests, 9=devops, 10=mongodb,
 * 11=security, 12=python, 13=algo ; frames 14 à 31 réservées.
 * Planche : 8 colonnes × 4 lignes de 32×32 = 256×128.
 */
export const MISSION_ICONS: SpriteSheet = {
  src: "/sprites/mission-icons-v2.png",
  frameWidth: 32,
  frameHeight: 32,
  columns: 8,
};

/**
 * Icônes de bannière de victoire, une par archétype (docs/PIXEL_ART_GUIDE.md).
 * Planche : 4 colonnes × 4 lignes de 48×48 = 192×192.
 */
export const BANNER_ICONS: SpriteSheet = {
  src: "/sprites/banner-icons.png",
  frameWidth: 48,
  frameHeight: 48,
  columns: 4,
};

/**
 * Icônes de badges. L'ordre des frames suit BADGES (lib/badges-catalog.ts).
 * Planche : 8 colonnes × N lignes de 64×64 (8×6 = 512×384 pour 48 badges).
 */
export const BADGE_ICONS: SpriteSheet = {
  src: "/sprites/badges.png",
  frameWidth: 64,
  frameHeight: 64,
  columns: 8,
};

/**
 * Frames de la cinématique d'intro, une par scène dans l'ordre d'INTRO_SCENES
 * (lib/intro.ts). Planche : 5 colonnes × 1 ligne de 320×180 = 1600×180.
 * Pas encore livrée : SPRITE_SHEETS_READY.intro reste à false.
 */
export const INTRO_CINEMATIC: SpriteSheet = {
  src: "/sprites/intro-cinematic.png",
  frameWidth: 320,
  frameHeight: 180,
  columns: 5,
};

/** Fond de chapitre par cursus. */
export const BACKGROUND_BY_COURSE: Record<string, string> = {
  // TODO : passer à /bg/html-chapter.png quand l'image sera livrée.
  html: "/chapter-1-bg.png",
  // TODO : passer à /bg/css-chapter.png quand l'image sera livrée.
  css: "/chapter-1-bg.png",
  // TODO : passer à /bg/js-chapter.png quand l'image sera livrée.
  javascript: "/chapter-1-bg.png",
};

export function getChapterBackground(course: string): string {
  return BACKGROUND_BY_COURSE[course] ?? "/chapter-1-bg.png";
}
