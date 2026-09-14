/**
 * Origine dédiée du bac à sable (constat EXE-03 de l'audit de sécurité du
 * 2026-09-12).
 *
 * Aujourd'hui le code des apprenants s'exécute dans un `srcdoc`, qui hérite de
 * la CSP de l'application : celle-ci doit donc garder `'unsafe-inline'` et
 * `'unsafe-eval'`, ce qui affaiblit la défense contre les XSS pour tout le
 * site. En servant l'exécution depuis une **autre origine**, cette origine
 * porte seule la CSP permissive, et l'application peut passer à une CSP à
 * nonce, sans `'unsafe-inline'` ni `'unsafe-eval'`.
 *
 * - En production, un sous-domaine dédié (`bac-a-sable.laforgeducode.fr`).
 * - En local, `127.0.0.1` est une origine distincte de `localhost` : les deux
 *   pointent sur le même serveur de dev, ce qui suffit à tester la séparation
 *   sans second serveur.
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

  // Production : préfixe `bac-a-sable.` sur le domaine nu, en retirant un
  // éventuel `www.` (bac-a-sable.laforgeducode.fr, pas
  // bac-a-sable.www.laforgeducode.fr).
  const hote = url.hostname.replace(/^www\./, "");
  url.hostname = `bac-a-sable.${hote}`;
  return url.origin;
}

/** Chemin du document d'aperçu React sur l'origine dédiée. */
export const SANDBOX_PATH = "/bac-a-sable";

/** Chemin du document d'exécution JavaScript (headless) sur l'origine dédiée. */
export const SANDBOX_JS_PATH = "/bac-a-sable/js";

/** Chemin du document d'aperçu HTML sur l'origine dédiée. */
export const SANDBOX_HTML_PATH = "/bac-a-sable/html";
