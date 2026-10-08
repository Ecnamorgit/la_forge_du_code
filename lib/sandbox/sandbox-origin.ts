/**
 * Origine dédiée du bac à sable (audit EXE-03).
 *
 * Le code des apprenants s'exécute sur une autre origine que l'application.
 * Cette origine porte seule la CSP permissive, et l'application garde une CSP
 * à nonce sans `'unsafe-inline'` ni `'unsafe-eval'`.
 *
 * En production, c'est un sous-domaine (`bac-a-sable.laforgeducode.fr`). En
 * local, `localhost` et `127.0.0.1` sont deux origines distinctes servies par
 * le même serveur de dev, ce qui suffit à tester la séparation.
 */

/** Résout l'origine du bac à sable à partir de l'origine de l'application. */
export function sandboxOriginFor(appOrigin: string): string {
  let url: URL;
  try {
    url = new URL(appOrigin);
  } catch {
    return appOrigin;
  }

  // Local : localhost <-> 127.0.0.1, même port.
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    return url.origin;
  }
  if (url.hostname === "127.0.0.1") {
    url.hostname = "localhost";
    return url.origin;
  }

  // Production : `bac-a-sable.` sur le domaine nu, sans l'éventuel `www.`.
  const hote = url.hostname.replace(/^www\./, "");
  url.hostname = `bac-a-sable.${hote}`;
  return url.origin;
}

/**
 * Inverse de `sandboxOriginFor` : les origines de l'application autorisées à
 * encadrer un document du bac à sable (`frame-ancestors`). En local, l'autre
 * hôte local ; en production, le domaine nu et sa forme `www.`, le site
 * redirigeant l'un vers l'autre. Tableau vide si l'origine est illisible :
 * l'appelant émet alors `'none'`.
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

  const nu = url.hostname.replace(/^bac-a-sable\./, "");
  const sansWww = new URL(url.origin);
  sansWww.hostname = nu;
  const avecWww = new URL(url.origin);
  avecWww.hostname = `www.${nu}`;
  return [sansWww.origin, avecWww.origin];
}

/**
 * Origine publique d'une requête. Derrière un proxy (Vercel), `req.url` peut
 * différer de l'adresse vue par le navigateur : on lit d'abord
 * `x-forwarded-host` et `x-forwarded-proto` (comme Next et `lib/same-origin.ts`),
 * puis `host`, et enfin l'URL de la requête.
 */
export function originDeLaRequete(req: { headers: Headers; url: string }): string {
  const premier = (valeur: string | null) => valeur?.split(",")[0]?.trim() || null;
  const host = premier(req.headers.get("x-forwarded-host")) ?? premier(req.headers.get("host"));
  let depuisUrl: URL | null = null;
  try {
    depuisUrl = new URL(req.url);
  } catch {
    depuisUrl = null;
  }
  if (!host) return depuisUrl?.origin ?? "";
  const proto =
    premier(req.headers.get("x-forwarded-proto")) ?? depuisUrl?.protocol.replace(/:$/, "") ?? "https";
  return `${proto}://${host}`;
}

/** Chemin du document d'aperçu React sur l'origine dédiée. */
export const SANDBOX_PATH = "/bac-a-sable";

/** Chemin du document d'exécution JavaScript (headless) sur l'origine dédiée. */
export const SANDBOX_JS_PATH = "/bac-a-sable/js";

/** Chemin du document d'aperçu HTML sur l'origine dédiée. */
export const SANDBOX_HTML_PATH = "/bac-a-sable/html";
