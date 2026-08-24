/**
 * Types des mini-cinématiques narratives (intro de cursus, outro de chapitre,
 * finale). Logique pure, aucune dépendance DOM — même contrainte que
 * lib/intro.ts pour rester testable en node.
 */

import type { CharacterId } from "@/lib/characters";

/** Voix d'une scène : un personnage de la bible, ou le « système » neutre. */
export type CinematicSpeaker = CharacterId | "system";

/** Effet visuel thématique appliqué à la scène. */
export type CinematicFx = "none" | "alert" | "glitch" | "victory";

/** Fond visuel de la scène (composé en CSS, pas d'asset dédié requis). */
export type CinematicVisual = "briefing" | "station" | "spectre" | "victory";

export interface CinematicScene {
  /** Index stable dans la cinématique. */
  id: number;
  speaker: CinematicSpeaker;
  /** Vrai texte (lisible par lecteur d'écran). */
  narration: string;
  visual: CinematicVisual;
  fx?: CinematicFx;
}

export interface Cinematic {
  /** Identifiant persisté : "html:intro", "html:chapter:chapitre-3", "html:finale". */
  id: string;
  scenes: CinematicScene[];
}

/** Cinématiques déclarées par un cursus (data/courses/<slug>/cinematics.ts). */
export interface CourseCinematics {
  courseIntro: Cinematic;
  /** Clé = slug de chapitre. Un chapitre absent retombe sur le générique. */
  chapterOutros: Record<string, Cinematic>;
  courseFinale: Cinematic;
}

export type CinematicMoment =
  | { kind: "intro" }
  | { kind: "chapter"; chapter: string }
  | { kind: "finale" };

/** Durée d'affichage d'une scène avant auto-défilement (alignée sur l'intro). */
export const CINEMATIC_SCENE_DURATION_MS = 4500;

/** Identifiant stable d'une cinématique (clé de persistance CinematicView). */
export function cinematicId(course: string, moment: CinematicMoment): string {
  if (moment.kind === "chapter") return `${course}:chapter:${moment.chapter}`;
  return `${course}:${moment.kind}`;
}
