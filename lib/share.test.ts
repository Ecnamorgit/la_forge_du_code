import { describe, it, expect } from "vitest";
import { sanitizeShareName, parseShareXp } from "./share";

describe("sanitizeShareName", () => {
  it("keeps a normal username", () => {
    expect(sanitizeShareName("Lia42")).toBe("Lia42");
  });

  it("falls back to Cadet when empty or null", () => {
    expect(sanitizeShareName("")).toBe("Cadet");
    expect(sanitizeShareName(null)).toBe("Cadet");
    expect(sanitizeShareName("   ")).toBe("Cadet");
  });

  it("strips angle brackets but keeps inner spaces", () => {
    expect(sanitizeShareName("a<script>b")).toBe("ascriptb");
    expect(sanitizeShareName("Cdt Lia")).toBe("Cdt Lia");
  });

  it("truncates to 24 characters", () => {
    expect(sanitizeShareName("a".repeat(40))).toHaveLength(24);
  });
});

describe("parseShareXp", () => {
  it("parses a positive integer", () => {
    expect(parseShareXp("280")).toBe(280);
  });

  it("falls back to 0 for an invalid or negative value", () => {
    expect(parseShareXp("abc")).toBe(0);
    expect(parseShareXp("-5")).toBe(0);
    expect(parseShareXp(null)).toBe(0);
  });
});
