import type { MetadataRoute } from "next";

import {
  NON_INDEXABLE_PREFIXES,
  PROTECTED_PREFIXES,
  PUBLIC_TRIAL_ROUTES,
} from "@/lib/public-routes";

/**
 * The lists come from `lib/public-routes.ts`, as for `proxy.ts`: a
 * protected section declared there is disallowed here. The trial chapter stays
 * crawlable because its path is longer than `/learn`, and Google applies the
 * most specific rule.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...PUBLIC_TRIAL_ROUTES],
        // Without a trailing slash, `Disallow: /dashboard` also covers the
        // exact route, which redirects to /login.
        disallow: [...PROTECTED_PREFIXES, ...NON_INDEXABLE_PREFIXES],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
