/**
 * Apercu React : construction du srcdoc de l'iframe et protocole de messages.
 *
 * L'iframe est persistante et a origine opaque (`sandbox="allow-scripts"` sans
 * `allow-same-origin`) : elle charge React une seule fois, puis remonte le
 * composant a chaque message `preview:render`. Contrairement a run-js.ts, qui
 * est headless et a un coup, celle-ci reste visible et interactive.
 *
 * Les deux fonctions exportees sont pures pour rester testables en node.
 */

export type PreviewErrorKind = "transform" | "mount" | "runtime";

export type PreviewMessage =
  | { type: "ready" }
  | { type: "error"; kind: PreviewErrorKind; message: string };

/**
 * `previewMount` est interpole dans un corps de `new Function`. On le valide
 * non par crainte d'une injection — le sandbox execute deja du code arbitraire,
 * un nom malveillant n'ajoute rien — mais pour qu'une coquille dans les donnees
 * du cours produise un message clair au lieu d'une erreur de syntaxe opaque.
 */
export const PREVIEW_MOUNT_NAME_RE = /^[A-Za-z_$][\w$]*$/;

const ERROR_KINDS: readonly PreviewErrorKind[] = ["transform", "mount", "runtime"];

export function parsePreviewMessage(
  event: MessageEvent,
  source: Window | null
): PreviewMessage | null {
  if (source === null || event.source !== source) return null;

  const data = event.data as { type?: unknown; kind?: unknown; message?: unknown } | null;
  if (typeof data !== "object" || data === null) return null;

  if (data.type === "preview:ready") return { type: "ready" };

  if (data.type === "preview:error") {
    if (typeof data.message !== "string") return null;
    if (!ERROR_KINDS.includes(data.kind as PreviewErrorKind)) return null;
    return { type: "error", kind: data.kind as PreviewErrorKind, message: data.message };
  }

  return null;
}

/**
 * Le srcdoc de l'iframe. `origin` est l'origine du parent : elle sert d'URL
 * absolue pour le runtime (une URL relative ne resout rien depuis
 * `about:srcdoc`) et de cible aux postMessage vers le parent.
 */
export function buildPreviewSrcdoc(origin: string): string {
  const parentOrigin = JSON.stringify(origin);
  // L'origine part aussi dans un attribut HTML : on retire un slash final (qui
  // produirait `//`) et on neutralise le guillemet, seul caractere capable de
  // sortir de l'attribut. C'est la seule interpolation non echappee qui
  // subsistait dans ce fichier.
  const runtimeSrc =
    encodeURI(origin.replace(/\/+$/, "")).replace(/"/g, "%22") +
    "/react-runtime/runtime.js";
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
    <script src="${runtimeSrc}"></script>
    <script>
      (function () {
        "use strict";
        var envoyer = function (msg) { parent.postMessage(msg, ${parentOrigin}); };
        var lisible = function (v) {
          if (v == null) return "Erreur inconnue";
          if (typeof v === "string") return v;
          if (v.message) return v.message;
          // Sans ca, un rejet porte par un objet nu donnerait "[object Object]".
          try { return JSON.stringify(v); } catch (e) { return String(v); }
        };
        var erreur = function (kind, message) {
          envoyer({ type: "preview:error", kind: kind, message: lisible(message) });
        };

        // Filets pour ce qu'une frontiere d'erreur React ne voit pas : une
        // exception dans un setTimeout d'un useEffect, une promesse rejetee.
        //
        // On prend la signature complete pour recuperer l'objet error : le
        // bundle React est charge cross-origin par rapport a l'origine opaque de
        // cette iframe, donc les exceptions signalees pendant son execution sont
        // remplacees par la chaine "Script error." sans details. L'objet error
        // est alors le seul chemin vers un message utilisable.
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

        // Frontiere d'erreur : capture ce que React leve PENDANT le rendu, dont
        // « Rendered fewer hooks than expected » — le message qui enseigne
        // vraiment les regles des hooks.
        var Frontiere = class extends React.Component {
          constructor(props) { super(props); this.state = { mort: false }; }
          static getDerivedStateFromError() { return { mort: true }; }
          componentDidCatch(err) { erreur("runtime", err && err.message ? err.message : err); }
          render() { return this.state.mort ? null : this.props.children; }
        };

        // Les globales sont DERIVEES de React, jamais enumerees a la main : une
        // liste ecrite en dur donnerait un « useRef is not defined » indebogable
        // le jour ou un exercice l'utiliserait.
        var noms = Object.keys(React).filter(function (k) {
          return /^use[A-Z]/.test(k) || k === "createContext" || k === "Fragment" || k === "memo";
        });

        var monter = function (js, mount) {
          try {
            // On detache AVANT de demonter : si unmount leve, root ne reste
            // pas pointe sur une racine morte que chaque deploiement suivant
            // tenterait de redemonter.
            var precedente = root;
            root = null;
            if (precedente) precedente.unmount();
            conteneur.innerHTML = "";

            // Le saut de ligne avant le return n'est pas cosmetique : Sucrase
            // n'emet pas de newline final, donc un code d'apprenant terminant
            // par un commentaire de ligne avalerait le return et son composant
            // serait declare introuvable alors qu'il est correct.
            var corps = '"use strict";' + js +
              "\\n; return typeof " + mount + " !== 'undefined' ? " + mount + " : null;";
            // Function.apply SANS \`new\` : \`new Function.apply(...)\` se lirait
            // \`new (Function.apply)(...)\` et leverait. Appeler Function comme une
            // fonction construit la meme chose.
            var fabrique = Function.apply(
              null,
              ["React", "ReactDOM"].concat(noms, [corps])
            );
            var Composant = fabrique.apply(
              null,
              [React, ReactDOM].concat(noms.map(function (k) { return React[k]; }))
            );

            if (!Composant) {
              erreur("mount", "Le composant " + mount + " n'a pas ete trouve. Verifie son nom.");
              return;
            }

            root = ReactDOM.createRoot(conteneur);
            root.render(React.createElement(Frontiere, null, React.createElement(Composant)));
          } catch (err) {
            erreur("runtime", err && err.message ? err.message : err);
          }
        };

        // Le nom du composant est interpole dans un corps de fonction : on le
        // valide ici, avec la MEME expression que PREVIEW_MOUNT_NAME_RE cote
        // parent (injectee, jamais recopiee, pour qu'elles ne divergent pas).
        // Sans ce garde, une coquille dans les donnees du cours produirait une
        // SyntaxError opaque etiquetee "runtime" au lieu d'un message clair.
        var reNomComposant = new RegExp(${mountNameRe});

        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "preview:render") return;
          if (typeof data.js !== "string" || typeof data.mount !== "string") return;
          if (!reNomComposant.test(data.mount)) {
            erreur("mount", "Nom de composant invalide dans les donnees du cours : " + data.mount);
            return;
          }
          monter(data.js, data.mount);
        });

        envoyer({ type: "preview:ready" });
      })();
    </script>
  </body>
</html>`;
}
