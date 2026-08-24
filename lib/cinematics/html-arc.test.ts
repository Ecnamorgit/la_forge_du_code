import { describe, expect, it } from "vitest";

import { HTML_CINEMATICS } from "@/data/courses/html/cinematics";
import { listChapterSlugs } from "@/lib/courses-registry";
import { getCinematic } from "./resolver";

describe("arc HTML", () => {
  it("chaque chapitre du cursus a une outro déclarée (pas de clé orpheline)", () => {
    const slugs = listChapterSlugs("html");
    expect(Object.keys(HTML_CINEMATICS.chapterOutros).sort()).toEqual([...slugs].sort());
  });

  it("respecte les tailles de la spec", () => {
    expect(HTML_CINEMATICS.courseIntro.scenes.length).toBeGreaterThanOrEqual(3);
    expect(HTML_CINEMATICS.courseIntro.scenes.length).toBeLessThanOrEqual(4);
    for (const outro of Object.values(HTML_CINEMATICS.chapterOutros)) {
      expect(outro.scenes.length).toBeGreaterThanOrEqual(2);
      expect(outro.scenes.length).toBeLessThanOrEqual(3);
    }
    expect(HTML_CINEMATICS.courseFinale.scenes.length).toBeGreaterThanOrEqual(5);
    expect(HTML_CINEMATICS.courseFinale.scenes.length).toBeLessThanOrEqual(7);
  });

  it("le résolveur sert l'arc HTML, pas le générique", () => {
    expect(getCinematic("html", { kind: "intro" })).toBe(HTML_CINEMATICS.courseIntro);
    expect(getCinematic("html", { kind: "chapter", chapter: "chapitre-4" })).toBe(
      HTML_CINEMATICS.chapterOutros["chapitre-4"]
    );
    expect(getCinematic("html", { kind: "finale" })).toBe(HTML_CINEMATICS.courseFinale);
  });

  it("ids stables et scènes numérotées séquentiellement", () => {
    expect(HTML_CINEMATICS.courseIntro.id).toBe("html:intro");
    expect(HTML_CINEMATICS.courseFinale.id).toBe("html:finale");
    for (const cine of [
      HTML_CINEMATICS.courseIntro,
      HTML_CINEMATICS.courseFinale,
      ...Object.values(HTML_CINEMATICS.chapterOutros),
    ]) {
      cine.scenes.forEach((s, i) => expect(s.id).toBe(i));
    }
  });
});
