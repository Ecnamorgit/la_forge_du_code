import type { MetadataRoute } from "next";

import { INDEXABLE_ROUTES } from "@/lib/public-routes";

/**
 * Sitemap des pages publiques.
 *
 * La liste vient de `lib/public-routes.ts` pour qu'elle ne puisse pas dériver
 * de l'allowlist du middleware : une page déclarée ici mais protégée là-bas
 * ferait explorer un crawler contre une redirection vers /login.
 *
 * `changeFrequency` et `priority` sont des indications, pas des ordres — les
 * moteurs s'en servent peu. Ce qui compte est la présence des URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: new URL(route, base).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
