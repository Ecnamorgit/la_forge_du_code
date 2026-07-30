// Point d'entree bundle par build-react-runtime.mjs. Accroche React et le
// client ReactDOM a `window` pour qu'une iframe srcdoc puisse les consommer via
// un simple <script src>. React 19 n'ayant plus de build UMD, c'est le seul
// moyen d'obtenir un React chargeable par balise script.
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;
