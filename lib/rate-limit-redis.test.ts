import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Audit SRV-01: on Vercel, each serverless instance has its own memory, so
 * without a shared Redis the limits are counted per instance.
 * Vercel's Upstash integration provides `KV_REST_API_URL` and
 * `KV_REST_API_TOKEN`, which the limiter must read in addition to the
 * `UPSTASH_REDIS_REST_*` names.
 */

const createdClients = vi.hoisted(() => [] as unknown[]);

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(config: unknown) {
      createdClients.push(config);
    }
    incr = async () => 1;
    pexpire = async () => 1;
    pttl = async () => 1000;
    get = async () => null;
  },
}));

const VARIABLES = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
] as const;

describe("rate limiter: shared Redis", () => {
  const saved: Partial<Record<(typeof VARIABLES)[number], string>> = {};

  beforeEach(() => {
    // The limiter caches its config on the first call: fresh module.
    vi.resetModules();
    createdClients.length = 0;
    for (const v of VARIABLES) {
      saved[v] = process.env[v];
      delete process.env[v];
    }
  });

  afterEach(() => {
    for (const v of VARIABLES) {
      if (saved[v] === undefined) delete process.env[v];
      else process.env[v] = saved[v];
    }
  });

  it("uses the Redis from the Vercel integration (KV_REST_API_*)", async () => {
    process.env.KV_REST_API_URL = "https://exemple.upstash.io";
    process.env.KV_REST_API_TOKEN = "jeton-kv";
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(createdClients).toEqual([{ url: "https://exemple.upstash.io", token: "jeton-kv" }]);
  });

  it("still uses the UPSTASH_REDIS_REST_* names", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://autre.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "jeton-upstash";
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(createdClients).toEqual([{ url: "https://autre.upstash.io", token: "jeton-upstash" }]);
  });

  it("stays in memory without any Redis variable", async () => {
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(createdClients).toEqual([]);
  });
});
