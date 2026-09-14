import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Constat SRV-01 de l'audit de sécurité du 2026-09-12 : la limitation de débit
 * restait en mémoire en production.
 *
 * Sur Vercel, chaque instance serverless a sa propre mémoire : sans Redis
 * partagé, les limites (connexion, inscription, e-mails) se comptent instance
 * par instance, et un attaquant qui répartit ses requêtes les dépasse
 * largement. Le Redis créé le 2026-09-14 par l'intégration Upstash de Vercel
 * fournit `KV_REST_API_URL` et `KV_REST_API_TOKEN`, alors que le limiteur ne
 * lisait que `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` : il
 * serait resté en mémoire, Redis configuré ou non.
 */

const clientsCrees = vi.hoisted(() => [] as unknown[]);

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(config: unknown) {
      clientsCrees.push(config);
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

describe("limiteur de débit : Redis partagé", () => {
  const sauvegarde: Partial<Record<(typeof VARIABLES)[number], string>> = {};

  beforeEach(() => {
    // Le limiteur mémorise sa configuration au premier appel : module neuf.
    vi.resetModules();
    clientsCrees.length = 0;
    for (const v of VARIABLES) {
      sauvegarde[v] = process.env[v];
      delete process.env[v];
    }
  });

  afterEach(() => {
    for (const v of VARIABLES) {
      if (sauvegarde[v] === undefined) delete process.env[v];
      else process.env[v] = sauvegarde[v];
    }
  });

  it("utilise le Redis de l'intégration Vercel (KV_REST_API_*)", async () => {
    process.env.KV_REST_API_URL = "https://exemple.upstash.io";
    process.env.KV_REST_API_TOKEN = "jeton-kv";
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(clientsCrees).toEqual([{ url: "https://exemple.upstash.io", token: "jeton-kv" }]);
  });

  it("utilise toujours les noms UPSTASH_REDIS_REST_*", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://autre.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "jeton-upstash";
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(clientsCrees).toEqual([{ url: "https://autre.upstash.io", token: "jeton-upstash" }]);
  });

  it("reste en mémoire sans aucune variable Redis", async () => {
    const { rateLimit } = await import("./rate-limit");
    await rateLimit("srv01", { limit: 5, windowMs: 1000 });
    expect(clientsCrees).toEqual([]);
  });
});
