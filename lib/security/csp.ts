/**
 * Content-Security-Policy de l'application, à nonce (audit EXE-03).
 *
 * Le code des apprenants s'exécute depuis une origine dédiée (`/bac-a-sable*`,
 * voir `lib/sandbox/sandbox-response.ts`) qui porte seule sa CSP permissive :
 * le `script-src` de l'application se passe donc de `'unsafe-inline'` et de
 * `'unsafe-eval'`.
 *
 * La politique change à chaque requête : `proxy.ts` génère le nonce et pose
 * l'en-tête, et Next l'applique à ses scripts d'amorçage. Les pages sont donc
 * rendues dynamiquement (`force-dynamic` dans `app/layout.tsx`).
 */

/** Options de construction de la politique. */
export interface CspOptions {
  /** Nonce unique de la requête, injecté dans `script-src`. */
  nonce: string;
  /**
   * Ajoute `'unsafe-eval'`, que React utilise en développement pour ses
   * messages de débogage. Jamais en production.
   */
  isDev?: boolean;
  /**
   * Origine des documents du bac à sable, seule autorisée dans `frame-src` en
   * plus de `'self'`. Dérivée de la requête par `sandboxOriginFor` : le
   * sous-domaine dédié en production, l'autre hôte local en développement et
   * en CI, jamais les deux, pour ne livrer aucune origine de développement.
   */
  sandboxOrigin: string;
}

/**
 * Directive `script-src`, vérifiée par `csp.test.ts`. Le nonce couvre les
 * scripts d'amorçage de Next ; `'strict-dynamic'` étend leur confiance aux
 * scripts qu'ils chargent (le loader Monaco) ; `'wasm-unsafe-eval'` permet à
 * sql.js d'instancier sa WebAssembly sans autoriser `eval` ; `'self'` sert de
 * repli aux navigateurs sans `'strict-dynamic'`.
 *
 * `'unsafe-inline'` et `'unsafe-eval'` doivent en être absents en production.
 */
export function scriptSrc({ nonce, isDev = false }: CspOptions): string {
  return [
    "script-src",
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'wasm-unsafe-eval'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");
}

/** Les directives, dans l'ordre d'émission. */
export function cspDirectives(options: CspOptions): string[] {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // `'unsafe-inline'` reste toléré pour les styles : beaucoup de composants
    // posent des styles en ligne, et le risque XSS y est marginal.
    "style-src 'self' 'unsafe-inline'",
    scriptSrc(options),
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    // Les aperçus (React, JS, HTML) sont encadrés depuis l'origine dédiée.
    `frame-src 'self' ${options.sandboxOrigin}`,
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];
}

/** La valeur de l'en-tête `Content-Security-Policy` pour une requête. */
export function buildCsp(options: CspOptions): string {
  return cspDirectives(options).join("; ");
}

/**
 * Jetons d'une directive, sans son nom (tableau vide si elle est absente).
 * Chercher dans la chaîne entière confondrait les directives :
 * `'unsafe-inline'` figure dans `style-src`.
 */
export function tokensDeDirective(directives: string[], nom: string): string[] {
  const directive = directives.find((d) => d === nom || d.startsWith(`${nom} `));
  if (directive === undefined) return [];
  return directive.split(/\s+/).slice(1);
}
