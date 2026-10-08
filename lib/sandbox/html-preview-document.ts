/**
 * Document coquille de l'aperçu HTML, servi depuis l'origine dédiée du bac à
 * sable (audit EXE-03).
 *
 * La coquille rend le HTML de l'apprenant dans une iframe imbriquée, via son
 * `srcdoc` : cette scène hérite de la CSP permissive de la coquille, pas de
 * celle de l'application. Les scripts en ligne de l'apprenant s'exécutent donc
 * sans affaiblir la CSP du site.
 *
 * Comme les autres documents du bac à sable, la coquille apprend l'origine du
 * parent : `html:ready` est posté à `"*"`, puis l'origine du premier
 * `html:render` reçu de `parent` est retenue. Tout message entrant est filtré
 * par `event.source === parent`.
 *
 * Le HTML arrive déjà instrumenté contre les boucles sans fin par le parent
 * (`protegerScriptsHtml`).
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
          // La scène imbriquée est un srcdoc : elle hérite de la CSP de CETTE
          // coquille (permissive), pas de celle de l'application.
          scene.srcdoc = data.html;
        });
        // Poignée de main : ni la coquille ni le parent ne connaissent encore
        // l'origine de l'autre, d'où "*". Elle ne porte rien.
        parent.postMessage({ type: "html:ready" }, "*");
      })();
    </script>
  </body>
</html>`;
}
