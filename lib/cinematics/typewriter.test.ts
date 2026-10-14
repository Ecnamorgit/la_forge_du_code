import { describe, expect, it } from "vitest";

import { TYPEWRITER_CHARS_PER_SECOND, typewriterSlice } from "./typewriter";

describe("typewriterSlice", () => {
  it("reveals the text progressively at the configured rate", () => {
    const text = "SYSTEME EN LIGNE";
    expect(typewriterSlice(text, 0)).toBe("");
    const after500ms = typewriterSlice(text, 500);
    expect(after500ms.length).toBe(
      Math.min(text.length, Math.floor((500 / 1000) * TYPEWRITER_CHARS_PER_SECOND))
    );
    expect(text.startsWith(after500ms)).toBe(true);
  });

  it("caps at the full text", () => {
    expect(typewriterSlice("abc", 60_000)).toBe("abc");
  });

  it("never breaks on a negative time", () => {
    expect(typewriterSlice("abc", -100)).toBe("");
  });
});
