/**
 * React preview document served from the sandbox's dedicated origin (audit
 * EXE-03).
 *
 * It does not know the parent's origin: hardcoding it would post the
 * handshake to its own origin, and the browser would drop it. So it learns
 * it: `preview:ready` is posted to `"*"` (no secret), then the origin of the
 * first `preview:render` received from `parent` is kept and is the only
 * target afterwards. Every incoming message is filtered by `event.source === parent`.
 *
 * The React runtime is loaded through a relative URL: the same application
 * serves it on the dedicated origin.
 */

import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";

export function buildPreviewDocument(): string {
  const mountNameRe = JSON.stringify(PREVIEW_MOUNT_NAME_RE.source);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; }
      body { font-family: system-ui, sans-serif; font-size: 15px; padding: 12px; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="/react-runtime/runtime.js"></script>
    <script>
      (function () {
        "use strict";
        // Parent origin, learned on the first message received (see header).
        var parentOrigin = null;
        var send = function (msg) {
          parent.postMessage(msg, parentOrigin || "*");
        };
        var readable = function (v) {
          if (v == null) return "Erreur inconnue";
          if (typeof v === "string") return v;
          if (v.message) return v.message;
          try { return JSON.stringify(v); } catch (e) { return String(v); }
        };
        var reportError = function (kind, message) {
          send({ type: "preview:error", kind: kind, message: readable(message) });
        };

        window.onerror = function (message, source, line, column, error) {
          reportError("runtime", (error && error.message) || message);
          return true;
        };
        window.addEventListener("unhandledrejection", function (e) {
          reportError("runtime", e.reason);
        });

        if (!window.React || !window.ReactDOM) {
          reportError("runtime", "Runtime React introuvable.");
          return;
        }

        var React = window.React;
        var ReactDOM = window.ReactDOM;
        var container = document.getElementById("root");
        var root = null;

        var ErrorBoundary = class extends React.Component {
          constructor(props) { super(props); this.state = { crashed: false }; }
          static getDerivedStateFromError() { return { crashed: true }; }
          componentDidCatch(err) { reportError("runtime", err && err.message ? err.message : err); }
          render() { return this.state.crashed ? null : this.props.children; }
        };

        var hookNames = Object.keys(React).filter(function (k) {
          return /^use[A-Z]/.test(k) || k === "createContext" || k === "Fragment" || k === "memo";
        });

        var mountComponent = function (js, mount) {
          try {
            var previous = root;
            root = null;
            if (previous) previous.unmount();
            container.innerHTML = "";

            // js is already guarded against infinite loops by the parent
            // (ReactPreview, guardLoops) before it is sent: acorn does not exist
            // here, so the guard is not run again. (No backtick in this comment:
            // it lives in a template literal.)
            var body = '"use strict";' + js +
              "\\n; return typeof " + mount + " !== 'undefined' ? " + mount + " : null;";
            var factory = Function.apply(
              null,
              ["React", "ReactDOM"].concat(hookNames, [body])
            );
            var Component = factory.apply(
              null,
              [React, ReactDOM].concat(hookNames.map(function (k) { return React[k]; }))
            );

            if (!Component) {
              reportError("mount", "Le composant " + mount + " n'a pas été trouvé. Vérifie son nom.");
              return;
            }

            root = ReactDOM.createRoot(container);
            root.render(React.createElement(ErrorBoundary, null, React.createElement(Component)));
          } catch (err) {
            reportError("runtime", err && err.message ? err.message : err);
          }
        };

        var componentNameRe = new RegExp(${mountNameRe});

        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "preview:render") return;
          // Learn the parent origin from the first legitimate message.
          if (parentOrigin === null) parentOrigin = event.origin;
          else if (event.origin !== parentOrigin) return;
          if (typeof data.js !== "string" || typeof data.mount !== "string") return;
          if (!componentNameRe.test(data.mount)) {
            reportError("mount", "Nom de composant invalide dans les données du cours : " + data.mount);
            return;
          }
          mountComponent(data.js, data.mount);
        });

        // Handshake: the parent does not know our origin yet and we do not
        // know its origin, hence "*". It carries nothing.
        send({ type: "preview:ready" });
      })();
    </script>
  </body>
</html>`;
}
