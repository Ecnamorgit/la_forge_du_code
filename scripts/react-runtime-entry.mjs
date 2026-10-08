// Point d'entrée de build-react-runtime.mjs. Expose React et le client
// ReactDOM sur `window` pour l'iframe d'aperçu : React 19 n'a plus de build UMD
// chargeable par balise script.
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;
