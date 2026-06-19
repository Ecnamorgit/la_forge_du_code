import type { DocEntry } from "../types";

export const anchor: DocEntry = {
  id: "html/a",
  domain: "html",
  term: "<a>",
  title: "Le lien <a>",
  summary:
    "La balise d'ancrage : rend un texte ou une image cliquable et mène vers une autre page, une section ou une ressource.",
  body: `
### À quoi ça sert
**<a>** (*anchor*) crée un lien. L'attribut **href** indique la destination : une URL complète (\`https://...\`), un chemin local (\`details.html\`) ou une ancre interne (\`#section\`).

### Liens externes
Pour un lien qui sort de ton site, ajoute **target="_blank"** (nouvel onglet) et, par propreté, **rel="noopener noreferrer"**.
`,
  syntax: '<a href="URL">Texte cliquable</a>',
  examples: [
    {
      code: '<a href="https://developer.mozilla.org" target="_blank">MDN</a>',
      caption: "Lien externe ouvert dans un nouvel onglet.",
    },
    {
      code: '<a href="#contact">Aller au contact</a>',
      caption: "Ancre interne : saute vers l'élément id=\"contact\".",
    },
  ],
  pitfalls: [
    "Un href vide ou manquant transforme le lien en simple texte.",
    "Sans target=\"_blank\", un lien externe remplace ta page dans le même onglet.",
  ],
  related: ["html/nav", "html/section"],
  official: {
    label: "MDN — <a>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/a",
  },
};
