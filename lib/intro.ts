/**
 * Pure logic for the intro cinematic, with no DOM dependency at load time
 * so it stays testable under node. Storage access is guarded by
 * `typeof window`.
 */

export const INTRO_STORAGE_KEY = "nc_intro_seen";

/** How long a scene is shown before auto-advancing (ms). */
export const INTRO_SCENE_DURATION_MS = 4500;

export interface IntroScene {
  /** Stable index, also used as the frame number in INTRO_CINEMATIC. */
  id: number;
  /** Narration shown as real text (readable by screen readers). */
  narration: string;
  /** Fallback visual variant, built from existing images. */
  visual: "logo" | "cadet" | "orbit" | "planet" | "invite";
}

export const INTRO_SCENES: IntroScene[] = [
  {
    id: 0,
    narration: "ALERTE CORRUPTION : Le virus inconnu SPECTRE s'est infiltré dans les serveurs de la galaxie. Les systèmes orbitaux s'effondrent.",
    visual: "logo",
  },
  {
    id: 1,
    narration: "La flotte Nebula est paralysée. Tu es le dernier Cadet-Ingénieur encore opérationnel en secteur 7.",
    visual: "cadet",
  },
  {
    id: 2,
    narration: "« Transmissions ouvertes... Bonjour Cadet. Je suis l'Ingénieure en Chef Kira Vesper. Assistée de l'I.A. H.E.L.P., nous allons guider chacun de tes pas. »",
    visual: "orbit",
  },
  {
    id: 3,
    narration: "Pour repousser Spectre, tu vas devoir réécrire les protocoles informatiques. Chaque ligne de code valide restaure la station.",
    visual: "planet",
  },
  {
    id: 4,
    narration: "Configure ton profil de Cadet et prépare-toi à lancer ta première mission. La galaxie compte sur toi !",
    visual: "invite",
  },
];

/**
 * Records that the intro has been seen, so it only auto-plays once
 * per browser; no effect if storage is unavailable.
 */
export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** Has the intro already been seen in this browser? */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    // Storage unavailable: do not force the intro on every navigation.
    return true;
  }
}
