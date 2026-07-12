import { describe, it, expect } from "vitest";
import {
  shouldAutoPlayIntro,
  INTRO_SCENES,
  INTRO_STORAGE_KEY,
  INTRO_SCENE_DURATION_MS,
} from "./intro";

describe("shouldAutoPlayIntro", () => {
  it("joue à la première visite sans reduced-motion", () => {
    expect(shouldAutoPlayIntro(false, false)).toBe(true);
  });
  it("ne joue pas si déjà vue", () => {
    expect(shouldAutoPlayIntro(true, false)).toBe(false);
  });
  it("ne joue pas si reduced-motion demandé", () => {
    expect(shouldAutoPlayIntro(false, true)).toBe(false);
  });
  it("ne joue pas si vue ET reduced-motion", () => {
    expect(shouldAutoPlayIntro(true, true)).toBe(false);
  });
});

describe("INTRO_SCENES", () => {
  it("contient exactement 5 scènes aux ids séquentiels 0..4", () => {
    expect(INTRO_SCENES).toHaveLength(5);
    INTRO_SCENES.forEach((s, i) => expect(s.id).toBe(i));
  });
  it("a une narration non vide pour chaque scène", () => {
    for (const s of INTRO_SCENES) {
      expect(s.narration.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("constantes", () => {
  it("clé storage et durée stables", () => {
    expect(INTRO_STORAGE_KEY).toBe("nc_intro_seen");
    expect(INTRO_SCENE_DURATION_MS).toBeGreaterThan(0);
  });
});
