import type { DocEntry } from "../types";

export const label: DocEntry = {
  id: "html/label",
  domain: "html",
  term: "<label>",
  title: "L'étiquette <label>",
  summary:
    "Associe un texte explicatif à un champ. Cliquer le label active le champ — essentiel pour l'accessibilité.",
  body: `
### À quoi ça sert
**<label>** nomme un champ. Son attribut **for** doit valoir le **id** du champ visé. Cliquer le label place alors le focus dans le champ.

### Pourquoi c'est important
Les lecteurs d'écran annoncent le label quand l'utilisateur arrive sur le champ : sans lui, le champ est « anonyme ».
`,
  syntax: '<label for="mail">Email</label> <input id="mail">',
  examples: [
    {
      code: '<label for="callsign">Indicatif</label>\n<input type="text" id="callsign" name="callsign">',
      caption: "Le for du label pointe vers l'id du champ.",
    },
  ],
  pitfalls: [
    "Un for qui ne correspond à aucun id ne relie rien.",
    "Un placeholder ne remplace pas un label : il disparaît à la saisie.",
  ],
  related: ["html/input", "html/form"],
  official: {
    label: "MDN — <label>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/label",
  },
};
