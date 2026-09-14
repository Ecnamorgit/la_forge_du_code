/**
 * Sandbox JavaScript exécuté dans une iframe cachée à origine opaque
 * (`sandbox="allow-scripts"`).
 *
 * L'iframe est chargée par `src` depuis une **origine dédiée**
 * (`/bac-a-sable/js`, constat EXE-03), et non plus par un `srcdoc` : un `srcdoc`
 * hérite de la CSP du parent, ce qui forçait l'application à garder
 * `'unsafe-eval'`. Le code de l'apprenant n'est plus figé dans le HTML : il est
 * posté au document une fois sa poignée de main reçue.
 *
 * Cela empêche le code de l'apprenant d'accéder au window, au sessionStorage,
 * au localStorage, aux cookies et aux autres ressources de même origine de
 * l'application.
 *
 * L'iframe partage le fil d'exécution de la page : le délai ci-dessous ne peut
 * rien contre une boucle synchrone sans fin. Les boucles sont donc instrumentées
 * avant l'envoi (lib/sandbox/loop-protect.ts, constat EXE-02).
 */

import { protegerBoucles } from "./loop-protect";
import { SANDBOX_JS_PATH, sandboxOriginFor } from "./sandbox-origin";

export interface JsRunResult {
  /** True iff the code executed without throwing. */
  ok: boolean;
  /** Lines captured from console.log/info/warn/error, in order. */
  logs: string[];
  /** Error message (string form), or null if execution succeeded. */
  error: string | null;
  /** Value of the last expression in the code, when retrievable. */
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

    // Boucles instrumentées AVANT l'envoi : une fois posté, le code partage le
    // fil du parent et une boucle synchrone gèlerait l'onglet (constat EXE-02).
    const codeProtege = protegerBoucles(code);

    // Origine DÉDIÉE : le document d'exécution y porte sa propre CSP permissive,
    // au lieu d'hériter de celle (stricte) de l'application.
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
      // Iframe sandbox sans allow-same-origin → origine littérale "null".
      if (event.origin !== "null") return;
      const data = event.data as { type?: string; payload?: JsRunResult };

      // Poignée de main : le document est prêt, on lui poste le code. L'iframe
      // est à origine opaque, "*" est la seule cible possible ; la charge utile
      // est le code de l'apprenant lui-même, pas un secret, et le document
      // vérifie `event.source === parent`.
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

    // Filet pour le code asynchrone qui ne rend jamais sa réponse — ou pour une
    // iframe qui ne démarre pas. Les boucles synchrones, elles, sont arrêtées à
    // 3 s par la garde de loop-protect.ts : ce délai-ci reste plus long pour que
    // son message, plus précis, s'affiche.
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
