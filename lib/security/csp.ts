/**
 * Content-Security-Policy de l'application, à nonce (constat EXE-03).
 *
 * Historique : le code des apprenants s'exécutait dans des `srcdoc`, qui
 * héritent de la CSP du parent ; `script-src` devait donc porter
 * `'unsafe-inline'` et `'unsafe-eval'` pour TOUT le site. Désormais les trois
 * exécuteurs (React, JavaScript, HTML) sont servis depuis une origine dédiée
 * (`/bac-a-sable*`, `lib/sandbox/sandbox-response.ts`), qui porte seule sa CSP
 * permissive. L'application peut donc passer à un `script-src` **sans**
 * `'unsafe-inline'` ni `'unsafe-eval'` : nonce + `'strict-dynamic'`.
 *
 * La politique est **par requête** (le nonce est unique à chaque requête) :
 * elle est posée par `proxy.ts`, qui génère le nonce, et Next l'applique à ses
 * scripts d'amorçage/hydratation. Conséquence : les pages sont rendues
 * dynamiquement (cf. `app/layout.tsx`, `force-dynamic`).
 *
 * `csp.test.ts` verrouille les invariants de sécurité de `script-src`.
 */

/** Options de construction de la politique. */
export interface CspOptions {
  /** Nonce unique de la requête, injecté dans `script-src`. */
  nonce: string;
  /**
   * En développement, React utilise `eval` pour ses messages de débogage :
   * `'unsafe-eval'` est alors requis. Jamais en production.
   */
  isDev?: boolean;
  /**
   * Origine des documents du bac à sable (constat EXE-03), la seule autorisée
   * dans `frame-src` : ils sont servis depuis une AUTRE origine que
   * l'application. Dérivée de la requête par `sandboxOriginFor`
   * (`lib/sandbox/sandbox-origin.ts`) : le sous-domaine dédié en production,
   * l'autre hôte local en développement et en CI — jamais les deux à la fois,
   * pour ne pas laisser des origines de développement dans la politique livrée.
   */
  sandboxOrigin: string;
}

/**
 * Jetons de `script-src` sans lesquels des fonctionnalités entières cessent de
 * marcher, vérifiés par `csp.test.ts` :
 * - `'nonce-…'`         : les scripts d'amorçage/hydratation de Next, marqués
 *                         par Next avec ce nonce.
 * - `'strict-dynamic'`  : les scripts chargés PAR un script de confiance (le
 *                         loader Monaco, injecté par le bundle nonce) héritent
 *                         de sa confiance, sans nonce propre.
 * - `'wasm-unsafe-eval'`: sql.js (WebAssembly) instancié dans un Worker de
 *                         l'app (constat EXE-02). N'autorise que la WASM, pas
 *                         `eval`.
 * - `'self'`            : repli pour les navigateurs sans `'strict-dynamic'`
 *                         (CSP 2), ignoré par les navigateurs CSP 3.
 *
 * Ce qui doit en être ABSENT en production : `'unsafe-inline'` et
 * `'unsafe-eval'` — le cœur du constat EXE-03.
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
    // Les styles restent en `'unsafe-inline'` : le risque XSS par style est
    // marginal, et de nombreux composants posent des styles en ligne. Le
    // constat EXE-03 vise `script-src`, pas `style-src`.
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
 * Les tokens d'une directive, sans son nom. Tableau vide si elle est absente.
 *
 * Nécessaire parce que plusieurs directives partagent des tokens :
 * `'unsafe-inline'` est dans `style-src` ; chercher un token dans la chaîne
 * entière laisserait passer sa présence dans `script-src`.
 */
export function tokensDeDirective(directives: string[], nom: string): string[] {
  const directive = directives.find((d) => d === nom || d.startsWith(`${nom} `));
  if (directive === undefined) return [];
  return directive.split(/\s+/).slice(1);
}
