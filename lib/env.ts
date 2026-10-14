import { z } from "zod";

/**
 * Environment variable validation, run once at server startup
 * (`instrumentation.ts`), to fail right away with a clear message
 * rather than on the first call (database, email, verification link).
 *
 * `parseEnv` is pure; `validateEnv` applies it to `process.env` and throws a
 * formatted error.
 */

type RawEnv = Record<string, string | undefined>;

function looksLikeUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

// Fragments found in the sample secret from `.env.example`. If they show up
// in production, the secret was never regenerated.
const PLACEHOLDER_SECRET_FRAGMENTS = ["change-me", "xxxxxxxx"];

const baseSchema = z.object({
  DATABASE_URL: z
    .string({ message: "DATABASE_URL manquante" })
    .min(1, "DATABASE_URL manquante")
    .refine(
      (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
      "DATABASE_URL doit être une URL PostgreSQL (postgres://… ou postgresql://…)"
    ),
  AUTH_SECRET: z
    .string({ message: "AUTH_SECRET manquante" })
    .min(16, "AUTH_SECRET doit faire au moins 16 caractères (génère-le avec `openssl rand -base64 32`)"),
  APP_URL: z
    .string()
    .refine(looksLikeUrl, "APP_URL doit être une URL valide")
    .optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  AUTH_TRUST_HOST: z.string().optional(),
  // Test-only bypass: allows login without a verified email.
  // Rejected in production (see `buildSchema`).
  AUTH_ALLOW_UNVERIFIED_LOGIN: z.string().optional(),
  // Number of trusted proxies in front of the app, used to derive the client
  // IP from X-Forwarded-For (see `getClientIp`). Default 1.
  TRUSTED_PROXY_HOPS: z
    .string()
    .refine((v) => /^\d+$/.test(v) && Number.parseInt(v, 10) >= 1, {
      message: "TRUSTED_PROXY_HOPS doit être un entier >= 1",
    })
    .optional(),
  // Shared Redis for the rate limiter (lib/rate-limit.ts): Upstash names,
  // or those from Vercel's Upstash integration.
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  // Set by Vercel ("1") on its deployments.
  VERCEL: z.string().optional(),
});

export type AppEnv = z.infer<typeof baseSchema>;

/**
 * Builds the schema with environment-specific rules. Production requires
 * a real secret, email sending, a public HTTPS URL and, on Vercel, a
 * shared Redis.
 */
function buildSchema(nodeEnv: string) {
  const isProd = nodeEnv === "production";

  return baseSchema.superRefine((env, ctx) => {
    if (isProd) {
      if (env.AUTH_ALLOW_UNVERIFIED_LOGIN === "true") {
        ctx.addIssue({
          code: "custom",
          path: ["AUTH_ALLOW_UNVERIFIED_LOGIN"],
          message:
            "AUTH_ALLOW_UNVERIFIED_LOGIN=true est interdit en production : la vérification d'email doit rester obligatoire",
        });
      }

      if (PLACEHOLDER_SECRET_FRAGMENTS.some((f) => env.AUTH_SECRET.includes(f))) {
        ctx.addIssue({
          code: "custom",
          path: ["AUTH_SECRET"],
          message:
            "AUTH_SECRET utilise encore la valeur d'exemple du .env.example — génère un secret unique pour la production",
        });
      }

      // On Vercel, each serverless instance counts in memory: without a shared
      // Redis, rate limiting has no effect (audit SRV-01). Outside
      // Vercel (single instance, CI), memory is enough.
      const redis =
        (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) ||
        (env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
      if (env.VERCEL === "1" && !redis) {
        ctx.addIssue({
          code: "custom",
          path: ["KV_REST_API_URL"],
          message:
            "Redis (Upstash) est requis sur Vercel : relie la base Upstash au projet (KV_REST_API_URL / KV_REST_API_TOKEN). Sans lui, la limitation de débit est comptée par instance et reste sans effet",
        });
      }

      if (!env.RESEND_API_KEY) {
        ctx.addIssue({
          code: "custom",
          path: ["RESEND_API_KEY"],
          message: "RESEND_API_KEY est requise en production (envoi des emails transactionnels)",
        });
      }

      if (!env.APP_URL) {
        ctx.addIssue({
          code: "custom",
          path: ["APP_URL"],
          message: "APP_URL est requise en production (liens de vérification / reset)",
        });
      } else if (!env.APP_URL.startsWith("https://")) {
        ctx.addIssue({
          code: "custom",
          path: ["APP_URL"],
          message: "APP_URL doit être en https:// en production",
        });
      } else if (env.APP_URL.includes("localhost")) {
        ctx.addIssue({
          code: "custom",
          path: ["APP_URL"],
          message: "APP_URL ne doit pas pointer vers localhost en production",
        });
      }
    }
  });
}

export type ParseEnvResult =
  | { success: true; data: AppEnv }
  | { success: true; data: AppEnv; warnings: string[] }
  | { success: false; errors: string[] };

/**
 * Validates a raw environment object. Pure: does not read `process.env` and
 * does not throw. `NODE_ENV` drives the strict rules.
 */
export function parseEnv(raw: RawEnv): ParseEnvResult {
  const nodeEnv = raw.NODE_ENV ?? "development";
  const result = buildSchema(nodeEnv).safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map(
      (i) => `${i.path.join(".") || "(racine)"}: ${i.message}`
    );
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * Validates `process.env` and throws an explicit error if the configuration is
 * invalid. Called at server startup.
 */
export function validateEnv(raw: RawEnv = process.env): AppEnv {
  const result = parseEnv(raw);
  if (!result.success) {
    const details = result.errors.map((e) => `  - ${e}`).join("\n");
    throw new Error(
      `Configuration d'environnement invalide. Corrige ton .env :\n${details}`
    );
  }
  return result.data;
}
