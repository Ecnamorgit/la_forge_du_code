/**
 * Dedicated sandbox origin (audit EXE-03).
 *
 * Learners' code runs on a different origin from the application.
 * Only this origin carries the permissive CSP, and the application keeps a
 * nonce-based CSP without `'unsafe-inline'` or `'unsafe-eval'`.
 *
 * In production, it is a subdomain (`bac-a-sable.laforgeducode.fr`).
 * Locally, `localhost` and `127.0.0.1` are two distinct origins served by
 * the same dev server, which is enough to test the separation.
 */

/** Resolves the sandbox origin from the application origin. */
export function sandboxOriginFor(appOrigin: string): string {
  let url: URL;
  try {
    url = new URL(appOrigin);
  } catch {
    return appOrigin;
  }

  // Local: localhost <-> 127.0.0.1, same port.
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    return url.origin;
  }
  if (url.hostname === "127.0.0.1") {
    url.hostname = "localhost";
    return url.origin;
  }

  // Production: `bac-a-sable.` on the bare domain, without any `www.`.
  const bareHost = url.hostname.replace(/^www\./, "");
  url.hostname = `bac-a-sable.${bareHost}`;
  return url.origin;
}

/**
 * Inverse of `sandboxOriginFor`: the application origins allowed to
 * frame a sandbox document (`frame-ancestors`). Locally, the other
 * local host; in production, the bare domain and its `www.` form, since the
 * site redirects one to the other. Empty array if the origin is unparsable:
 * the caller then emits `'none'`.
 */
export function appOriginsForSandbox(sandboxOrigin: string): string[] {
  let url: URL;
  try {
    url = new URL(sandboxOrigin);
  } catch {
    return [];
  }

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return [sandboxOriginFor(url.origin)];
  }

  const appHost = url.hostname.replace(/^bac-a-sable\./, "");
  const withoutWww = new URL(url.origin);
  withoutWww.hostname = appHost;
  const withWww = new URL(url.origin);
  withWww.hostname = `www.${appHost}`;
  return [withoutWww.origin, withWww.origin];
}

/**
 * Public origin of a request. Behind a proxy (Vercel), `req.url` may
 * differ from the address the browser sees: we read
 * `x-forwarded-host` and `x-forwarded-proto` first (like Next and `lib/same-origin.ts`),
 * then `host`, and finally the request URL.
 */
export function requestOrigin(req: { headers: Headers; url: string }): string {
  const firstValue = (value: string | null) => value?.split(",")[0]?.trim() || null;
  const host = firstValue(req.headers.get("x-forwarded-host")) ?? firstValue(req.headers.get("host"));
  let fromUrl: URL | null = null;
  try {
    fromUrl = new URL(req.url);
  } catch {
    fromUrl = null;
  }
  if (!host) return fromUrl?.origin ?? "";
  const proto =
    firstValue(req.headers.get("x-forwarded-proto")) ?? fromUrl?.protocol.replace(/:$/, "") ?? "https";
  return `${proto}://${host}`;
}

/** Path of the React preview document on the dedicated origin. */
export const SANDBOX_PATH = "/bac-a-sable";

/** Path of the (headless) JavaScript execution document on the dedicated origin. */
export const SANDBOX_JS_PATH = "/bac-a-sable/js";

/** Path of the HTML preview document on the dedicated origin. */
export const SANDBOX_HTML_PATH = "/bac-a-sable/html";
