import type { DocEntry } from "../types";

export const ol: DocEntry = {
  id: "html/ol",
  domain: "html",
  term: "<ol>",
  title: "La liste ordonnée <ol>",
  summary:
    "Une liste numérotée automatiquement : à utiliser dès que l'ordre des étapes compte.",
  body: `
### À quoi ça sert
**<ol>** (*ordered list*) numérote chaque élément (1, 2, 3…). Choisis-la quand changer l'ordre **casse le sens** : une recette, une procédure, un classement.

### Chaque ligne : <li>
Comme pour \`<ul>\`, chaque entrée est un **<li>**.
`,
  syntax: "<ol> <li>…</li> <li>…</li> </ol>",
  examples: [
    {
      code: "<ol>\n  <li>Pressuriser la cabine</li>\n  <li>Allumer les moteurs</li>\n  <li>Décoller</li>\n</ol>",
      caption: "Une procédure de décollage en étapes ordonnées.",
    },
  ],
  pitfalls: [
    "Utiliser <ol> pour une liste dont l'ordre est arbitraire trompe le lecteur.",
    "La numérotation est automatique : ne la tape pas à la main dans les <li>.",
  ],
  related: ["html/ul"],
  official: {
    label: "MDN — <ol>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/ol",
  },
};
