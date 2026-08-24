import { describe, expect, it } from "vitest";

import { TYPEWRITER_CHARS_PER_SECOND, typewriterSlice } from "./typewriter";

describe("typewriterSlice", () => {
  it("révèle le texte progressivement au rythme configuré", () => {
    const text = "SYSTEME EN LIGNE";
    expect(typewriterSlice(text, 0)).toBe("");
    const after500ms = typewriterSlice(text, 500);
    expect(after500ms.length).toBe(
      Math.min(text.length, Math.floor((500 / 1000) * TYPEWRITER_CHARS_PER_SECOND))
    );
    expect(text.startsWith(after500ms)).toBe(true);
  });

  it("plafonne au texte complet", () => {
    expect(typewriterSlice("abc", 60_000)).toBe("abc");
  });

  it("ne casse jamais sur un temps négatif", () => {
    expect(typewriterSlice("abc", -100)).toBe("");
  });
});
