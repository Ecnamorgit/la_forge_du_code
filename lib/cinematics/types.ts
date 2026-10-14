/**
 * Types for the narrative mini-cinematics: course intro, chapter outro
 * and finale.
 */

import type { CharacterId } from "@/lib/characters";

/** Voice of a scene: a character from the story bible, or the neutral "system". */
export type CinematicSpeaker = CharacterId | "system";

/** Themed visual effect applied to the scene. */
export type CinematicFx = "none" | "alert" | "glitch" | "victory";

/** Visual background of the scene (built in CSS, no dedicated asset needed). */
export type CinematicVisual = "briefing" | "station" | "spectre" | "victory";

export interface CinematicScene {
  /** Stable index within the cinematic. */
  id: number;
  speaker: CinematicSpeaker;
  /** Scene text, readable by screen readers. */
  narration: string;
  visual: CinematicVisual;
  fx?: CinematicFx;
}

export interface Cinematic {
  /** Persisted identifier: "html:intro", "html:chapter:chapitre-3", "html:finale". */
  id: string;
  scenes: CinematicScene[];
}

/** Cinematics declared by a course (data/courses/<slug>/cinematics.ts). */
export interface CourseCinematics {
  courseIntro: Cinematic;
  /** Key = chapter slug. A missing chapter falls back to the generic one. */
  chapterOutros: Record<string, Cinematic>;
  courseFinale: Cinematic;
}

export type CinematicMoment =
  | { kind: "intro" }
  | { kind: "chapter"; chapter: string }
  | { kind: "finale" };

/** How long a scene is shown before auto-advancing (matches the intro). */
export const CINEMATIC_SCENE_DURATION_MS = 4500;

/** Stable identifier of a cinematic (CinematicView persistence key). */
export function cinematicId(course: string, moment: CinematicMoment): string {
  if (moment.kind === "chapter") return `${course}:chapter:${moment.chapter}`;
  return `${course}:${moment.kind}`;
}
