import { describe, it, expect } from "vitest";

import { parseEnv } from "./env";

/**
 * Audit SRV-01: on Vercel, rate limiting only makes sense when shared
 * across serverless instances. The requirement applies to Vercel (`VERCEL=1`)
 * and not to every production setup: a single-instance `next start` counts
 * correctly in memory.
 */

const PRODUCTION = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://utilisateur:secret@hote:5432/base",
  AUTH_SECRET: "un-secret-de-production-assez-long-1234",
  APP_URL: "https://www.laforgeducode.fr",
  RESEND_API_KEY: "re_exemple",
};

const VERCEL = { ...PRODUCTION, VERCEL: "1" };

describe("configuration: Redis on Vercel", () => {
  it("refuses to start on Vercel in production without Redis", () => {
    expect(parseEnv(VERCEL).success).toBe(false);
  });

  it("accepts the variables from Vercel's Upstash integration", () => {
    const env = { ...VERCEL, KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" };
    expect(parseEnv(env).success).toBe(true);
  });

  it("accepts the UPSTASH_REDIS_REST_* names", () => {
    const env = {
      ...VERCEL,
      UPSTASH_REDIS_REST_URL: "https://x.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "t",
    };
    expect(parseEnv(env).success).toBe(true);
  });

  it("does not require Redis outside Vercel (single instance, CI)", () => {
    expect(parseEnv(PRODUCTION).success).toBe(true);
  });
});
