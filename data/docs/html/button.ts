import type { DocEntry } from "../types";

export const button: DocEntry = {
  id: "html/button",
  domain: "html",
  term: "<button>",
  title: "Le bouton <button>",
  summary:
    "Un bouton cliquable. Son attribut type détermine s'il soumet le formulaire, le réinitialise ou déclenche du JS.",
  body: `
### Les trois types
- **submit** (par défaut dans un formulaire) : envoie le \`<form>\`.
- **reset** : remet les champs à leur valeur initiale.
- **button** : ne fait rien seul ; sert aux actions JavaScript.

### Pourquoi préciser le type
Dans un \`<form>\`, un bouton sans type explicite vaut **submit** et peut envoyer le formulaire par surprise.
`,
  syntax: '<button type="submit">Envoyer</button>',
  examples: [
    {
      code: '<button type="submit">Envoyer</button>\n<button type="button">Annuler</button>',
      caption: "Un bouton d'envoi et un bouton d'action neutre.",
    },
  ],
  pitfalls: [
    "Un <button> dans un formulaire sans type=\"button\" déclenche une soumission.",
    "Un bouton submit hors de tout <form> n'a rien à envoyer.",
  ],
  related: ["html/form"],
  official: {
    label: "MDN — <button>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/button",
  },
};
