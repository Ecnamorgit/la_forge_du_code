import type { DocEntry } from "../types";

export const objets: DocEntry = {
  id: "js/objets",
  domain: "js",
  term: "{ }",
  title: "Objets & méthodes",
  summary:
    "Un objet regroupe des paires clé/valeur ; une méthode est une fonction stockée dans l'objet.",
  body: `
### Structure
\`const vaisseau = { type: "Frégate", crew: 5 };\`. Accès : \`vaisseau.type\` ou \`vaisseau["type"]\`.

### Méthodes & this
Une fonction dans un objet est une **méthode** ; \`this\` y désigne l'objet appelant.
`,
  syntax: "const v = {\n  status: 'orbite',\n  report() { return this.status; },\n};\nv.report();",
  examples: [
    { code: "vaisseau.crew = 6; // modifie une propriété", caption: "Les propriétés d'un const restent modifiables." },
  ],
  pitfalls: [
    "const empêche de réassigner l'objet entier, pas de changer ses propriétés.",
    "this dépend de la façon dont la méthode est appelée.",
  ],
  related: ["js/tableaux", "js/array-methods"],
  official: { label: "MDN — Objets", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Working_with_objects" },
};
