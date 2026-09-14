/**
 * En-têtes communs aux documents du bac à sable, servis depuis l'origine
 * dédiée (constat EXE-03). Chacun (`/bac-a-sable`, `/bac-a-sable/js`,
 * `/bac-a-sable/html`) porte **sa propre CSP permissive** — `'unsafe-inline'`,
 * `'unsafe-eval'`, `'wasm-unsafe-eval'` — pour que l'exécution du code des
 * apprenants ne partage plus la CSP de l'application, qui peut alors se durcir.
 *
 * L'encadrement est régi par `frame-ancestors` (limité aux origines de l'app),
 * pas par `X-Frame-Options` — qui ne sait pas exprimer « ces origines-ci ».
 * Ces routes sont exclues des en-têtes globaux de `next.config.ts`.
 */

import { appOriginsForSandbox, originDeLaRequete } from "./sandbox-origin";

/**
 * La CSP d'un document du bac à sable. Les origines autorisées à l'encadrer
 * sont dérivées de la requête (`appOriginsForSandbox`) : l'application en
 * production (domaine nu et `www.`), ou l'autre hôte local en développement et
 * en CI — sans jamais livrer d'origine de développement en production.
 */
export function cspBacASable(req: { headers: Headers; url: string }): string {
  const ancetres = appOriginsForSandbox(originDeLaRequete(req));
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
    `frame-ancestors ${ancetres.length > 0 ? ancetres.join(" ") : "'none'"}`,
  ].join("; ");
}

/** Réponse HTML d'un document du bac à sable, avec sa CSP dédiée. */
export function reponseBacASable(html: string, req: { headers: Headers; url: string }): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": cspBacASable(req),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
