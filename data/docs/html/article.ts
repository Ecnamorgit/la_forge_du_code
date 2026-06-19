import type { DocEntry } from "../types";

export const article: DocEntry = {
  id: "html/article",
  domain: "html",
  term: "<article>",
  title: "Le contenu autonome <article>",
  summary:
    "Un bloc qui garde son sens sorti de la page : article de blog, fiche produit, post de forum.",
  body: `
### <article> vs <section>
- **<article>** : un contenu **autonome**, réutilisable seul (un billet, une fiche).
- **<section>** : un **regroupement thématique** à l'intérieur, généralement titré.
- **<aside>** : un contenu **connexe** mais séparable (encart, « voir aussi »).

### Hiérarchie typique
Un \`<article>\` peut contenir plusieurs \`<section>\` et un \`<aside>\`.
`,
  syntax: "<article> <h2>…</h2> <section>…</section> </article>",
  examples: [
    {
      code: "<article>\n  <h2>Mission Lunaire</h2>\n  <section>\n    <p>Briefing en cours.</p>\n  </section>\n</article>",
      caption: "Un article autonome découpé en sections.",
    },
  ],
  pitfalls: [
    "Si le bloc n'a aucun sens hors de la page, c'est plutôt une <section>.",
    "N'imbrique pas un <article> dans un <article> sans raison.",
  ],
  related: ["html/section", "html/main"],
  official: {
    label: "MDN — <article>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/article",
  },
};
