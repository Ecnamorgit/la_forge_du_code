import type { DocEntry } from "../types";

export const htmlElement: DocEntry = {
  id: "html/html-element",
  domain: "html",
  term: "<html>",
  title: "L'élément racine <html>",
  summary:
    "La balise qui englobe toute la page : tout le contenu HTML vit à l'intérieur.",
  body: `
### La racine de l'arbre
En HTML, tout fonctionne par **emboîtement**. **<html>** est la racine : c'est la boîte qui contient toutes les autres.

### Ouvrir et fermer
- On l'ouvre au début : \`<html>\`
- On la ferme à la fin : \`</html>\` (le slash **/** marque la fermeture).
`,
  syntax: "<html>\n  <!-- head + body -->\n</html>",
  examples: [
    {
      code: "<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>",
      caption: "<html> contient toujours <head> puis <body>.",
    },
  ],
  pitfalls: ["Oublier la balise fermante </html>."],
  related: ["html/doctype", "html/head"],
  official: {
    label: "MDN — <html>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/html",
  },
};
