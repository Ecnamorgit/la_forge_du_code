import "server-only";

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

import { logger } from "@/lib/logger";

/**
 * Limiteur de débit à fenêtre fixe, enfichable.
 *
 * - **Par défaut** : compteurs en mémoire process. Parfait pour une instance
 *   unique (`next start`, VPS, conteneur), zéro dépendance.
 * - **Multi-instance / serverless** : si `UPSTASH_REDIS_REST_URL` +
 *   `UPSTASH_REDIS_REST_TOKEN` sont définis, les compteurs sont partagés via
 *   Upstash Redis, donc la limite est respectée à travers toutes les instances.
 *
 * L'API publique (`rateLimit`) est asynchrone dans les deux cas. En cas de panne
 * Redis, on bascule en mémoire (fail-open) plutôt que de bloquer l'auth.
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

// Upstash client, créé une seule fois si la config est présente.
let redis: Redis | null = null;
let redisChecked = false;
function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
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
  // Premier hit de la fenêtre : poser l'expiration.
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
      // Fail-open : ne pas bloquer l'utilisateur si Redis est injoignable.
      logger.warn("rate_limit_redis_error_fallback_memory", {
        message: err instanceof Error ? err.message : String(err),
      });
      return memoryRateLimit(key, opts);
    }
  }
  return memoryRateLimit(key, opts);
}

/**
 * IP client dérivée des en-têtes de proxy, résistante au spoofing.
 *
 * `X-Forwarded-For` est une liste `client, proxy1, proxy2, …` où le client
 * contrôle les entrées **de gauche** : il peut préfixer une IP arbitraire, que
 * le proxy de confiance se contente d'ajouter à droite. Prendre la première
 * entrée (la plus à gauche) laisse donc un attaquant changer de clé de
 * rate-limit à chaque requête et contourner les throttles de brute-force.
 *
 * On prend au contraire l'entrée ajoutée par notre infra de confiance : la
 * `TRUSTED_PROXY_HOPS`-ième depuis la droite (défaut 1, correct pour Vercel et
 * un reverse-proxy unique). Les hops à gauche de celle-ci sont potentiellement
 * falsifiés et ignorés.
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

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: `Trop de tentatives. Reessaie dans ${retryAfter}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
