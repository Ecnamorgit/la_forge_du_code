import type { DocEntry } from "../types";

export const footer: DocEntry = {
  id: "html/footer",
  domain: "html",
  term: "<footer>",
  title: "Le pied de page <footer>",
  summary:
    "La zone de bas de page : copyright, mentions légales, liens secondaires.",
  body: `
### À quoi ça sert
**<footer>** clôt la page (ou une section) avec les informations annexes : copyright, mentions légales, contacts, liens secondaires.

### Bon à savoir
Comme \`<header>\`, un \`<footer>\` peut exister au niveau de la page **et** à la fin d'un \`<article>\`.
`,
  syntax: "<footer> <small>© 2026</small> </footer>",
  examples: [
    {
      code: "<footer>\n  <small>© 2026 Coalition Nebula</small>\n</footer>",
      caption: "Un pied de page avec mention de copyright.",
    },
  ],
  pitfalls: [
    "Le footer n'est pas forcément tout en bas visuellement : sa valeur est sémantique.",
    "Évite d'y placer le contenu principal de la page.",
  ],
  related: ["html/header", "html/main"],
  official: {
    label: "MDN — <footer>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/footer",
  },
};
