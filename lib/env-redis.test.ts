import { describe, it, expect } from "vitest";

import { parseEnv } from "./env";

/**
 * Constat SRV-01 de l'audit de sécurité du 2026-09-12 : rien n'empêchait de
 * déployer sur Vercel sans Redis, alors que la limitation de débit n'y a de
 * sens que partagée entre les instances serverless.
 *
 * L'exigence porte sur Vercel (`VERCEL=1`), pas sur toute production : un
 * `next start` sur une seule instance (CI, serveur unique) compte juste en
 * mémoire, et n'a pas besoin de Redis.
 */

const PRODUCTION = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://utilisateur:secret@hote:5432/base",
  AUTH_SECRET: "un-secret-de-production-assez-long-1234",
  APP_URL: "https://www.laforgeducode.fr",
  RESEND_API_KEY: "re_exemple",
};

const VERCEL = { ...PRODUCTION, VERCEL: "1" };

describe("configuration : Redis sur Vercel", () => {
  it("refuse de démarrer sur Vercel en production sans Redis", () => {
    expect(parseEnv(VERCEL).success).toBe(false);
  });

  it("accepte les variables de l'intégration Upstash de Vercel", () => {
    const env = { ...VERCEL, KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" };
    expect(parseEnv(env).success).toBe(true);
  });

  it("accepte les noms UPSTASH_REDIS_REST_*", () => {
    const env = {
      ...VERCEL,
      UPSTASH_REDIS_REST_URL: "https://x.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "t",
    };
    expect(parseEnv(env).success).toBe(true);
  });

  it("n'exige pas Redis hors de Vercel (instance unique, CI)", () => {
    expect(parseEnv(PRODUCTION).success).toBe(true);
  });
});
