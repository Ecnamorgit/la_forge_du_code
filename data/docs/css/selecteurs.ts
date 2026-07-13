import type { DocEntry } from "../types";

export const selectors: DocEntry = {
  id: "css/selecteurs",
  domain: "css",
  term: ".classe",
  title: "Sélecteurs & classes",
  summary:
    "Les sélecteurs désignent les éléments à styliser : par balise, par classe (.nom) ou par id (#nom).",
  body: `
### Les trois sélecteurs de base
- **balise** : \`p { }\` cible tous les <p>.
- **classe** : \`.alerte { }\` cible tout élément \`class="alerte"\` (réutilisable).
- **id** : \`#menu { }\` cible l'unique élément \`id="menu"\`.

### Pourquoi les classes
Elles ciblent un sous-ensemble sans toucher tous les éléments d'un type, et se réutilisent partout.
`,
  syntax: ".alerte { color: red; }",
  examples: [
    { code: '<p class="alerte">Danger</p>\n.alerte { color: red; }', caption: "Cible uniquement les éléments .alerte." },
  ],
  pitfalls: [
    "En CSS la classe s'écrit avec un point (.alerte) ; en HTML sans point (class=\"alerte\").",
    "Un id ne doit exister qu'une seule fois par page.",
  ],
  related: ["css/style", "css/pseudo-classes"],
  official: { label: "MDN — Sélecteurs CSS", url: "https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Selectors" },
};
