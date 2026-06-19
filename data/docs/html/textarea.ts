import type { DocEntry } from "../types";

export const textarea: DocEntry = {
  id: "html/textarea",
  domain: "html",
  term: "<textarea>",
  title: "Le champ multiligne <textarea>",
  summary:
    "Un champ texte sur plusieurs lignes pour les messages longs. Contrairement à <input>, il a une balise de fermeture.",
  body: `
### À quoi ça sert
**<textarea>** accueille un **texte long** (un rapport, un commentaire). Il s'ouvre et **se ferme** : \`<textarea></textarea>\` (ce n'est pas une balise auto-fermante).

### Bon à savoir
Le contenu initial se place **entre** les balises, pas dans un attribut value.
`,
  syntax: '<textarea id="msg" name="msg"></textarea>',
  examples: [
    {
      code: '<label for="msg">Rapport</label>\n<textarea id="msg" name="msg"></textarea>',
      caption: "Un champ de message libre étiqueté.",
    },
  ],
  pitfalls: [
    "Oublier </textarea> avale le reste du code comme contenu du champ.",
    "Comme tout champ, il a besoin d'un name pour être envoyé.",
  ],
  related: ["html/form", "html/input"],
  official: {
    label: "MDN — <textarea>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/textarea",
  },
};
