import "server-only";

import { NextResponse } from "next/server";

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Keyed by an arbitrary string (typically `${scope}:${ip}`). Zero dependencies,
 * which makes it ideal for a single long-running Node instance (`next start`,
 * a VPS, a container).
 *
 * ⚠️ Production caveat: the store lives in process memory. On a horizontally
 * scaled / serverless deployment (e.g. Vercel functions), each instance keeps
 * its own counters, so the effective limit is multiplied by the number of live
 * instances. For strict guarantees across instances, back this with a shared
 * store (Upstash Redis, or a Postgres table) — the public API below can stay
 * identical. For this app's scale it already blunts brute-force and email spam.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow unbounded under attack.
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
  /** Remaining allowed requests in the current window. */
  remaining: number;
  /** Seconds until the window resets (0 when not limited). */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): RateLimitResult {
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

/**
 * Best-effort client IP from proxy headers. Behind Vercel / a reverse proxy,
 * `x-forwarded-for` holds the real client IP as its first entry.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: `Trop de tentatives. Reessaie dans ${retryAfter}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
