import type { DocEntry } from "../types";

export const arrayMethods: DocEntry = {
  id: "js/array-methods",
  domain: "js",
  term: ".map()",
  title: "map / filter / reduce",
  summary:
    "Trois méthodes de tableau : map transforme, filter sélectionne, reduce agrège vers une valeur.",
  body: `
### Les trois
- **map** : nouveau tableau de même taille, chaque élément transformé.
- **filter** : sous-tableau des éléments qui passent un test.
- **reduce** : réduit le tableau à une seule valeur (somme, max...).

Aucune ne modifie le tableau d'origine.
`,
  syntax: "const doubles = xp.map((n) => n * 2);\nconst elites = crew.filter((c) => c.niveau >= 5);\nconst total = masses.reduce((s, m) => s + m, 0);",
  examples: [
    { code: 'noms.map((n) => n.toUpperCase());', caption: "Transforme chaque nom en majuscules." },
  ],
  pitfalls: [
    "map garde toujours le même nombre d'éléments ; filter en garde ≤.",
    "reduce a besoin d'une valeur initiale (le 2e argument) pour être sûr.",
  ],
  related: ["js/tableaux", "js/fonctions"],
  official: { label: "MDN — Array.map", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/map" },
};
