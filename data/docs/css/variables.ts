import type { DocEntry } from "../types";

export const cssVariables: DocEntry = {
  id: "css/variables",
  domain: "css",
  term: "var(--x)",
  title: "Variables CSS",
  summary:
    "Les custom properties (--nom) centralisent une valeur réutilisable, lue avec var(--nom).",
  body: `
### Définir et utiliser
On définit une variable sur un sélecteur (souvent **:root** = toute la page), on la lit avec **var()**.

### Pourquoi
Changer une couleur de marque en un seul endroit au lieu de la recopier partout.
`,
  syntax: ":root { --primary: #00b8d4; }\n.btn { background: var(--primary); }",
  examples: [
    { code: ":root { --gap: 12px; }\n.grid { gap: var(--gap); }", caption: "Espacement centralisé, réutilisable." },
  ],
  pitfalls: [
    "Les noms sont sensibles à la casse et commencent par deux tirets (--).",
    "var(--x, fallback) permet une valeur de repli si la variable n'existe pas.",
  ],
  related: ["css/style", "css/transition"],
  official: { label: "MDN — Variables CSS", url: "https://developer.mozilla.org/fr/docs/Web/CSS/Using_CSS_custom_properties" },
};
