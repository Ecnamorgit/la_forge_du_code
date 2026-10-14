import type { MetadataRoute } from "next";

import { INDEXABLE_ROUTES } from "@/lib/public-routes";

/**
 * Public pages, taken from `lib/public-routes.ts` like the proxy rules,
 * so a page that redirects to /login is never listed.
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
