import type { CinematicScene } from "./types";

export type SceneSound = "fanfare" | "bip";

/**
 * Sound cue of a cinematic scene. The fanfare belongs to the scenes that
 * celebrate something (`fx: "victory"`): a restored sector, a finished
 * course. Every other scene gets the neutral bip, including the last scene
 * of a course intro, which is a mission briefing, not a win.
 */
export function sceneSound(scene: CinematicScene): SceneSound {
  return scene.fx === "victory" ? "fanfare" : "bip";
}
