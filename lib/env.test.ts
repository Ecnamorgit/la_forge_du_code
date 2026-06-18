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
  it("accepte une configuration de production complète", () => {
    const res = parseEnv({ ...VALID_PROD });
    expect(res.success).toBe(true);
  });

  it("accepte un dev minimal (secret + DATABASE_URL seulement)", () => {
    const res = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/codeforge",
      AUTH_SECRET: "dev-secret-at-least-16-chars",
    });
    expect(res.success).toBe(true);
  });

  it("rejette une DATABASE_URL absente", () => {
    const res = parseEnv({ AUTH_SECRET: "dev-secret-at-least-16-chars" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/DATABASE_URL/);
    }
  });

  it("rejette une DATABASE_URL non-PostgreSQL", () => {
    const res = parseEnv({
      DATABASE_URL: "mysql://user:pass@localhost:3306/app",
      AUTH_SECRET: "dev-secret-at-least-16-chars",
    });
    expect(res.success).toBe(false);
  });

  it("rejette un AUTH_SECRET trop court", () => {
    const res = parseEnv({
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      AUTH_SECRET: "short",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/AUTH_SECRET/);
    }
  });

  it("rejette le secret par défaut du .env.example en production", () => {
    const res = parseEnv({
      ...VALID_PROD,
      AUTH_SECRET: "change-me-to-a-32-char-random-string-please-xxxxxxxx",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/AUTH_SECRET/);
    }
  });

  it("tolère le secret par défaut en développement", () => {
    const res = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
      AUTH_SECRET: "change-me-but-long-enough-16",
    });
    expect(res.success).toBe(true);
  });

  it("exige RESEND_API_KEY en production", () => {
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

  it("exige une APP_URL https (pas localhost) en production", () => {
    const res = parseEnv({ ...VALID_PROD, APP_URL: "http://localhost:3000" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.errors.join(" ")).toMatch(/APP_URL/);
    }
  });
});
