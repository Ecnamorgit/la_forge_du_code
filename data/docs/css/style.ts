import type { DocEntry } from "../types";

export const cssStyle: DocEntry = {
  id: "css/style",
  domain: "css",
  term: "<style>",
  title: "Brancher le CSS",
  summary:
    "La balise <style>, placée dans le <head>, contient les règles CSS qui décorent la page.",
  body: `
### Où écrire le CSS
Trois façons : un fichier externe (\`<link rel="stylesheet">\`), une balise **<style>** dans le <head>, ou l'attribut \`style="..."\` sur un élément. Dans ce cursus, on utilise la balise <style>.

### Une règle CSS
Un **sélecteur** cible des éléments, puis un bloc \`{ propriété: valeur; }\` leur applique un style.
`,
  syntax: "<style>\n  h1 { color: cyan; }\n</style>",
  examples: [
    { code: "<style>\n  body { background: #03060d; }\n</style>", caption: "Fond sombre pour toute la page." },
  ],
  pitfalls: [
    "Oublier de fermer </style> casse le reste de la page.",
    "Une règle hors de <style> (dans le <body>) est affichée comme du texte.",
  ],
  related: ["css/selecteurs", "html/head"],
  official: { label: "MDN — Premiers pas CSS", url: "https://developer.mozilla.org/fr/docs/Learn/CSS/First_steps" },
};
