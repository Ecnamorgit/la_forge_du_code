import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { PROTECTED_PREFIXES, isPublicRoute } from "@/lib/public-routes";
import { buildCsp } from "@/lib/security/csp";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = new Set(["/login", "/signup"]);

// La CSP à nonce n'est émise qu'en production : en développement, le serveur a
// besoin d'`eval` et de `ws:` (HMR), et émettre une politique différente de
// celle livrée donnerait une fausse confiance (cf. docs/BRIEF_CSP_GARDE_FOU.md).
const CSP_ACTIVE = process.env.NODE_ENV === "production";

/**
 * Nonce unique par requête. `crypto.randomUUID` et `btoa` existent dans le
 * runtime edge du middleware ; `Buffer` non, d'où `btoa` plutôt que la forme
 * `Buffer.from(...).toString("base64")` de la doc Next.
 */
function genererNonce(): string {
  return btoa(crypto.randomUUID());
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAuthed = !!req.auth;

  // Les documents du bac à sable (constat EXE-03) posent EUX-MÊMES leur CSP
  // permissive : on ne doit pas la remplacer par la CSP stricte de l'app.
  const estBacASable = pathname === "/bac-a-sable" || pathname.startsWith("/bac-a-sable/");

  // Nonce + CSP à nonce, seulement en production et hors bac à sable.
  const nonce = CSP_ACTIVE && !estBacASable ? genererNonce() : null;
  const csp = nonce ? buildCsp({ nonce }) : null;

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !isPublicRoute(pathname);

  if (isProtected && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname + search);
    const res = NextResponse.redirect(url);
    if (csp) res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  if (AUTH_PAGES.has(pathname) && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const res = NextResponse.redirect(url);
    if (csp) res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  // Rendu de page : le nonce part dans un en-tête de requête, que Next lit
  // pendant le rendu serveur pour marquer ses scripts d'amorçage/hydratation.
  const requestHeaders = new Headers(req.headers);
  if (nonce && csp) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  }
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (csp) res.headers.set("Content-Security-Policy", csp);
  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.webp$|.*\\.svg$|sprites/).*)"],
};
