/**
 * JS sandbox executed inside an isolated iframe (`sandbox="allow-scripts"`).
 *
 * This prevents student code from accessing the app's window, sessionStorage,
 * localStorage, cookies, and other same-origin resources.
 *
 * L'iframe partage le fil d'exécution de la page : le délai de 3 s ci-dessous
 * ne peut rien contre une boucle synchrone sans fin. Les boucles sont donc
 * instrumentées avant l'envoi (lib/sandbox/loop-protect.ts, constat EXE-02).
 */

import { protegerBoucles } from "./loop-protect";

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

function formatArg(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "function") return "[Function]";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
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

    // Origine de la fenêtre parente (l'app). Sert de cible explicite au
    // postMessage du sandbox, au lieu du "*" permissif.
    const parentOrigin = window.location.origin;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
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
      // Sandboxed iframe without allow-same-origin → origin is the literal "null".
      // Defense-in-depth in case the sandbox attributes change later.
      if (event.origin !== "null") return;
      const data = event.data as { type?: string; payload?: JsRunResult };
      if (data?.type !== "sandbox:result" || !data.payload) return;
      finish(data.payload);
    };

    // Filet pour le code asynchrone qui ne rend jamais sa réponse. Les boucles
    // synchrones, elles, sont arrêtées à 3 s par la garde de loop-protect.ts :
    // ce délai-ci reste plus long pour que son message, plus précis, s'affiche.
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

    const srcdoc = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        "use strict";
        const logs = [];
        // Bornes anti-emballement : un code malicieux/buggé ne peut pas faire
        // exploser la mémoire ou la taille du message avant le timeout parent.
        const MAX_LOGS = 1000;
        const MAX_LINE = 2000;
        const formatArg = ${formatArg.toString()};
        const append = (...args) => {
          if (logs.length >= MAX_LOGS) return;
          let line = args.map(formatArg).join(" ");
          if (line.length > MAX_LINE) line = line.slice(0, MAX_LINE) + "… (tronqué)";
          logs.push(line);
        };
        const fakeConsole = { log: append, info: append, warn: append, error: append, debug: append };
        // localStorage polyfill — opaque-origin iframes (sandbox without allow-same-origin)
        // don't have a real Storage API. We expose an in-memory shim so chapters that teach
        // localStorage usage still work; it doesn't persist between runs, which is fine.
        const __store = {};
        const fakeStorage = {
          getItem(key) { return Object.prototype.hasOwnProperty.call(__store, key) ? __store[key] : null; },
          setItem(key, value) { __store[String(key)] = String(value); },
          removeItem(key) { delete __store[key]; },
          clear() { for (const k of Object.keys(__store)) delete __store[k]; },
          key(i) { return Object.keys(__store)[i] ?? null; },
          get length() { return Object.keys(__store).length; },
        };
        let lastValue;
        let error = null;
        try {
          const fn = new Function("console", "localStorage", '"use strict"; return (function(){\\n' + ${JSON.stringify(
            protegerBoucles(code)
          )} + '\\n})();');
          lastValue = fn(fakeConsole, fakeStorage);
        } catch (err) {
          error = err instanceof Error ? err.name + ": " + err.message : String(err);
        }
        // Delay the result post by 300ms so short async work (setTimeout, Promise
        // chains, async functions) has time to flush logs before we serialize.
        // The parent has a 3s deadline so we stay well within budget.
        setTimeout(function () {
          parent.postMessage({
            type: "sandbox:result",
            payload: { ok: !error, logs, error, lastValue }
          }, ${JSON.stringify(parentOrigin)});
        }, 300);
      })();
    </script>
  </body>
</html>`;

    iframe.srcdoc = srcdoc;
  });
}
