import type { DocEntry } from "../types";

export const mediaQueries: DocEntry = {
  id: "css/media-queries",
  domain: "css",
  term: "@media",
  title: "Media queries (responsive)",
  summary:
    "@media applique des règles CSS selon la taille de l'écran — la base du responsive design.",
  body: `
### Le principe
On enveloppe des règles dans un bloc \`@media\` conditionné par la largeur (\`min-width\` / \`max-width\`).

### Approche mobile-first
On écrit d'abord le style mobile, puis on ajoute des \`@media (min-width: ...)\` pour les grands écrans.
`,
  syntax: "@media (min-width: 768px) {\n  .grid { grid-template-columns: 1fr 1fr; }\n}",
  examples: [
    { code: ".container { max-width: 800px; width: 100%; }", caption: "Conteneur fluide qui ne dépasse pas 800px." },
  ],
  pitfalls: [
    "Sans <meta name=\"viewport\">, le responsive ne s'applique pas correctement sur mobile.",
    "Préférer max-width à width fixe pour éviter le débordement horizontal.",
  ],
  related: ["css/grid", "html/meta"],
  official: { label: "MDN — Media queries", url: "https://developer.mozilla.org/fr/docs/Web/CSS/CSS_media_queries/Using_media_queries" },
};
