/**
 * Headers shared by the sandbox documents (`/bac-a-sable`,
 * `/bac-a-sable/js`, `/bac-a-sable/html`), served from the dedicated origin
 * (audit EXE-03). Their permissive CSP thus stays separate from the
 * application's strict one.
 *
 * Framing is governed by `frame-ancestors`, restricted to the application's
 * origins: `X-Frame-Options` cannot express a list of origins.
 * These routes are excluded from the global headers in `next.config.ts`.
 */

import { appOriginsForSandbox, requestOrigin } from "./sandbox-origin";

/**
 * CSP of a sandbox document. The origins allowed to frame it are
 * derived from the request (`appOriginsForSandbox`): no development
 * origin is shipped to production.
 */
export function sandboxCsp(req: { headers: Headers; url: string }): string {
  const ancestors = appOriginsForSandbox(requestOrigin(req));
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'none'",
    `frame-ancestors ${ancestors.length > 0 ? ancestors.join(" ") : "'none'"}`,
  ].join("; ");
}

/** HTML response for a sandbox document, with its dedicated CSP. */
export function sandboxResponse(html: string, req: { headers: Headers; url: string }): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": sandboxCsp(req),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
