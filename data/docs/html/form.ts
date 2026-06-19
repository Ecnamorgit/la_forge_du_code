import type { DocEntry } from "../types";

export const form: DocEntry = {
  id: "html/form",
  domain: "html",
  term: "<form>",
  title: "Le formulaire <form>",
  summary:
    "L'enveloppe qui regroupe tous les champs qu'un utilisateur remplit et soumet.",
  body: `
### À quoi ça sert
**<form>** regroupe les champs (\`<input>\`, \`<textarea>\`, \`<select>\`…) et gère leur **envoi**. Sans \`<form>\`, un bouton de soumission n'a rien à transmettre.

### Attributs courants
- **action** : l'URL qui reçoit les données.
- **method** : \`get\` (dans l'URL) ou \`post\` (dans le corps de la requête).
`,
  syntax: '<form action="/envoi" method="post"> … </form>',
  examples: [
    {
      code: '<form>\n  <label for="callsign">Indicatif</label>\n  <input type="text" id="callsign" name="callsign">\n  <button type="submit">Envoyer</button>\n</form>',
      caption: "Un formulaire minimal avec un champ et un bouton.",
    },
  ],
  pitfalls: [
    "Des champs hors d'un <form> ne sont pas envoyés ensemble.",
    "Chaque champ a besoin d'un name pour être transmis.",
  ],
  related: ["html/input", "html/label", "html/button", "html/select"],
  official: {
    label: "MDN — <form>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/form",
  },
};
