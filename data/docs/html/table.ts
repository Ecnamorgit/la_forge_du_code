import type { DocEntry } from "../types";

export const table: DocEntry = {
  id: "html/table",
  domain: "html",
  term: "<table>",
  title: "Le tableau <table>",
  summary:
    "Organise des données en lignes et colonnes avec <tr> (ligne) et <td> (cellule).",
  body: `
### Les trois balises de base
- **<table>** : le conteneur du tableau.
- **<tr>** : *table row*, une ligne.
- **<td>** : *table data*, une cellule de données.

### Règle de cohérence
Chaque \`<tr>\` doit contenir le **même nombre** de cellules pour que la grille soit alignée.
`,
  syntax: "<table> <tr> <td>…</td> <td>…</td> </tr> </table>",
  examples: [
    {
      code: "<table>\n  <tr><td>Mars</td><td>225 M km</td></tr>\n  <tr><td>Lune</td><td>384 000 km</td></tr>\n</table>",
      caption: "Un tableau de deux lignes et deux colonnes.",
    },
  ],
  pitfalls: [
    "N'utilise pas <table> pour mettre en page une interface : c'est le rôle du CSS.",
    "Des lignes avec un nombre de <td> différent cassent l'alignement.",
  ],
  related: ["html/thead"],
  official: {
    label: "MDN — <table>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/table",
  },
};
