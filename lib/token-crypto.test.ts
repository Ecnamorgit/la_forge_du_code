import { describe, it, expect } from "vitest";
import { generateRawToken, hashToken } from "./token-crypto";

describe("generateRawToken", () => {
  it("produces a 43-character URL-safe token", () => {
    const t = generateRawToken();
    expect(t).toHaveLength(43);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("produces unique tokens", () => {
    const a = generateRawToken();
    const b = generateRawToken();
    expect(a).not.toBe(b);
  });
});

describe("hashToken", () => {
  it("returns a 64-character hex SHA-256", () => {
    const h = hashToken("token-de-test");
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("never stores the token in plain text", () => {
    const raw = generateRawToken();
    expect(hashToken(raw)).not.toBe(raw);
  });

  it("changes for different inputs", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});
