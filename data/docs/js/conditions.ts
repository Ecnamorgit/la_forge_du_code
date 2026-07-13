import type { DocEntry } from "../types";

export const conditions: DocEntry = {
  id: "js/conditions",
  domain: "js",
  term: "if / else",
  title: "Opérateurs & décisions",
  summary:
    "Les opérateurs calculent et comparent ; if/else exécutent du code selon une condition.",
  body: `
### Comparer
\`===\` (égal strict), \`!==\`, \`<\`, \`>\`, \`>=\`. Toujours préférer \`===\` à \`==\` (qui convertit les types).

### Décider
\`if (condition) { ... } else { ... }\`. Les opérateurs logiques \`&&\` (et), \`||\` (ou), \`!\` (non) combinent les conditions.
`,
  syntax: "if (pv <= 0) {\n  console.log('Détruit');\n} else {\n  console.log('En vie');\n}",
  examples: [
    { code: "if (vessel.isHostile && armed) fire();", caption: "Deux conditions combinées avec &&." },
  ],
  pitfalls: [
    "== compare en convertissant les types (0 == '0' est vrai) ; === ne le fait pas.",
    "Un = seul (affectation) dans un if est un bug fréquent — il faut ===.",
  ],
  related: ["js/console", "js/fonctions"],
  official: { label: "MDN — if...else", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/if...else" },
};
