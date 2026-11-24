import { describe, it, expect } from "vitest";

import { COURSES_CATALOG } from "@/lib/courses-catalog";
import { getCinematic } from "./resolver";
import { sceneSound } from "./scene-sound";

const sounds = (course: string, moment: Parameters<typeof getCinematic>[1]) =>
  getCinematic(course, moment).scenes.map(sceneSound);

describe("sceneSound", () => {
  it("plays the fanfare on a victory scene and the bip otherwise", () => {
    const base = { id: 0, speaker: "system", narration: "", visual: "station" } as const;
    expect(sceneSound({ ...base, fx: "victory" })).toBe("fanfare");
    expect(sceneSound({ ...base, fx: "alert" })).toBe("bip");
    expect(sceneSound(base)).toBe("bip");
  });

  // A course intro is the mission briefing: nothing has been won yet. The
  // player used to play the fanfare on the last scene of every cinematic.
  it.each(COURSES_CATALOG.map((c) => c.slug))(
    "never plays the fanfare during the intro of %s",
    (course) => {
      expect(sounds(course, { kind: "intro" })).not.toContain("fanfare");
    }
  );

  it("still celebrates a finished chapter and a finished course", () => {
    for (const course of ["html", "rust", "agent-ia"]) {
      expect(sounds(course, { kind: "chapter", chapter: "chapitre-1" })).toContain("fanfare");
      expect(sounds(course, { kind: "finale" })).toContain("fanfare");
    }
  });
});
