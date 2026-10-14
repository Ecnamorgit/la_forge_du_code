import type { MetadataRoute } from "next";

import { INDEXABLE_ROUTES } from "@/lib/public-routes";
import { HOME_IMAGES, siteUrl } from "@/lib/seo";

/**
 * Public pages, taken from `lib/public-routes.ts` like the proxy rules,
 * so a page that redirects to /login is never listed. The landing page also
 * lists its images, for image search.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: new URL(route, base).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
    ...(route === "/" && { images: HOME_IMAGES.map((src) => new URL(src, base).toString()) }),
  }));
}
