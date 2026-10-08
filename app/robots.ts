import type { MetadataRoute } from "next";

import {
  NON_INDEXABLE_PREFIXES,
  PROTECTED_PREFIXES,
  PUBLIC_TRIAL_ROUTES,
} from "@/lib/public-routes";

/**
 * Les listes viennent de `lib/public-routes.ts`, comme pour `proxy.ts` : une
 * section protégée déclarée là-bas est interdite ici. Le chapitre d'essai reste
 * explorable car son chemin est plus long que `/learn`, et Google applique la
 * règle la plus spécifique.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...PUBLIC_TRIAL_ROUTES],
        // Sans slash final, `Disallow: /dashboard` couvre aussi la route
        // exacte, qui redirige vers /login.
        disallow: [...PROTECTED_PREFIXES, ...NON_INDEXABLE_PREFIXES],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
