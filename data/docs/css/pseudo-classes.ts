import type { DocEntry } from "../types";

export const pseudoClasses: DocEntry = {
  id: "css/pseudo-classes",
  domain: "css",
  term: ":hover",
  title: "Pseudo-classes",
  summary:
    "Une pseudo-classe cible un élément selon son état : survol (:hover), focus (:focus), etc.",
  body: `
### Le principe
On ajoute \`:etat\` au sélecteur. Le style s'applique seulement quand l'état est vrai.

### Les plus utiles
- **:hover** — survol souris.
- **:focus** — élément actif au clavier (input, bouton).
- **:active** — pendant le clic.
- **:disabled**, **:checked** — état de formulaire.
`,
  syntax: ".btn:hover { background: #00ff88; }",
  examples: [
    { code: "a:focus { outline: 2px solid cyan; }", caption: "Rend le focus clavier visible (accessibilité)." },
  ],
  pitfalls: [
    "Ne jamais retirer l'outline de :focus sans alternative : c'est un repère d'accessibilité.",
    ":hover ne fonctionne pas au toucher sur mobile — prévoir un état :active.",
  ],
  related: ["css/selecteurs", "css/transition"],
  official: { label: "MDN — Pseudo-classes", url: "https://developer.mozilla.org/fr/docs/Web/CSS/Pseudo-classes" },
};
