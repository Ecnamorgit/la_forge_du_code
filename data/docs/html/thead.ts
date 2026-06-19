import type { DocEntry } from "../types";

export const thead: DocEntry = {
  id: "html/thead",
  domain: "html",
  term: "<thead>",
  title: "En-têtes de tableau : <thead>, <tbody> et <th>",
  summary:
    "Distinguent la zone des en-têtes de colonnes (thead/th) de la zone des données (tbody).",
  body: `
### Les balises
- **<thead>** : la zone des **en-têtes** de colonnes (souvent une seule ligne).
- **<tbody>** : la zone des **données**.
- **<th>** : *table header*, une cellule d'en-tête (en gras, centrée par défaut).

### Pourquoi c'est utile
Les outils d'accessibilité annoncent que « Cible » est l'en-tête d'une colonne, pas une donnée parmi d'autres.
`,
  syntax: "<thead> <tr> <th>…</th> </tr> </thead> <tbody> … </tbody>",
  examples: [
    {
      code: "<table>\n  <thead>\n    <tr><th>Cible</th><th>Distance</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Mars</td><td>225 M km</td></tr>\n  </tbody>\n</table>",
      caption: "En-têtes séparés des données.",
    },
  ],
  pitfalls: [
    "Mettre des <td> dans le <thead> au lieu de <th> perd le bénéfice sémantique.",
    "<thead> se place avant <tbody> dans le code.",
  ],
  related: ["html/table"],
  official: {
    label: "MDN — <thead>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/thead",
  },
};
