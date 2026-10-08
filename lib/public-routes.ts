/**
 * Routes publiques et protégées. Dans /learn, un visiteur non connecté
 * n'atteint que les chemins d'essai ; le reste est protégé par `proxy.ts`.
 */

/** Cursus ouvert à l'essai. */
export const TRIAL_COURSE = "html";

/** Chapitres ouverts à l'essai, dans l'ordre du cursus. */
export const TRIAL_CHAPTERS: readonly string[] = [
  "chapitre-1",
  "chapitre-2",
  "chapitre-3",
];

/** Dernier chapitre d'essai : fin de l'essai, moment de la conversion. */
export const TRIAL_LAST_CHAPTER = TRIAL_CHAPTERS[TRIAL_CHAPTERS.length - 1];

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}`,
  ...TRIAL_CHAPTERS.map((c) => `/learn/${TRIAL_COURSE}/${c}`),
];

/**
 * Égalité exacte, jamais `startsWith` : un match par préfixe ouvrirait aussi
 * "chapitre-10" dès que le cursus HTML dépasserait neuf chapitres.
 */
export function isPublicRoute(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PUBLIC_TRIAL_ROUTES.includes(normalized);
}

/**
 * Préfixes derrière le mur d'authentification, lus par `proxy.ts`
 * (redirection) et `app/robots.ts` (exploration interdite). Une seule liste,
 * pour qu'une nouvelle section protégée soit aussi exclue de l'exploration.
 */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/dashboard",
  "/learn",
  "/profil",
  "/leaderboard",
  "/avatar",
];

/**
 * Chemins sensibles ou sans valeur d'indexation : jetons à usage unique,
 * formulaires, routes d'API. Interdits à l'exploration en plus des préfixes
 * protégés.
 */
export const NON_INDEXABLE_PREFIXES: readonly string[] = [
  "/api",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "/share",
];

/**
 * Pages publiques déclarées au sitemap. Les pages d'essai y figurent via
 * `PUBLIC_TRIAL_ROUTES` : seule ouverture dans `/learn`, ce sont aussi elles
 * qui convertissent.
 */
export const INDEXABLE_ROUTES: readonly string[] = [
  "/",
  "/codex",
  ...PUBLIC_TRIAL_ROUTES,
];
