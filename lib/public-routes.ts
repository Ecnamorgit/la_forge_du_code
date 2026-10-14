/**
 * Public and protected routes. In /learn, a signed-out visitor can only
 * reach the trial paths; the rest is protected by `proxy.ts`.
 */

/** Course open for the trial. */
export const TRIAL_COURSE = "html";

/** Chapters open for the trial, in course order. */
export const TRIAL_CHAPTERS: readonly string[] = [
  "chapitre-1",
  "chapitre-2",
  "chapitre-3",
];

/** Last trial chapter: end of the trial, the moment of conversion. */
export const TRIAL_LAST_CHAPTER = TRIAL_CHAPTERS[TRIAL_CHAPTERS.length - 1];

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}`,
  ...TRIAL_CHAPTERS.map((c) => `/learn/${TRIAL_COURSE}/${c}`),
];

/**
 * Exact equality, never `startsWith`: a prefix match would also open
 * "chapitre-10" as soon as the HTML course had more than nine chapters.
 */
export function isPublicRoute(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PUBLIC_TRIAL_ROUTES.includes(normalized);
}

/**
 * Prefixes behind the authentication wall, read by `proxy.ts`
 * (redirect) and `app/robots.ts` (crawling disallowed). A single list, so
 * that a new protected section is also excluded from crawling.
 */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/dashboard",
  "/learn",
  "/profil",
  "/leaderboard",
  "/avatar",
];

/**
 * Paths that are sensitive or have no indexing value: single-use tokens,
 * forms, API routes. Disallowed for crawling in addition to the protected
 * prefixes.
 */
export const NON_INDEXABLE_PREFIXES: readonly string[] = [
  "/api",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "/share",
];

/**
 * Public pages listed in the sitemap. The trial pages are included via
 * `PUBLIC_TRIAL_ROUTES`: they are the only opening in `/learn`, and also the
 * pages that convert.
 */
export const INDEXABLE_ROUTES: readonly string[] = [
  "/",
  "/codex",
  ...PUBLIC_TRIAL_ROUTES,
];
