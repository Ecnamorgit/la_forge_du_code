import { describe, it, expect } from "vitest";
import {
  INTRO_SCENES,
  INTRO_STORAGE_KEY,
  INTRO_SCENE_DURATION_MS,
} from "./intro";

describe("INTRO_SCENES", () => {
  it("contains exactly 5 scenes with sequential ids 0..4", () => {
    expect(INTRO_SCENES).toHaveLength(5);
    INTRO_SCENES.forEach((s, i) => expect(s.id).toBe(i));
  });
  it("has a non-empty narration for each scene", () => {
    for (const s of INTRO_SCENES) {
      expect(s.narration.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("constants", () => {
  it("stable storage key and duration", () => {
    expect(INTRO_STORAGE_KEY).toBe("nc_intro_seen");
    expect(INTRO_SCENE_DURATION_MS).toBeGreaterThan(0);
  });
});
