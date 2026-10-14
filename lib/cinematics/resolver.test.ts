import { describe, expect, it } from "vitest";

import { getCourseStatus } from "@/lib/courses-catalog";
import { cinematicId } from "./types";
import { getCinematic } from "./resolver";
import { isLastChapter } from "./last-chapter";

describe("cinematicId", () => {
  it("builds stable identifiers", () => {
    expect(cinematicId("html", { kind: "intro" })).toBe("html:intro");
    expect(cinematicId("html", { kind: "chapter", chapter: "chapitre-3" })).toBe(
      "html:chapter:chapitre-3"
    );
    expect(cinematicId("css", { kind: "finale" })).toBe("css:finale");
  });
});

describe("getCinematic — generic fallback", () => {
  it("always provides a cinematic, even for a course without an arc", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.id).toBe("css:intro");
    expect(intro.scenes.length).toBeGreaterThanOrEqual(2);
    for (const s of intro.scenes) expect(s.narration.length).toBeGreaterThan(10);
  });

  it("generic outro: deterministic for the same chapter", () => {
    const a = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const b = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    expect(a).toEqual(b);
    expect(a.id).toBe("css:chapter:chapitre-2");
    expect(a.scenes.length).toBeLessThanOrEqual(3);
  });

  it("generic outro: varies from one chapter to the next (rotation)", () => {
    const c2 = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const c3 = getCinematic("css", { kind: "chapter", chapter: "chapitre-3" });
    expect(c2.scenes[0].narration).not.toBe(c3.scenes[0].narration);
  });

  it("mentions the course title in the generic intro", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.scenes.map((s) => s.narration).join(" ")).toContain("CSS");
  });

  it("respects the spec sizes (intro 3-4, outro 2-3, finale 5-7)", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.scenes.length).toBeGreaterThanOrEqual(3);
    expect(intro.scenes.length).toBeLessThanOrEqual(4);
    const outro = getCinematic("css", { kind: "chapter", chapter: "chapitre-1" });
    expect(outro.scenes.length).toBeGreaterThanOrEqual(2);
    expect(outro.scenes.length).toBeLessThanOrEqual(3);
    const finale = getCinematic("css", { kind: "finale" });
    expect(finale.scenes.length).toBeGreaterThanOrEqual(5);
    expect(finale.scenes.length).toBeLessThanOrEqual(7);
  });

  it("no generic narration doubles the quotation marks", () => {
    const sample = [
      getCinematic("css", { kind: "intro" }),
      getCinematic("css", { kind: "finale" }),
      getCinematic("css", { kind: "chapter", chapter: "chapitre-1" }),
      getCinematic("css", { kind: "chapter", chapter: "chapitre-2" }),
      getCinematic("css", { kind: "chapter", chapter: "chapitre-3" }),
    ];
    for (const cine of sample) {
      for (const scene of cine.scenes) {
        expect(scene.narration).not.toContain("««");
        expect(scene.narration).not.toContain("»»");
      }
    }
  });
});

describe("isLastChapter", () => {
  it("true only for the last chapter of the course", () => {
    expect(isLastChapter("html", "chapitre-8")).toBe(true);
    expect(isLastChapter("html", "chapitre-3")).toBe(false);
  });

  it("false for an unknown course", () => {
    expect(isLastChapter("inconnu", "chapitre-1")).toBe(false);
  });

  it("false for a pilot course (preview status), even on its only chapter", () => {
    expect(getCourseStatus("python")).toBe("preview");
    expect(isLastChapter("python", "chapitre-1")).toBe(false);
  });
});
