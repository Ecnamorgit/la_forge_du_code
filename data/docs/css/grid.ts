import type { DocEntry } from "../types";

export const grid: DocEntry = {
  id: "css/grid",
  domain: "css",
  term: "display: grid",
  title: "CSS Grid",
  summary:
    "Un mode de disposition en deux dimensions : organise le contenu en lignes ET colonnes.",
  body: `
### Activer
\`display: grid\` sur le conteneur, puis on définit les colonnes avec **grid-template-columns**.

### Grid vs Flexbox
- **Flexbox** : une dimension (ligne OU colonne).
- **Grid** : deux dimensions (lignes ET colonnes) — idéal pour les mises en page complètes.
`,
  syntax: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}",
  examples: [
    { code: ".grid { display: grid; grid-template-columns: 1fr 1fr; }", caption: "Deux colonnes égales." },
  ],
  pitfalls: [
    "Sans grid-template-columns, tout s'empile sur une seule colonne.",
    "L'unité fr répartit l'espace disponible ; 1fr 1fr = deux colonnes égales.",
  ],
  related: ["css/flexbox", "css/media-queries"],
  official: { label: "MDN — CSS Grid", url: "https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Grid_Layout" },
};
