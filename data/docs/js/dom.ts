import type { DocEntry } from "../types";

export const dom: DocEntry = {
  id: "js/dom",
  domain: "js",
  term: "document",
  title: "Manipuler le DOM",
  summary:
    "Le DOM expose la page à JavaScript : on crée, sélectionne et modifie les éléments via document.",
  body: `
### Sélectionner
\`document.querySelector('.classe')\` renvoie le premier élément correspondant.

### Créer & insérer
\`document.createElement('div')\`, remplir avec \`textContent\`, puis \`parent.appendChild(el)\`.
`,
  syntax: "const el = document.createElement('div');\nel.textContent = 'Salut';\ndocument.body.appendChild(el);",
  examples: [
    { code: "document.querySelector('#titre').textContent = 'Nouveau';", caption: "Modifie le texte d'un élément existant." },
  ],
  pitfalls: [
    "textContent est sûr ; innerHTML interprète le HTML (risque XSS avec de l'input utilisateur).",
    "Un élément créé n'est visible qu'une fois inséré dans le document.",
  ],
  related: ["js/events", "html/html-element"],
  official: { label: "MDN — Le DOM", url: "https://developer.mozilla.org/fr/docs/Web/API/Document_Object_Model/Introduction" },
};
