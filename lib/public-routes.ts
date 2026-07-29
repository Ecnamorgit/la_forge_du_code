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
