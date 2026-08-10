/**
 * Content-Security-Policy de l'application.
 *
 * Extraite de `next.config.ts` pour devenir importable : la politique est un
 * contrat dont l'aperçu React et le sandbox JavaScript dépendent pour exister,
 * et rien ne le gardait. `csp.test.ts` s'en charge désormais.
 *
 * Réglée pour les besoins d'exécution de cette app :
 * - Monaco est auto-hébergé depuis /public/monaco (CF-16), donc tout charge
 *   depuis 'self'. Son tokenizer tourne dans des workers blob:.
 * - Next injecte des scripts inline de bootstrap/hydratation et Tailwind des
 *   styles inline, d'où 'unsafe-inline'.
 *
 * Cf. docs/BRIEF_CSP_GARDE_FOU.md avant toute modification de script-src, et
 * le ticket CF-15 de docs/ROADMAP.md pour ce qui a été mesuré le 2026-08-06 :
 * Monaco n'a PAS besoin d''unsafe-eval' (une version antérieure de ce
 * commentaire l'affirmait à tort) — seuls les `srcdoc` en dépendent.
 */

/**
 * Tokens de `script-src` sans lesquels des fonctionnalités entières cessent de
 * marcher. Chaque entrée est vérifiée par `csp.test.ts`.
 *
 * - `'self'`         : l'iframe d'aperçu charge /react-runtime/runtime.js depuis
 *                      l'origine du parent, par URL absolue (dans un document
 *                      srcdoc la base est `about:srcdoc`, une URL relative ne
 *                      résout rien).
 * - `'unsafe-inline'`: les scripts inline de Next (bootstrap, hydratation), et
 *                      le <script> inline du srcdoc — tout le programme de
 *                      l'iframe. Sans lui, Monaco ne charge meme plus.
 * - `'unsafe-eval'`  : `new Function` dans le srcdoc ET dans
 *                      lib/sandbox/run-js.ts. **Monaco n'en a pas besoin** —
 *                      mesure du 2026-08-06, cf. CF-15 dans docs/ROADMAP.md.
 */
export const SCRIPT_SRC_REQUIS = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
] as const;

/** Les directives, dans l'ordre d'émission. */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' blob:",
  "form-action 'self'",
  "upgrade-insecure-requests",
] as const;

/** La valeur de l'en-tête `Content-Security-Policy`. */
export const csp = CSP_DIRECTIVES.join("; ");

/**
 * Les tokens d'une directive, sans son nom. Tableau vide si elle est absente.
 *
 * Nécessaire parce que plusieurs directives partagent des tokens :
 * `'unsafe-inline'` est dans `script-src` ET dans `style-src`. Chercher un
 * token dans la chaîne entière laisserait passer son retrait de `script-src`.
 */
export function tokensDeDirective(nom: string): string[] {
  const directive = CSP_DIRECTIVES.find(
    (d) => d === nom || d.startsWith(`${nom} `)
  );

  if (directive === undefined) return [];

  return directive.split(/\s+/).slice(1);
}
