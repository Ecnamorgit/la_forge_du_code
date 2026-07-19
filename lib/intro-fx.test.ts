import { describe, it, expect } from "vitest";

import { INTRO_FX, type Fx } from "./intro-fx";
import { INTRO_SCENES } from "./intro";

/** Bornes [0,1] avec un epsilon nul : les coordonnées sont normalisées. */
function inUnit(v: number): boolean {
  return v >= 0 && v <= 1;
}

/** Points/zones d'un effet, pour vérifier qu'ils restent dans l'image. */
function fxBounds(fx: Fx): Array<[number, number]> {
  switch (fx.kind) {
    case "flicker":
    case "scanlines":
    case "sweep":
    case "drift":
    case "particles":
      return [
        [fx.x, fx.y],
        [fx.x + fx.w, fx.y + fx.h],
      ];
    case "pulse":
      return [[fx.x, fx.y]];
    case "sparks":
      return [[fx.x, fx.y]];
    case "beam":
      return [fx.from, fx.to];
  }
}

describe("INTRO_FX", () => {
  it("couvre exactement les scènes de INTRO_SCENES", () => {
    const ids = Object.keys(INTRO_FX).map(Number).sort();
    expect(ids).toEqual(INTRO_SCENES.map((s) => s.id));
  });

  it("a au moins un effet et une caméra par scène", () => {
    for (const scene of Object.values(INTRO_FX)) {
      expect(scene.effects.length).toBeGreaterThan(0);
      expect(scene.camera.amount).toBeGreaterThan(0);
      // Les dérives restent subtiles (< 10% de l'image).
      expect(scene.camera.amount).toBeLessThan(0.1);
    }
  });

  it("garde toutes les positions dans l'image ([0,1])", () => {
    for (const scene of Object.values(INTRO_FX)) {
      for (const fx of scene.effects) {
        for (const [x, y] of fxBounds(fx)) {
          expect(inUnit(x)).toBe(true);
          expect(inUnit(y)).toBe(true);
        }
      }
    }
  });

  it("a des périodes strictement positives et des couleurs hex", () => {
    for (const scene of Object.values(INTRO_FX)) {
      for (const fx of scene.effects) {
        expect(fx.period).toBeGreaterThan(0);
        expect(fx.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("donne des flux de particules bornés (perf)", () => {
    for (const scene of Object.values(INTRO_FX)) {
      for (const fx of scene.effects) {
        if (fx.kind === "particles") {
          expect(fx.count).toBeGreaterThan(0);
          expect(fx.count).toBeLessThanOrEqual(40);
          expect(fx.speed).toBeGreaterThan(0);
        }
      }
    }
  });
});
