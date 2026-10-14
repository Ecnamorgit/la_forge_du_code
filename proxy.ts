import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { PROTECTED_PREFIXES, isPublicRoute } from "@/lib/public-routes";
import { requestOrigin, sandboxOriginFor } from "@/lib/sandbox/sandbox-origin";
import { buildCsp } from "@/lib/security/csp";
import { isSiteOrigin } from "@/lib/seo";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = new Set(["/login", "/signup"]);

// Nonce-based CSP in production only: the dev server needs `eval` and
// `ws:` (HMR), and a policy different from the shipped one would give
// false confidence (see docs/audit-securite/corrections/EXE-03.md).
const CSP_ACTIVE = process.env.NODE_ENV === "production";

/** Unique nonce per request. */
function generateNonce(): string {
  return btoa(crypto.randomUUID());
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAuthed = !!req.auth;

  // The sandbox documents set their own permissive CSP, which the app's
  // strict CSP must not replace.
  const isSandboxPath = pathname === "/bac-a-sable" || pathname.startsWith("/bac-a-sable/");

  // `frame-src` only allows the sandbox origin derived from the request
  // (dedicated subdomain in production, another local host in CI).
  const origin = requestOrigin(req);
  const nonce = CSP_ACTIVE && !isSandboxPath ? generateNonce() : null;
  const csp = nonce ? buildCsp({ nonce, sandboxOrigin: sandboxOriginFor(origin) }) : null;

  // The sandbox subdomain and the .vercel.app address serve the whole site
  // too: those copies are kept out of search results.
  const indexable = isSiteOrigin(origin, process.env.APP_URL);
  const withHeaders = (res: NextResponse) => {
    if (csp) res.headers.set("Content-Security-Policy", csp);
    if (!indexable) res.headers.set("X-Robots-Tag", "noindex");
    return res;
  };

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !isPublicRoute(pathname);

  if (isProtected && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname + search);
    return withHeaders(NextResponse.redirect(url));
  }

  if (AUTH_PAGES.has(pathname) && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return withHeaders(NextResponse.redirect(url));
  }

  // Next reads the nonce from the request headers during server rendering
  // to tag its own scripts.
  const requestHeaders = new Headers(req.headers);
  if (nonce && csp) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  }
  return withHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.webp$|.*\\.svg$|sprites/).*)"],
};
