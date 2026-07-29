/**
 * Les exceptions au mur d'authentification.
 *
 * Un visiteur non connecté peut atteindre exactement ces chemins dans /learn.
 * Le reste est protégé par `proxy.ts`.
 */

/** Cursus et chapitre ouverts à l'essai. */
export const TRIAL_COURSE = "html";
export const TRIAL_CHAPTER = "chapitre-1";

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}/${TRIAL_CHAPTER}`,
];

/**
 * Égalité exacte, jamais `startsWith`.
 *
 * Avec un match par préfixe, "/learn/html/chapitre-1" ouvrirait aussi
 * "chapitre-10" le jour où HTML dépassera 9 chapitres — CSS en a déjà 10,
 * JavaScript 12. Le bug serait silencieux et n'apparaîtrait qu'à l'ajout
 * d'un chapitre, des mois plus tard.
 */
export function isPublicRoute(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PUBLIC_TRIAL_ROUTES.includes(normalized);
}

/**
 * Préfixes derrière le mur d'authentification.
 *
 * Consommé par `proxy.ts` (qui redirige) ET par `app/robots.ts` (qui interdit
 * l'exploration). Une seule liste : sans ça, ajouter une section protégée
 * laisserait les crawlers y brûler leur budget d'exploration contre des
 * redirections vers /login, sans que rien ne le signale.
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
 * Pages publiques à déclarer au sitemap.
 *
 * Le chapitre d'essai y figure via `PUBLIC_TRIAL_ROUTES` : c'est la brèche
 * volontaire dans `/learn`, et c'est aussi la page qui convertit — elle doit
 * être indexable même si son préfixe est protégé.
 */
export const INDEXABLE_ROUTES: readonly string[] = [
  "/",
  "/codex",
  ...PUBLIC_TRIAL_ROUTES,
];
