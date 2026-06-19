import type { DocEntry } from "../types";

export const nav: DocEntry = {
  id: "html/nav",
  domain: "html",
  term: "<nav>",
  title: "La balise <nav>",
  summary:
    "Déclare qu'un groupe de liens forme une zone de navigation principale — utile pour l'accessibilité et le SEO.",
  body: `
### À quoi ça sert
**<nav>** indique qu'un ensemble de liens sert à **naviguer** (menu principal, sommaire). Les lecteurs d'écran proposent un raccourci « passer au menu » qui cible précisément cette balise.

### Bonne pratique
On n'y met **que** les liens qui forment un menu logique, pas tous les liens de la page. Une page peut avoir plusieurs \`<nav>\` (header + footer).
`,
  syntax: "<nav> <a>…</a> <a>…</a> </nav>",
  examples: [
    {
      code: '<nav>\n  <a href="/">Accueil</a>\n  <a href="#missions">Missions</a>\n  <a href="#contact">Contact</a>\n</nav>',
      caption: "Un menu de navigation regroupant trois liens.",
    },
  ],
  pitfalls: [
    "Englober un seul lien dans <nav> n'a pas de sens : réserve-le aux groupes.",
    "<nav> structure, il ne stylise pas : l'apparence reste à faire en CSS.",
  ],
  related: ["html/a", "html/header"],
  official: {
    label: "MDN — <nav>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/nav",
  },
};
