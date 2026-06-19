import type { DocEntry } from "../types";

export const img: DocEntry = {
  id: "html/img",
  domain: "html",
  term: "<img>",
  title: "La balise <img>",
  summary:
    "Affiche une image. Balise auto-fermante qui exige une source (src) et un texte alternatif (alt).",
  body: `
### À quoi ça sert
**<img>** insère une image. C'est une balise **auto-fermante** (pas de \`</img>\`).

### Attributs essentiels
- **src** : la source (URL ou fichier local).
- **alt** : le texte alternatif, affiché si l'image ne charge pas et lu par les lecteurs d'écran. **Obligatoire**.
- **width / height** : réservent la place de l'image → moins de saccades au chargement.
`,
  syntax: '<img src="image.png" alt="Description" width="300" height="180">',
  examples: [
    {
      code: '<img src="https://placehold.co/200x120" alt="Vue de la station" width="300" height="180">',
      caption: "Image dimensionnée avec un alt descriptif.",
    },
  ],
  pitfalls: [
    "Omettre alt nuit à l'accessibilité et au SEO (alt=\"\" seulement pour une image purement décorative).",
    "Sans width/height, la mise en page peut sauter quand l'image arrive.",
  ],
  related: ["html/figure", "html/picture", "html/a"],
  official: {
    label: "MDN — <img>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/img",
  },
};
