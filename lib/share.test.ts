import { describe, it, expect } from "vitest";
import { sanitizeShareName, parseShareXp } from "./share";

describe("sanitizeShareName", () => {
  it("garde un pseudo normal", () => {
    expect(sanitizeShareName("Lia42")).toBe("Lia42");
  });

  it("retombe sur Cadet quand vide ou nul", () => {
    expect(sanitizeShareName("")).toBe("Cadet");
    expect(sanitizeShareName(null)).toBe("Cadet");
    expect(sanitizeShareName("   ")).toBe("Cadet");
  });

  it("retire les chevrons mais garde les espaces internes", () => {
    expect(sanitizeShareName("a<script>b")).toBe("ascriptb");
    expect(sanitizeShareName("Cdt Lia")).toBe("Cdt Lia");
  });

  it("tronque a 24 caracteres", () => {
    expect(sanitizeShareName("a".repeat(40))).toHaveLength(24);
  });
});

describe("parseShareXp", () => {
  it("parse un entier positif", () => {
    expect(parseShareXp("280")).toBe(280);
  });

  it("retombe sur 0 pour une valeur invalide ou negative", () => {
    expect(parseShareXp("abc")).toBe(0);
    expect(parseShareXp("-5")).toBe(0);
    expect(parseShareXp(null)).toBe(0);
  });
});
