/**
 * Exécution du JavaScript de l'apprenant dans une iframe cachée, sandboxée
 * (`allow-scripts` seul, donc origine opaque) : le code n'accède ni au
 * `window`, ni aux stockages, ni aux cookies de l'application. L'iframe charge
 * `/bac-a-sable/js` et reçoit le code par message après sa poignée de main.
 */

import { protegerBoucles } from "./loop-protect";
import { SANDBOX_JS_PATH, sandboxOriginFor } from "./sandbox-origin";

export interface JsRunResult {
  /** Vrai si le code s'est exécuté sans lever d'erreur. */
  ok: boolean;
  /** Lignes capturées de la console, dans l'ordre. */
  logs: string[];
  /** Message d'erreur, ou null si l'exécution a réussi. */
  error: string | null;
  /** Valeur renvoyée par le code (`return` de premier niveau). */
  lastValue: unknown;
}

export function runJs(code: string): Promise<JsRunResult> {
  return new Promise<JsRunResult>((resolve) => {
    if (typeof document === "undefined") {
      resolve({
        ok: false,
        logs: [],
        error: "Sandbox indisponible hors navigateur.",
        lastValue: undefined,
      });
      return;
    }

    // Avant l'envoi : l'iframe peut partager le fil de la page, et le délai
    // ci-dessous ne peut rien contre une boucle synchrone (audit EXE-02).
    const codeProtege = protegerBoucles(code);

    // Origine dédiée : le document y porte sa propre CSP permissive au lieu
    // d'hériter de celle, stricte, de l'application (audit EXE-03).
    const sandboxSrc = sandboxOriginFor(window.location.origin) + SANDBOX_JS_PATH;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
    iframe.src = sandboxSrc;
    document.body.appendChild(iframe);

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timeout);
      iframe.remove();
    };

    const finish = (result: JsRunResult) => {
      cleanup();
      resolve(result);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      // Iframe sandboxée sans allow-same-origin : origine littérale "null".
      if (event.origin !== "null") return;
      const data = event.data as { type?: string; payload?: JsRunResult };

      // Origine opaque : "*" est la seule cible possible. La charge utile n'est
      // pas un secret, et le document vérifie `event.source === parent`.
      if (data?.type === "sandbox:ready") {
        iframe.contentWindow?.postMessage(
          { type: "sandbox:run", code: codeProtege },
          "*"
        );
        return;
      }

      if (data?.type !== "sandbox:result" || !data.payload) return;
      finish(data.payload);
    };

    // Filet pour un code asynchrone qui ne répond jamais ou une iframe qui ne
    // démarre pas. Plus long que la garde de loop-protect.ts (3 s), pour laisser
    // s'afficher son message, plus précis.
    const timeout = setTimeout(() => {
      finish({
        ok: false,
        logs: [],
        error:
          "Exécution interrompue après 4 s : le script ne rend pas la main (attente asynchrone sans fin ?).",
        lastValue: undefined,
      });
    }, 4000);

    window.addEventListener("message", onMessage);
  });
}
