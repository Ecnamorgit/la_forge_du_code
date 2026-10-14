/**
 * Headless JavaScript execution document, served from the sandbox's dedicated
 * origin (audit EXE-03): it alone carries the permissive CSP that
 * `new Function` requires, while the application keeps a strict CSP.
 *
 * Like `preview-document.ts`, it learns the parent's origin instead of
 * hardcoding it: `sandbox:ready` is posted to `"*"` (no secret), then the origin
 * of the first `sandbox:run` received from `parent` is kept. Every incoming
 * message is filtered by `event.source === parent`.
 *
 * The code arrives already instrumented against infinite loops by the parent
 * (`guardLoops`): acorn is not loaded here.
 */

export function buildJsRunnerDocument(): string {
  return `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        "use strict";
        var parentOrigin = null;
        var envoyer = function (msg) { parent.postMessage(msg, parentOrigin || "*"); };

        // Bornes anti-emballement : un code buggé ou malicieux ne peut pas faire
        // exploser la mémoire ou la taille du message avant le délai du parent.
        var MAX_LOGS = 1000;
        var MAX_LINE = 2000;

        var formatArg = function (v) {
          if (v === null) return "null";
          if (v === undefined) return "undefined";
          if (typeof v === "string") return v;
          if (typeof v === "number" || typeof v === "boolean") return String(v);
          if (typeof v === "function") return "[Function]";
          try { return JSON.stringify(v); } catch (e) { return String(v); }
        };

        var executer = function (code) {
          var logs = [];
          var append = function () {
            if (logs.length >= MAX_LOGS) return;
            var args = Array.prototype.slice.call(arguments);
            var line = args.map(formatArg).join(" ");
            if (line.length > MAX_LINE) line = line.slice(0, MAX_LINE) + "… (tronqué)";
            logs.push(line);
          };
          var fakeConsole = { log: append, info: append, warn: append, error: append, debug: append };

          // Polyfill localStorage : une iframe à origine opaque (sandbox sans
          // allow-same-origin) n'a pas de vraie API Storage. Ce shim en mémoire
          // permet aux chapitres qui l'enseignent de tourner ; il ne persiste
          // pas d'une exécution à l'autre, ce qui est acceptable.
          var __store = {};
          var fakeStorage = {
            getItem: function (key) { return Object.prototype.hasOwnProperty.call(__store, key) ? __store[key] : null; },
            setItem: function (key, value) { __store[String(key)] = String(value); },
            removeItem: function (key) { delete __store[key]; },
            clear: function () { for (var k in __store) if (Object.prototype.hasOwnProperty.call(__store, k)) delete __store[k]; },
            key: function (i) { var ks = Object.keys(__store); return i < ks.length ? ks[i] : null; },
            get length() { return Object.keys(__store).length; }
          };

          var lastValue;
          var error = null;
          try {
            var fn = new Function(
              "console",
              "localStorage",
              '"use strict"; return (function(){\\n' + code + '\\n})();'
            );
            lastValue = fn(fakeConsole, fakeStorage);
          } catch (err) {
            error = err instanceof Error ? err.name + ": " + err.message : String(err);
          }

          // Délai de 300 ms avant la réponse pour laisser un court travail async
          // (setTimeout, promesses, async/await) vider ses logs. Le parent a un
          // budget de 4 s, on reste large.
          setTimeout(function () {
            envoyer({
              type: "sandbox:result",
              payload: { ok: !error, logs: logs, error: error, lastValue: lastValue }
            });
          }, 300);
        };

        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "sandbox:run") return;
          if (parentOrigin === null) parentOrigin = event.origin;
          else if (event.origin !== parentOrigin) return;
          if (typeof data.code !== "string") return;
          executer(data.code);
        });

        envoyer({ type: "sandbox:ready" });
      })();
    </script>
  </body>
</html>`;
}
