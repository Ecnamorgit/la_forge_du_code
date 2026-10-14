/**
 * The application's nonce-based Content-Security-Policy (audit EXE-03).
 *
 * Learners' code runs from a dedicated origin (`/bac-a-sable*`,
 * see `lib/sandbox/sandbox-response.ts`) which alone carries its permissive CSP:
 * the application's `script-src` can therefore do without `'unsafe-inline'` and
 * `'unsafe-eval'`.
 *
 * The policy changes on every request: `proxy.ts` generates the nonce and sets
 * the header, and Next applies it to its bootstrap scripts. Pages are therefore
 * rendered dynamically (`force-dynamic` in `app/layout.tsx`).
 */

/** Options for building the policy. */
export interface CspOptions {
  /** The request's unique nonce, injected into `script-src`. */
  nonce: string;
  /**
   * Adds `'unsafe-eval'`, which React uses in development for its
   * debugging messages. Never in production.
   */
  isDev?: boolean;
  /**
   * Origin of the sandbox documents, the only one allowed in `frame-src`
   * besides `'self'`. Derived from the request by `sandboxOriginFor`: the
   * dedicated subdomain in production, the other local host in development and
   * in CI, never both, so that no development origin is ever shipped.
   */
  sandboxOrigin: string;
}

/**
 * The `script-src` directive, checked by `csp.test.ts`. The nonce covers
 * Next's bootstrap scripts; `'strict-dynamic'` extends their trust to the
 * scripts they load (the Monaco loader); `'wasm-unsafe-eval'` lets
 * sql.js instantiate its WebAssembly without allowing `eval`; `'self'` is a
 * fallback for browsers without `'strict-dynamic'`.
 *
 * `'unsafe-inline'` and `'unsafe-eval'` must be absent from it in production.
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

/** The directives, in emission order. */
export function cspDirectives(options: CspOptions): string[] {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // `'unsafe-inline'` is still tolerated for styles: many components
    // set inline styles, and the XSS risk there is marginal.
    "style-src 'self' 'unsafe-inline'",
    scriptSrc(options),
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    // The previews (React, JS, HTML) are framed from the dedicated origin.
    `frame-src 'self' ${options.sandboxOrigin}`,
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];
}

/** The value of the `Content-Security-Policy` header for a request. */
export function buildCsp(options: CspOptions): string {
  return cspDirectives(options).join("; ");
}

/**
 * A directive's tokens, without its directiveName (empty array if it is absent).
 * Searching the whole string would mix up the directives:
 * `'unsafe-inline'` appears in `style-src`.
 */
export function directiveTokens(directives: string[], directiveName: string): string[] {
  const directive = directives.find((d) => d === directiveName || d.startsWith(`${directiveName} `));
  if (directive === undefined) return [];
  return directive.split(/\s+/).slice(1);
}
