import type { Instrumentation } from "next";

import { logger } from "./lib/logger";

/**
 * Appelé une fois au démarrage de chaque instance serveur : valide
 * l'environnement, puis initialise Sentry si `SENTRY_DSN` est défini. L'import
 * dynamique laisse Sentry hors du bundle tant qu'il n'est pas configuré.
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
 * Erreurs serveur non gérées : journal structuré, et Sentry s'il est
 * configuré. Aucune donnée personnelle n'est journalisée.
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
