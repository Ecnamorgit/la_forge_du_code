import type { DocEntry } from "../types";

export const select: DocEntry = {
  id: "html/select",
  domain: "html",
  term: "<select>",
  title: "Le menu déroulant <select>",
  summary:
    "Propose un choix unique parmi une liste prédéfinie. Chaque entrée est une <option>.",
  body: `
### À quoi ça sert
**<select>** affiche une **liste déroulante**. L'utilisateur choisit une valeur parmi plusieurs **<option>**. Plus compact qu'une série de cases quand les choix sont limités.

### L'option par défaut
La première \`<option>\` est celle affichée au départ.
`,
  syntax: "<select> <option>…</option> <option>…</option> </select>",
  examples: [
    {
      code: '<select id="dest" name="dest">\n  <option>Mars</option>\n  <option>Lune</option>\n</select>',
      caption: "Un menu de destination à deux choix.",
    },
  ],
  pitfalls: [
    "Un <select> sans <option> est un menu vide, inutilisable.",
    "Pour un choix multiple, ajoute l'attribut multiple.",
  ],
  related: ["html/form"],
  official: {
    label: "MDN — <select>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/select",
  },
};
