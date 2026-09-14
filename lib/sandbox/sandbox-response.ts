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

// Origines autorisées à encadrer le bac à sable : l'application, dans ses deux
// formes de production et ses deux formes locales (localhost / 127.0.0.1).
const APP_ANCESTORS = [
  "https://laforgeducode.fr",
  "https://www.laforgeducode.fr",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].join(" ");

const SANDBOX_CSP = [
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
  `frame-ancestors ${APP_ANCESTORS}`,
].join("; ");

/** Réponse HTML d'un document du bac à sable, avec sa CSP dédiée. */
export function reponseBacASable(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": SANDBOX_CSP,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
