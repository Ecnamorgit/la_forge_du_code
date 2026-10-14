/**
 * Rejection of requests coming from another origin (audit SRV-09).
 *
 * The SameSite=Lax session cookie is not sent on a POST from a third-party
 * site, but SameSite works per site, not per origin: the sandbox, served from
 * a subdomain (audit EXE-03), could otherwise send authenticated requests to
 * the APIs.
 *
 * The Origin header, set by the browser, is compared with the request host
 * the way Next does for its server actions (`x-forwarded-host`, then `host`):
 * behind a proxy, `req.url` can differ from the public address. Without
 * Origin, we fall back to Sec-Fetch-Site. With neither (a non-browser client
 * such as curl), no CSRF is possible: the request goes through and
 * authentication does the rest.
 */
export function isCrossOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      return new URL(origin).host !== host;
    } catch {
      // Origin "null": sandboxed iframe or opaque document, never legitimate here.
      return true;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

/** 403 response if the request comes from another origin, otherwise `null`. */
export function crossOriginRefusal(req: Request): Response | null {
  return isCrossOriginRequest(req)
    ? Response.json({ error: "Origine de la requête non autorisée" }, { status: 403 })
    : null;
}
