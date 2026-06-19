import type { DocEntry } from "../types";

export const section: DocEntry = {
  id: "html/section",
  domain: "html",
  term: "<section>",
  title: "La balise <section> et l'attribut id",
  summary:
    "Un bloc thématique de la page, souvent doté d'un id unique pour être ciblé par un lien, le CSS ou le JS.",
  body: `
### À quoi ça sert
**<section>** regroupe un contenu **thématique**, généralement introduit par un titre (\`<h2>\`/\`<h3>\`). C'est plus sémantique qu'un \`<div>\` neutre.

### L'attribut id
**id** est un **identifiant unique** dans toute la page. Il sert de cible aux ancres internes (\`href="#mon-id"\`), au CSS (\`#mon-id\`) et au JS (\`getElementById\`).
`,
  syntax: '<section id="missions"> ... </section>',
  examples: [
    {
      code: '<section id="missions">\n  <h2>Missions</h2>\n  <p>Opérations en cours…</p>\n</section>',
      caption: "Une section identifiée, ciblable par #missions.",
    },
  ],
  pitfalls: [
    "Deux éléments ne doivent jamais partager le même id.",
    "Un id ne contient pas d'espace ; convention : minuscules-et-tirets.",
  ],
  related: ["html/a", "html/article"],
  official: {
    label: "MDN — <section>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/section",
  },
};
