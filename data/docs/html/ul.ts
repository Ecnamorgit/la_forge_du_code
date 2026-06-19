import type { DocEntry } from "../types";

export const ul: DocEntry = {
  id: "html/ul",
  domain: "html",
  term: "<ul>",
  title: "La liste à puces <ul>",
  summary:
    "Une liste non ordonnée : l'ordre des éléments n'a pas d'importance. Chaque ligne est un <li>.",
  body: `
### À quoi ça sert
**<ul>** (*unordered list*) affiche une liste **à puces**. Utilise-la quand l'ordre n'a pas de sens (un inventaire, des fonctionnalités).

### Chaque ligne : <li>
Une \`<ul>\` ne contient **que** des **<li>** (*list item*), jamais du texte en direct.
`,
  syntax: "<ul> <li>…</li> <li>…</li> </ul>",
  examples: [
    {
      code: "<ul>\n  <li>Oxygène</li>\n  <li>Énergie</li>\n  <li>Communication</li>\n</ul>",
      caption: "Trois modules listés sans ordre particulier.",
    },
  ],
  pitfalls: [
    "Mettre autre chose qu'un <li> directement dans <ul> est invalide.",
    "Si l'ordre compte (une procédure), utilise plutôt <ol>.",
  ],
  related: ["html/ol"],
  official: {
    label: "MDN — <ul>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/ul",
  },
};
