import type { MetadataRoute } from "next";

import { INDEXABLE_ROUTES } from "@/lib/public-routes";

/**
 * Pages publiques, tirées de `lib/public-routes.ts` comme les règles du proxy,
 * pour ne jamais lister une page qui redirige vers /login.
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
