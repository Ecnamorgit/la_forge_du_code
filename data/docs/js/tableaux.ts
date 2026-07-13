import type { DocEntry } from "../types";

export const tableaux: DocEntry = {
  id: "js/tableaux",
  domain: "js",
  term: "Array",
  title: "Tableaux & boucles",
  summary:
    "Un tableau est une liste ordonnée, indexée à partir de 0 ; on la parcourt avec une boucle.",
  body: `
### Déclarer & accéder
\`const flotte = ["Alpha", "Bravo"];\`. Accès par index : \`flotte[0]\`. Taille : \`flotte.length\`.

### Parcourir
Boucle \`for\` classique, ou \`for...of\` pour itérer les valeurs. Méthodes utiles : \`push\`, \`pop\`.
`,
  syntax: "for (let i = 0; i < flotte.length; i++) {\n  console.log(flotte[i]);\n}",
  examples: [
    { code: "for (const nom of flotte) console.log(nom);", caption: "for...of : plus lisible pour parcourir les valeurs." },
  ],
  pitfalls: [
    "Le premier élément a l'index 0, le dernier length - 1.",
    "flotte[flotte.length] est toujours undefined (hors bornes).",
  ],
  related: ["js/array-methods", "js/objets"],
  official: { label: "MDN — Array", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array" },
};
