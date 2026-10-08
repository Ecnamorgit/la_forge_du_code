import { z } from "zod";

/**
 * Validation des variables d'environnement, exécutée une fois au démarrage du
 * serveur (`instrumentation.ts`), pour échouer tout de suite avec un message
 * clair plutôt qu'au premier appel (base, e-mail, lien de vérification).
 *
 * `parseEnv` est pur ; `validateEnv` l'applique à `process.env` et lève une
 * erreur formatée.
 */

type RawEnv = Record<string, string | undefined>;

function looksLikeUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

// Fragments présents dans le secret d'exemple du `.env.example`. Si on les
// retrouve en production, c'est que le secret n'a jamais été régénéré.
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
  // Bypass de test uniquement : autorise la connexion sans email vérifié.
  // Refusé en production (voir `buildSchema`).
  AUTH_ALLOW_UNVERIFIED_LOGIN: z.string().optional(),
  // Nombre de proxys de confiance devant l'application, pour dériver l'IP
  // client de X-Forwarded-For (voir `getClientIp`). Défaut 1.
  TRUSTED_PROXY_HOPS: z
    .string()
    .refine((v) => /^\d+$/.test(v) && Number.parseInt(v, 10) >= 1, {
      message: "TRUSTED_PROXY_HOPS doit être un entier >= 1",
    })
    .optional(),
  // Redis partagé du limiteur de débit (lib/rate-limit.ts) : noms d'Upstash,
  // ou ceux de l'intégration Upstash de Vercel.
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  // Posée par Vercel ("1") sur ses déploiements.
  VERCEL: z.string().optional(),
});

export type AppEnv = z.infer<typeof baseSchema>;

/**
 * Construit le schéma avec les règles propres à l'environnement. La production
 * exige un vrai secret, l'envoi d'e-mails, une URL publique en HTTPS et, sur
 * Vercel, un Redis partagé.
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

      // Sur Vercel, chaque instance serverless compte en mémoire : sans Redis
      // partagé, la limitation de débit est sans effet (audit SRV-01). Hors de
      // Vercel (instance unique, CI), la mémoire suffit.
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
 * Valide un objet d'environnement brut. Pur : ne lit pas `process.env` et ne
 * lève pas. `NODE_ENV` pilote les règles strictes.
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
 * Valide `process.env` et lève une erreur explicite si la configuration est
 * invalide. Appelée au démarrage du serveur.
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
