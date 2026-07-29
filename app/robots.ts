import type { MetadataRoute } from "next";

import {
  NON_INDEXABLE_PREFIXES,
  PROTECTED_PREFIXES,
  PUBLIC_TRIAL_ROUTES,
} from "@/lib/public-routes";

/**
 * robots.txt généré depuis les constantes de routage.
 *
 * Les listes viennent de `lib/public-routes.ts`, la même source que `proxy.ts` :
 * une section protégée ajoutée là-bas devient automatiquement interdite ici.
 *
 * `allow` sur le chapitre d'essai est placé APRÈS le `disallow` de `/learn` et
 * porte sur un chemin plus long : Google applique la règle la plus spécifique,
 * donc l'essai reste explorable alors que le reste du cursus est fermé. Sans
 * cette exception, la page qui convertit serait invisible aux moteurs.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...PUBLIC_TRIAL_ROUTES],
        // Préfixes nus, sans slash final : `Disallow: /dashboard` couvre à la
        // fois `/dashboard` et tout ce qui est dessous. Avec `/dashboard/`, le
        // chemin exact resterait explorable — et c'est une vraie route, qui
        // redirige vers /login.
        disallow: [...PROTECTED_PREFIXES, ...NON_INDEXABLE_PREFIXES],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
