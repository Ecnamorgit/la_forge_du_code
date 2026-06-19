import type { DocEntry } from "../types";

export const input: DocEntry = {
  id: "html/input",
  domain: "html",
  term: "<input>",
  title: "Le champ <input> et ses types",
  summary:
    "Le champ de saisie polyvalent. Son attribut type change la validation, le clavier mobile et l'apparence.",
  body: `
### À quoi ça sert
**<input>** est une balise **auto-fermante** qui capte une saisie. L'attribut **type** en change le comportement :
- **text** : texte simple.
- **email** : valide la présence d'un @ et propose le bon clavier mobile.
- **password** : masque les caractères.

### Attributs clés
- **name** : nom logique du champ (envoi).
- **id** : identifiant unique, cible du \`<label for="…">\`.
`,
  syntax: '<input type="email" id="mail" name="mail">',
  examples: [
    {
      code: '<input type="text" id="callsign" name="callsign">\n<input type="email" id="mail" name="mail">\n<input type="password" id="pwd" name="pwd">',
      caption: "Trois types de champ pour trois usages.",
    },
  ],
  pitfalls: [
    "type=\"text\" pour un email prive le navigateur de sa validation native.",
    "Sans id, le <label for> ne peut pas s'associer au champ.",
  ],
  related: ["html/label", "html/form"],
  official: {
    label: "MDN — <input>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/input",
  },
};
