import { describe, it, expect } from "vitest";
import { generateRawToken, hashToken } from "./token-crypto";

describe("generateRawToken", () => {
  it("produit un token URL-safe de 43 caractères", () => {
    const t = generateRawToken();
    expect(t).toHaveLength(43);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("produit des tokens uniques", () => {
    const a = generateRawToken();
    const b = generateRawToken();
    expect(a).not.toBe(b);
  });
});

describe("hashToken", () => {
  it("retourne un SHA-256 hex de 64 caractères", () => {
    const h = hashToken("token-de-test");
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("est déterministe", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("ne stocke jamais le token en clair", () => {
    const raw = generateRawToken();
    expect(hashToken(raw)).not.toBe(raw);
  });

  it("change pour des entrées différentes", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});
