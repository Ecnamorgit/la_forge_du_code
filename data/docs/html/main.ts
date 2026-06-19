import type { DocEntry } from "../types";

export const main: DocEntry = {
  id: "html/main",
  domain: "html",
  term: "<main>",
  title: "Le contenu principal <main>",
  summary:
    "Enveloppe le contenu central et unique de la page. Une seule occurrence par page.",
  body: `
### À quoi ça sert
**<main>** contient le contenu **principal et unique** de la page — pas l'en-tête, pas le pied, pas les barres latérales répétées. Les lecteurs d'écran l'annoncent en premier.

### Règle d'or
**Une seule** balise \`<main>\` visible par page.
`,
  syntax: "<main> … contenu central … </main>",
  examples: [
    {
      code: "<main>\n  <article>\n    <h2>Mission Lunaire</h2>\n    <p>Briefing…</p>\n  </article>\n</main>",
      caption: "Le cœur de la page, isolé du header et du footer.",
    },
  ],
  pitfalls: [
    "Mettre la navigation ou le footer dans <main> brouille sa sémantique.",
    "Plusieurs <main> visibles simultanément est invalide.",
  ],
  related: ["html/header", "html/footer", "html/article"],
  official: {
    label: "MDN — <main>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/main",
  },
};
