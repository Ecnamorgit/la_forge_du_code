import type { DocEntry } from "../types";

export const figure: DocEntry = {
  id: "html/figure",
  domain: "html",
  term: "<figure>",
  title: "Les balises <figure> et <figcaption>",
  summary:
    "Regroupent une image (ou un schéma) et sa légende en un bloc indissociable et documenté.",
  body: `
### À quoi ça sert
**<figure>** encadre un contenu illustratif (image, schéma, extrait de code) et **<figcaption>** lui donne une **légende**. Le navigateur comprend que les deux forment un seul bloc.

### Position de la légende
Le \`<figcaption>\` peut se placer **avant ou après** l'image, au choix.
`,
  syntax: "<figure> <img …> <figcaption>Légende</figcaption> </figure>",
  examples: [
    {
      code: '<figure>\n  <img src="lune.png" alt="Surface lunaire">\n  <figcaption>Vue depuis l\'orbite</figcaption>\n</figure>',
      caption: "Image documentée par sa légende.",
    },
  ],
  pitfalls: [
    "Une <figcaption> vide n'apporte rien : décris vraiment le visuel.",
    "<figure> ne remplace pas l'attribut alt de l'image.",
  ],
  related: ["html/img"],
  official: {
    label: "MDN — <figure>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/figure",
  },
};
