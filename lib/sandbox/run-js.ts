/**
 * Runs the learner's JavaScript in a hidden, sandboxed iframe
 * (`allow-scripts` only, hence an opaque origin): the code cannot reach the
 * application's `window`, storage or cookies. The iframe loads
 * `/bac-a-sable/js` and receives the code by message after its handshake.
 */

import { guardLoops } from "./loop-protect";
import { SANDBOX_JS_PATH, sandboxOriginFor } from "./sandbox-origin";

export interface JsRunResult {
  /** True if the code ran without throwing an error. */
  ok: boolean;
  /** Captured console lines, in order. */
  logs: string[];
  /** Error message, or null if the run succeeded. */
  error: string | null;
  /** Value returned by the code (top-level `return`). */
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

    // Before sending: the iframe may share the page's thread, and the timeout
    // below can do nothing against a synchronous loop (audit EXE-02).
    const guardedCode = guardLoops(code);

    // Dedicated origin: there the document carries its own permissive CSP instead
    // of inheriting the application's strict one (audit EXE-03).
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
      // Sandboxed iframe without allow-same-origin: literal origin "null".
      if (event.origin !== "null") return;
      const data = event.data as { type?: string; payload?: JsRunResult };

      // Opaque origin: "*" is the only possible target. The payload is not
      // a secret, and the document checks `event.source === parent`.
      if (data?.type === "sandbox:ready") {
        iframe.contentWindow?.postMessage(
          { type: "sandbox:run", code: guardedCode },
          "*"
        );
        return;
      }

      if (data?.type !== "sandbox:result" || !data.payload) return;
      finish(data.payload);
    };

    // Safety net for async code that never responds or an iframe that never
    // starts. Longer than the loop-protect.ts guard (3 s), so its more precise
    // message gets shown first.
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
