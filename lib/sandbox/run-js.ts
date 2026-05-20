/**
 * JS sandbox executed inside an isolated iframe (`sandbox="allow-scripts"`).
 *
 * This prevents student code from accessing the app's window, sessionStorage,
 * localStorage, cookies, and other same-origin resources.
 */

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

    const timeout = setTimeout(() => {
      finish({
        ok: false,
        logs: [],
        error:
          "Execution interrompue apres 3s. Verifie une boucle infinie ou un script bloque.",
        lastValue: undefined,
      });
    }, 3000);

    window.addEventListener("message", onMessage);

    const srcdoc = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        "use strict";
        const logs = [];
        const formatArg = ${formatArg.toString()};
        const append = (...args) => logs.push(args.map(formatArg).join(" "));
        const fakeConsole = { log: append, info: append, warn: append, error: append, debug: append };
        let lastValue;
        let error = null;
        try {
          const fn = new Function("console", '"use strict"; return (function(){\\n' + ${JSON.stringify(
            code
          )} + '\\n})();');
          lastValue = fn(fakeConsole);
        } catch (err) {
          error = err instanceof Error ? err.name + ": " + err.message : String(err);
        }
        parent.postMessage({
          type: "sandbox:result",
          payload: { ok: !error, logs, error, lastValue }
        }, "*");
      })();
    </script>
  </body>
</html>`;

    iframe.srcdoc = srcdoc;
  });
}
