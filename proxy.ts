import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { PROTECTED_PREFIXES, isPublicRoute } from "@/lib/public-routes";
import { originDeLaRequete, sandboxOriginFor } from "@/lib/sandbox/sandbox-origin";
import { buildCsp } from "@/lib/security/csp";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = new Set(["/login", "/signup"]);

// CSP à nonce en production seulement : le serveur de développement a besoin
// d'`eval` et de `ws:` (HMR), et une politique différente de celle livrée
// donnerait une fausse confiance (voir docs/audit-securite/corrections/EXE-03.md).
const CSP_ACTIVE = process.env.NODE_ENV === "production";

/** Nonce unique par requête. */
function genererNonce(): string {
  return btoa(crypto.randomUUID());
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAuthed = !!req.auth;

  // Les documents du bac à sable posent eux-mêmes leur CSP permissive, que la
  // CSP stricte de l'app ne doit pas remplacer.
  const estBacASable = pathname === "/bac-a-sable" || pathname.startsWith("/bac-a-sable/");

  // `frame-src` n'autorise que l'origine du bac à sable dérivée de la requête
  // (sous-domaine dédié en production, autre hôte local en CI).
  const nonce = CSP_ACTIVE && !estBacASable ? genererNonce() : null;
  const csp = nonce
    ? buildCsp({ nonce, sandboxOrigin: sandboxOriginFor(originDeLaRequete(req)) })
    : null;

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

  // Next lit le nonce dans les en-têtes de requête pendant le rendu serveur
  // pour marquer ses propres scripts.
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
