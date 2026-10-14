/**
 * Configuration of the intro mini-cinematics: each scene (PNG backdrop)
 * gets a camera drift and a list of animated effects. Positions are in
 * normalized image coordinates (x to the right, y downward, within
 * [0,1]). No DOM or three dependency: the engine (IntroSceneCanvas) consumes
 * this configuration, which stays testable under node.
 */

/** Camera drift over the duration of a scene (very small amplitudes). */
export type CameraMove =
  | { kind: "pan"; amount: number } // slow horizontal translation
  | { kind: "sway"; amount: number } // breathing sway
  | { kind: "zoom-in"; amount: number }
  | { kind: "zoom-out"; amount: number };

interface FxCommon {
  /** CSS hex color of the effect. */
  color: string;
  /** Cycle period in seconds (> 0). */
  period: number;
}

/** Additive layer that flickers glitch-style over an area. */
export interface FlickerFx extends FxCommon {
  kind: "flicker";
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Soft halo that breathes around a point. */
export interface PulseFx extends FxCommon {
  kind: "pulse";
  x: number;
  y: number;
  /** Normalized radius (fraction of the image height). */
  r: number;
}

/** Short burst of particles at a point, repeated every period. */
export interface SparksFx extends FxCommon {
  kind: "sparks";
  x: number;
  y: number;
}

/** Continuous stream of particles in an area, constant direction. */
export interface ParticlesFx extends FxCommon {
  kind: "particles";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Normalized stream direction (dx, dy). */
  dir: [number, number];
  /** Speed in image fractions per second. */
  speed: number;
  count: number;
}

/** Pulsing light beam between two points. */
export interface BeamFx extends FxCommon {
  kind: "beam";
  from: [number, number];
  to: [number, number];
}

/** Dark sprite that drifts slowly within an area (wreckage). */
export interface DriftFx extends FxCommon {
  kind: "drift";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Sprite size (fraction of the image height). */
  size: number;
}

/** Animated band of scanlines over an area (hologram). */
export interface ScanlinesFx extends FxCommon {
  kind: "scanlines";
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Periodic light sweep over an area (panel). */
export interface SweepFx extends FxCommon {
  kind: "sweep";
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Fx =
  | FlickerFx
  | PulseFx
  | SparksFx
  | ParticlesFx
  | BeamFx
  | DriftFx
  | ScanlinesFx
  | SweepFx;

export interface SceneFx {
  camera: CameraMove;
  effects: Fx[];
}

const CYAN = "#00f0ff";
const RED = "#ff2d55";
const ORANGE = "#ff6b2c";
const GREEN = "#00ff88";
const GOLD = "#ffc844";
const STAR = "#c8d6e5";

/** One entry per scene of `INTRO_SCENES` (ids 0..4). */
export const INTRO_FX: Record<number, SceneFx> = {
  // Scene 0: station under attack by the Spectre.
  0: {
    camera: { kind: "pan", amount: 0.03 },
    effects: [
      { kind: "flicker", x: 0.16, y: 0.5, w: 0.2, h: 0.28, color: RED, period: 0.9 },
      { kind: "flicker", x: 0.6, y: 0.16, w: 0.26, h: 0.3, color: RED, period: 1.3 },
      { kind: "pulse", x: 0.765, y: 0.16, r: 0.08, color: RED, period: 1.6 },
      { kind: "pulse", x: 0.19, y: 0.52, r: 0.06, color: RED, period: 2.1 },
      { kind: "pulse", x: 0.29, y: 0.38, r: 0.06, color: RED, period: 1.8 },
      { kind: "sparks", x: 0.3, y: 0.62, color: ORANGE, period: 1.4 },
      { kind: "sparks", x: 0.68, y: 0.3, color: RED, period: 1.9 },
      {
        kind: "particles",
        x: 0, y: 0, w: 1, h: 1,
        dir: [-1, 0.08],
        speed: 0.012,
        count: 22,
        color: STAR,
        period: 1,
      },
    ],
  },
  // Scene 1: the cadet's cockpit, alert in progress.
  1: {
    camera: { kind: "sway", amount: 0.012 },
    effects: [
      { kind: "pulse", x: 0.33, y: 0.63, r: 0.08, color: CYAN, period: 2.4 },
      { kind: "pulse", x: 0.67, y: 0.62, r: 0.08, color: CYAN, period: 2.8 },
      { kind: "flicker", x: 0.85, y: 0.3, w: 0.14, h: 0.3, color: RED, period: 1.1 },
      { kind: "drift", x: 0.2, y: 0.1, w: 0.55, h: 0.35, size: 0.05, color: "#2a3a55", period: 9 },
      { kind: "drift", x: 0.3, y: 0.2, w: 0.45, h: 0.3, size: 0.035, color: "#1a2744", period: 13 },
      {
        kind: "particles",
        x: 0.18, y: 0.05, w: 0.64, h: 0.48,
        dir: [-1, 0.05],
        speed: 0.006,
        count: 14,
        color: STAR,
        period: 1,
      },
    ],
  },
  // Scene 2: KIRA introduces herself as a hologram.
  2: {
    camera: { kind: "zoom-in", amount: 0.045 },
    effects: [
      { kind: "scanlines", x: 0.3, y: 0.13, w: 0.4, h: 0.62, color: CYAN, period: 3.2 },
      { kind: "pulse", x: 0.5, y: 0.42, r: 0.17, color: CYAN, period: 2.6 },
      {
        kind: "particles",
        x: 0.33, y: 0.2, w: 0.34, h: 0.55,
        dir: [0, -1],
        speed: 0.05,
        count: 16,
        color: CYAN,
        period: 1,
      },
      { kind: "flicker", x: 0.85, y: 0.3, w: 0.14, h: 0.3, color: RED, period: 1.7 },
    ],
  },
  // Scene 3: repair, green code lasers aimed at the ship.
  3: {
    camera: { kind: "zoom-in", amount: 0.045 },
    effects: [
      { kind: "beam", from: [0.5, 0.42], to: [0.73, 0.27], color: GREEN, period: 1.5 },
      { kind: "beam", from: [0.5, 0.44], to: [0.24, 0.3], color: GREEN, period: 1.9 },
      { kind: "beam", from: [0.5, 0.46], to: [0.85, 0.44], color: GREEN, period: 2.3 },
      { kind: "pulse", x: 0.73, y: 0.27, r: 0.1, color: GREEN, period: 1.5 },
      {
        kind: "particles",
        x: 0.35, y: 0.2, w: 0.45, h: 0.35,
        dir: [1, -0.35],
        speed: 0.09,
        count: 20,
        color: GREEN,
        period: 1,
      },
    ],
  },
  // Scene 4: system stable, customization portal.
  4: {
    camera: { kind: "zoom-out", amount: 0.04 },
    effects: [
      { kind: "sweep", x: 0.39, y: 0.5, w: 0.24, h: 0.3, color: CYAN, period: 2.8 },
      { kind: "pulse", x: 0.72, y: 0.3, r: 0.12, color: GREEN, period: 2.2 },
      { kind: "pulse", x: 0.93, y: 0.42, r: 0.07, color: CYAN, period: 2.6 },
      {
        kind: "particles",
        x: 0.38, y: 0.35, w: 0.26, h: 0.45,
        dir: [0, -1],
        speed: 0.03,
        count: 12,
        color: GOLD,
        period: 1,
      },
    ],
  },
};
