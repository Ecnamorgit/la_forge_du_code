import type { DocEntry } from "../types";

export const cssTransition: DocEntry = {
  id: "css/transition",
  domain: "css",
  term: "transition",
  title: "Transitions",
  summary:
    "transition adoucit le passage d'une valeur à une autre (couleur, taille...) au lieu d'un changement brutal.",
  body: `
### La forme
\`transition: propriété durée courbe;\`. La transition s'applique quand la propriété change (au :hover, :focus, ou via JS).

### Courbes (easing)
**linear**, **ease** (défaut), **ease-in**, **ease-out**, **ease-in-out** règlent l'accélération.
`,
  syntax: ".btn { transition: background 0.3s ease; }",
  examples: [
    { code: ".carte { transition: transform 0.2s; }\n.carte:hover { transform: scale(1.05); }", caption: "Léger zoom au survol, adouci." },
  ],
  pitfalls: [
    "On déclare la transition sur l'état de base, pas sur :hover.",
    "Animer width/height ou margin peut être saccadé ; préférer transform/opacity.",
  ],
  related: ["css/pseudo-classes", "css/variables"],
  official: { label: "MDN — transition", url: "https://developer.mozilla.org/fr/docs/Web/CSS/transition" },
};
