import type { DocEntry } from "../types";

export const boxModel: DocEntry = {
  id: "css/box-model",
  domain: "css",
  term: "box model",
  title: "Le modèle de boîte",
  summary:
    "Chaque élément est une boîte : contenu, padding (marge intérieure), border, puis margin (marge extérieure).",
  body: `
### Les 4 couches
De l'intérieur vers l'extérieur : **contenu** (width/height) → **padding** → **border** → **margin**.

### box-sizing
Par défaut, width ne compte que le contenu. \`box-sizing: border-box\` inclut padding et border dans la largeur — bien plus prévisible.
`,
  syntax: ".module {\n  width: 200px;\n  padding: 16px;\n  border: 2px solid;\n  margin: 8px;\n}",
  examples: [
    { code: "* { box-sizing: border-box; }", caption: "Réglage recommandé pour toute la page." },
  ],
  pitfalls: [
    "Sans border-box, padding + border s'ajoutent à width et débordent.",
    "margin peut « fusionner » entre deux éléments verticaux (margin collapsing).",
  ],
  related: ["css/flexbox", "css/position"],
  official: { label: "MDN — Le modèle de boîte", url: "https://developer.mozilla.org/fr/docs/Learn/CSS/Building_blocks/The_box_model" },
};
