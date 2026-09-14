/**
 * Document coquille de l'aperçu HTML, servi depuis l'origine dédiée du bac à
 * sable (constat EXE-03), par opposition au `srcdoc` inline que posait
 * `ChapterWorkspace`. Un `srcdoc` hérite de la CSP du parent : les scripts en
 * ligne de l'apprenant forçaient donc l'application à garder `'unsafe-inline'`.
 *
 * La coquille rend le HTML de l'apprenant dans une **iframe imbriquée** (via son
 * `srcdoc`) : cette scène hérite de la CSP de la coquille — permissive, posée
 * par la route — et non de celle (stricte) de l'application, deux crans plus
 * haut. Les scripts en ligne de l'apprenant s'exécutent donc, sans rien
 * concéder à la CSP du site.
 *
 * Comme les autres documents du bac à sable, la coquille **apprend** l'origine
 * du parent : `html:ready` posté à `"*"`, puis capture de `event.origin` du
 * premier message reçu de `parent`, chaque message filtré par
 * `event.source === parent`.
 *
 * Le HTML arrive par message (`html:render`), déjà instrumenté contre les
 * boucles sans fin par le parent (`protegerScriptsHtml`).
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
