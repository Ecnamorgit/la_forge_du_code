import type { DocEntry } from "../types";

export const header: DocEntry = {
  id: "html/header",
  domain: "html",
  term: "<header>",
  title: "L'en-tête <header>",
  summary:
    "La tête de page (ou de section) : logo, titre principal, et souvent la navigation.",
  body: `
### À quoi ça sert
**<header>** regroupe l'introduction d'une page ou d'une section : le \`<h1>\`, le logo, fréquemment la \`<nav>\` principale.

### Bon à savoir
On peut avoir plusieurs \`<header>\` : un pour la page, un autre en tête d'un \`<article>\`.
`,
  syntax: "<header> <h1>…</h1> <nav>…</nav> </header>",
  examples: [
    {
      code: '<header>\n  <h1>Station Nebula</h1>\n  <nav><a href="/">Accueil</a></nav>\n</header>',
      caption: "En-tête de page avec titre et navigation.",
    },
  ],
  pitfalls: [
    "<header> est sémantique, pas décoratif : il ne stylise rien tout seul.",
    "Ne le confonds pas avec <head> (métadonnées invisibles du document).",
  ],
  related: ["html/main", "html/footer", "html/nav"],
  official: {
    label: "MDN — <header>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/header",
  },
};
