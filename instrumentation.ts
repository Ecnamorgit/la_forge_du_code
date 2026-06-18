/**
 * Hook d'instrumentation Next.js : `register()` est appelé une seule fois au
 * démarrage de chaque instance serveur, avant de servir la moindre requête.
 *
 * On s'en sert pour valider la configuration d'environnement « fail-fast » :
 * si une variable critique manque ou est mal réglée, le serveur refuse de
 * démarrer avec un message explicite, au lieu de planter au premier appel DB
 * ou au premier envoi d'email.
 *
 * Limité au runtime Node.js : le runtime Edge (middleware) n'utilise ni Prisma
 * ni Resend, et l'import de la validation y est inutile.
 */
import type { Instrumentation } from "next";

import { logger } from "./lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}

/**
 * Capture centralisée des erreurs serveur non gérées (Server Components, Route
 * Handlers, Server Actions). Logge un évènement structuré exploitable sans
 * exposer de PII. Point d'accroche idéal pour brancher Sentry plus tard (CF-10).
 */
export const onRequestError: Instrumentation.onRequestError = (
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
};
