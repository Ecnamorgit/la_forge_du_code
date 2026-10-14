import "server-only";

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

import { logger } from "@/lib/logger";

/**
 * Fixed-window rate limiter.
 *
 * By default, counters live in process memory, which is enough for a single
 * instance (`next start`, VPS, container). If `UPSTASH_REDIS_REST_URL`
 * and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` and `KV_REST_API_TOKEN`,
 * the names used by Vercel's Upstash integration) are set, they are shared via
 * Upstash Redis across all instances; `lib/env.ts` requires this on Vercel.
 *
 * If Redis goes down, we fall back to memory (fail-open) rather than
 * blocking authentication.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Opportunistic sweep, so the table does not grow without bound under attack.
let lastSweep = Date.now();
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Requests still allowed in the window. */
  remaining: number;
  /** Seconds until the window ends (0 if not limited). */
  retryAfter: number;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

function memoryRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: opts.limit - bucket.count, retryAfter: 0 };
}

// Upstash client, created only once if the config is present.
let redis: Redis | null = null;
let redisChecked = false;
function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  // Upstash names, otherwise those of Vercel's Upstash integration, the only
  // ones provided by the production Redis (audit SRV-01).
  const [url, token] =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN]
      : [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN];
  if (url && token) {
    redis = new Redis({ url, token });
    logger.info("rate_limit_backend", { backend: "upstash" });
  }
  return redis;
}

async function redisRateLimit(
  client: Redis,
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const count = await client.incr(redisKey);
  // First call in the window: set the expiry.
  if (count === 1) {
    await client.pexpire(redisKey, opts.windowMs);
  }
  if (count > opts.limit) {
    const ttl = await client.pttl(redisKey);
    const ttlMs = ttl > 0 ? ttl : opts.windowMs;
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil(ttlMs / 1000)) };
  }
  return { ok: true, remaining: opts.limit - count, retryAfter: 0 };
}

export async function rateLimit(
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const client = getRedis();
  if (client) {
    try {
      return await redisRateLimit(client, key, opts);
    } catch (err) {
      // Fail-open: do not block the user if Redis is unreachable.
      logger.warn("rate_limit_redis_error_fallback_memory", {
        message: err instanceof Error ? err.message : String(err),
      });
      return memoryRateLimit(key, opts);
    }
  }
  return memoryRateLimit(key, opts);
}

/**
 * Tells whether `key` has already hit its limit, without counting an attempt.
 * Used when only failures count (lib/login-guard.ts): check before the action,
 * count after a failure.
 */
export async function isRateLimited(key: string, opts: RateLimitOptions): Promise<boolean> {
  const client = getRedis();
  if (client) {
    try {
      const count = await client.get<number>(`rl:${key}`);
      return count !== null && Number(count) >= opts.limit;
    } catch (err) {
      logger.warn("rate_limit_redis_error_fallback_memory", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  const bucket = store.get(key);
  return !!bucket && bucket.resetAt > Date.now() && bucket.count >= opts.limit;
}

/**
 * Client IP derived from proxy headers, resistant to spoofing.
 *
 * In `X-Forwarded-For` (`client, proxy1, proxy2, …`), the client controls the
 * leftmost entries: taking the first one would let an attacker change the
 * rate-limit key on every request. We take the entry added by our
 * infrastructure, the `TRUSTED_PROXY_HOPS`-th from the right (1 by default,
 * correct for Vercel and a single reverse proxy).
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      const parsed = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "", 10);
      const hops = Math.min(
        Math.max(Number.isFinite(parsed) ? parsed : 1, 1),
        parts.length
      );
      return parts[parts.length - hops]!;
    }
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** 429 response with the Retry-After header. */
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: `Trop de tentatives. Reessaie dans ${retryAfter}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
