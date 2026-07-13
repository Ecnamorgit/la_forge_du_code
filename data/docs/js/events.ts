import type { DocEntry } from "../types";

export const events: DocEntry = {
  id: "js/events",
  domain: "js",
  term: "addEventListener",
  title: "Événements",
  summary:
    "addEventListener réagit aux interactions (clic, saisie, touche) en appelant une fonction.",
  body: `
### Attacher
\`element.addEventListener('click', callback)\`. Le callback est rappelé à chaque événement.

### L'objet event
Le callback reçoit un \`event\` ; \`event.target\` est l'élément déclencheur.
`,
  syntax: "btn.addEventListener('click', () => console.log('clic'));",
  examples: [
    { code: "input.addEventListener('input', (e) => console.log(e.target.value));", caption: "Réagit à chaque frappe dans un champ." },
  ],
  pitfalls: [
    "removeEventListener exige la MÊME référence de fonction (pas une arrow inline).",
    "Les événements 'input' et 'change' diffèrent : input à chaque frappe, change à la perte de focus.",
  ],
  related: ["js/dom", "css/pseudo-classes"],
  official: { label: "MDN — addEventListener", url: "https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener" },
};
