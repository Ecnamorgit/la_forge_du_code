// Entry point for build-react-runtime.mjs. Exposes React and the ReactDOM
// client on `window` for the preview iframe: React 19 no longer ships a UMD
// build loadable via a script tag.
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;
