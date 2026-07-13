import type { DocEntry } from "../types";

export const flexbox: DocEntry = {
  id: "css/flexbox",
  domain: "css",
  term: "display: flex",
  title: "Flexbox",
  summary:
    "Un mode de disposition en une dimension : aligne et répartit les enfants d'un conteneur en ligne ou en colonne.",
  body: `
### Activer
\`display: flex\` sur le **conteneur** : ses enfants directs deviennent des flex items alignés horizontalement par défaut.

### Contrôler
- **flex-direction** : row (défaut) ou column.
- **justify-content** : répartition sur l'axe principal.
- **align-items** : alignement sur l'axe secondaire.
- **gap** : espace entre les items.
`,
  syntax: ".container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n}",
  examples: [
    { code: ".container { display: flex; }", caption: "Aligne les enfants en ligne." },
  ],
  pitfalls: [
    "flex se déclare sur le parent, mais affecte ses enfants.",
    "La valeur est display: flex, pas display: flexbox (qui n'existe pas).",
  ],
  related: ["css/grid", "css/box-model"],
  official: { label: "MDN — Flexbox", url: "https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox" },
};
