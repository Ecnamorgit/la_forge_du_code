import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { PROTECTED_PREFIXES, isPublicRoute } from "@/lib/public-routes";
import { requestOrigin, sandboxOriginFor } from "@/lib/sandbox/sandbox-origin";
import { buildCsp } from "@/lib/security/csp";

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
  const nonce = CSP_ACTIVE && !isSandboxPath ? generateNonce() : null;
  const csp = nonce
    ? buildCsp({ nonce, sandboxOrigin: sandboxOriginFor(requestOrigin(req)) })
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

  // Next reads the nonce from the request headers during server rendering
  // to tag its own scripts.
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
