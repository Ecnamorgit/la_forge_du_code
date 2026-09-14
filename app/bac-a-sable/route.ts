import { buildPreviewDocument } from "@/lib/sandbox/preview-document";

/**
 * Document du bac à sable React, servi depuis l'origine dédiée (constat
 * EXE-03). Il est chargé dans une iframe par `ReactPreview`, via `src` et non
 * `srcdoc`, pour que son exécution ne partage plus la CSP de l'application.
 *
 * Cette route porte donc sa propre CSP permissive (`'unsafe-inline'`,
 * `'unsafe-eval'`, `'wasm-unsafe-eval'`), et se laisse encadrer par les seules
 * origines de l'application (`frame-ancestors`), là où le reste du site reste
 * en `frame-ancestors 'none'`. Ces en-têtes sont posés ici, la route étant
 * exclue des en-têtes globaux de `next.config.ts`.
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

export function GET(): Response {
  return new Response(buildPreviewDocument(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": SANDBOX_CSP,
      "X-Content-Type-Options": "nosniff",
      // Pas de X-Frame-Options : l'encadrement est régi par frame-ancestors
      // ci-dessus. X-Frame-Options ne sait pas exprimer « ces origines-ci ».
      "Cache-Control": "no-store",
    },
  });
}
