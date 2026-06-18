import type { Instrumentation } from "next";

import { logger } from "./lib/logger";

/**
 * Hook d'instrumentation Next.js : `register()` est appelé une seule fois au
 * démarrage de chaque instance serveur, avant de servir la moindre requête.
 *
 * - Validation fail-fast de la configuration d'environnement (CF-3).
 * - Initialisation optionnelle de Sentry (CF-10) si `SENTRY_DSN` est défini —
 *   import dynamique pour rester totalement inerte (build + bundle) tant que le
 *   monitoring n'est pas configuré.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }

  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    });
  }
}

/**
 * Capture centralisée des erreurs serveur non gérées (Server Components, Route
 * Handlers, Server Actions). Logge un évènement structuré (CF-9) et, si Sentry
 * est configuré, le remonte au monitoring (CF-10). Aucune PII exposée.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  logger.error("unhandled_request_error", {
    message: err instanceof Error ? err.message : String(err),
    digest: (err as { digest?: string })?.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });

  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(err, request, context);
  }
};
