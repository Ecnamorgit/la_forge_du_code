/**
 * Document d'aperçu React servi depuis l'origine dédiée du bac à sable (audit
 * EXE-03).
 *
 * Il ne connaît pas l'origine du parent : la figer ferait poster la poignée de
 * main vers sa propre origine, et le navigateur la jetterait. Il l'apprend
 * donc : `preview:ready` est posté à `"*"` (aucun secret), puis l'origine du
 * premier `preview:render` reçu de `parent` est retenue et seule visée
 * ensuite. Tout message entrant est filtré par `event.source === parent`.
 *
 * Le runtime React est chargé par URL relative : la même application le sert
 * sur l'origine dédiée.
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
    <div id="racine"></div>
    <script src="/react-runtime/runtime.js"></script>
    <script>
      (function () {
        "use strict";
        // Origine du parent, apprise à la première réception (voir en-tête).
        var parentOrigin = null;
        var envoyer = function (msg) {
          parent.postMessage(msg, parentOrigin || "*");
        };
        var lisible = function (v) {
          if (v == null) return "Erreur inconnue";
          if (typeof v === "string") return v;
          if (v.message) return v.message;
          try { return JSON.stringify(v); } catch (e) { return String(v); }
        };
        var erreur = function (kind, message) {
          envoyer({ type: "preview:error", kind: kind, message: lisible(message) });
        };

        window.onerror = function (message, source, ligne, colonne, error) {
          erreur("runtime", (error && error.message) || message);
          return true;
        };
        window.addEventListener("unhandledrejection", function (e) {
          erreur("runtime", e.reason);
        });

        if (!window.React || !window.ReactDOM) {
          erreur("runtime", "Runtime React introuvable.");
          return;
        }

        var React = window.React;
        var ReactDOM = window.ReactDOM;
        var conteneur = document.getElementById("racine");
        var root = null;

        var Frontiere = class extends React.Component {
          constructor(props) { super(props); this.state = { mort: false }; }
          static getDerivedStateFromError() { return { mort: true }; }
          componentDidCatch(err) { erreur("runtime", err && err.message ? err.message : err); }
          render() { return this.state.mort ? null : this.props.children; }
        };

        var noms = Object.keys(React).filter(function (k) {
          return /^use[A-Z]/.test(k) || k === "createContext" || k === "Fragment" || k === "memo";
        });

        var monter = function (js, mount) {
          try {
            var precedente = root;
            root = null;
            if (precedente) precedente.unmount();
            conteneur.innerHTML = "";

            // js est deja protege contre les boucles sans fin par le parent
            // (ReactPreview, protegerBoucles) avant l'envoi : acorn n'existe
            // pas ici, on ne le rejoue pas. (Pas de backtick dans ce commentaire :
            // il vit dans un template literal.)
            var corps = '"use strict";' + js +
              "\\n; return typeof " + mount + " !== 'undefined' ? " + mount + " : null;";
            var fabrique = Function.apply(
              null,
              ["React", "ReactDOM"].concat(noms, [corps])
            );
            var Composant = fabrique.apply(
              null,
              [React, ReactDOM].concat(noms.map(function (k) { return React[k]; }))
            );

            if (!Composant) {
              erreur("mount", "Le composant " + mount + " n'a pas été trouvé. Vérifie son nom.");
              return;
            }

            root = ReactDOM.createRoot(conteneur);
            root.render(React.createElement(Frontiere, null, React.createElement(Composant)));
          } catch (err) {
            erreur("runtime", err && err.message ? err.message : err);
          }
        };

        var reNomComposant = new RegExp(${mountNameRe});

        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "preview:render") return;
          // Apprend l'origine du parent au premier message légitime.
          if (parentOrigin === null) parentOrigin = event.origin;
          else if (event.origin !== parentOrigin) return;
          if (typeof data.js !== "string" || typeof data.mount !== "string") return;
          if (!reNomComposant.test(data.mount)) {
            erreur("mount", "Nom de composant invalide dans les données du cours : " + data.mount);
            return;
          }
          monter(data.js, data.mount);
        });

        // Poignée de main : le parent ne connaît pas encore notre origine et
        // nous ne connaissons pas la sienne, d'où "*". Elle ne porte rien.
        envoyer({ type: "preview:ready" });
      })();
    </script>
  </body>
</html>`;
}
