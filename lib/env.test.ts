import { describe, it, expect } from "vitest";
import { parseEnv } from "./env";

const VALID_PROD = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@db.example.com:5432/app",
  AUTH_SECRET: "a-32-char-random-secret-value-1234",
  APP_URL: "https://codeforge.example.com",
  RESEND_API_KEY: "re_live_xxx",
} as const;

describe("parseEnv", () => {
  it("accepts a complete production configuration", () => {
    const res = parseEnv({ ...VALID_PROD });
    expect(res.success).toBe(true);
  });

  it("accepts a minimal dev setup (secret + DATABASE_URL only)", () => {
    const res = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/codeforge",
      AUTH_SECRET: "dev-secret-at-least-16-chars",
    });
    expect(res.success).toBe(true);
  });

  it("rejects a missing DATABASE_URL", () => {
    const res = parseEnv({ AUTH_SECRET: "dev-secret-at-least-16-chars" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/DATABASE_URL/);
    }
  });

  it("rejects a non-PostgreSQL DATABASE_URL", () => {
    const res = parseEnv({
      DATABASE_URL: "mysql://user:pass@localhost:3306/app",
      AUTH_SECRET: "dev-secret-at-least-16-chars",
    });
    expect(res.success).toBe(false);
  });

  it("rejects an AUTH_SECRET that is too short", () => {
    const res = parseEnv({
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      AUTH_SECRET: "short",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/AUTH_SECRET/);
    }
  });

  it("rejects the default .env.example secret in production", () => {
    const res = parseEnv({
      ...VALID_PROD,
      AUTH_SECRET: "change-me-to-a-32-char-random-string-please-xxxxxxxx",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/AUTH_SECRET/);
    }
  });

  it("tolerates the default secret in development", () => {
    const res = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      AUTH_SECRET: "change-me-but-long-enough-16",
    });
    expect(res.success).toBe(true);
  });

  it("requires RESEND_API_KEY in production", () => {
    const res = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: VALID_PROD.DATABASE_URL,
      AUTH_SECRET: VALID_PROD.AUTH_SECRET,
      APP_URL: VALID_PROD.APP_URL,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/RESEND_API_KEY/);
    }
  });

  it("requires an https APP_URL (not localhost) in production", () => {
    const res = parseEnv({ ...VALID_PROD, APP_URL: "http://localhost:3000" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/APP_URL/);
    }
  });

  it("rejects the email verification bypass in production", () => {
    const res = parseEnv({ ...VALID_PROD, AUTH_ALLOW_UNVERIFIED_LOGIN: "true" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/AUTH_ALLOW_UNVERIFIED_LOGIN/);
    }
  });

  it("tolerates the email verification bypass in development", () => {
    const res = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      AUTH_SECRET: "dev-secret-at-least-16-chars",
      AUTH_ALLOW_UNVERIFIED_LOGIN: "true",
    });
    expect(res.success).toBe(true);
  });
});
