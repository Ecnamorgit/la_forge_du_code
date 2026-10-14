/**
 * Shell document for the HTML preview, served from the sandbox's dedicated
 * origin (audit EXE-03).
 *
 * The shell renders the learner's HTML in a nested iframe, through its
 * `srcdoc`: that scene inherits the shell's permissive CSP, not the
 * application's. The learner's inline scripts therefore run without
 * weakening the site's CSP.
 *
 * Like the other sandbox documents, the shell learns the parent's origin:
 * `html:ready` is posted to `"*"`, then the origin of the first
 * `html:render` received from `parent` is kept. Every incoming message is
 * filtered by `event.source === parent`.
 *
 * The HTML arrives already instrumented against infinite loops by the parent
 * (`guardHtmlScripts`).
 */

export function buildHtmlPreviewDocument(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; }
      #scene { border: 0; width: 100%; height: 100%; background: #fff; }
    </style>
  </head>
  <body>
    <iframe id="scene" sandbox="allow-scripts" title="Rendu HTML"></iframe>
    <script>
      (function () {
        "use strict";
        var parentOrigin = null;
        var scene = document.getElementById("scene");
        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "html:render") return;
          if (parentOrigin === null) parentOrigin = event.origin;
          else if (event.origin !== parentOrigin) return;
          if (typeof data.html !== "string") return;
          // The nested scene is a srcdoc: it inherits the CSP of THIS
          // shell (permissive), not the application's.
          scene.srcdoc = data.html;
        });
        // Handshake: neither the shell nor the parent knows the other's
        // origin yet, hence "*". It carries nothing.
        parent.postMessage({ type: "html:ready" }, "*");
      })();
    </script>
  </body>
</html>`;
}
