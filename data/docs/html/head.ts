import type { DocEntry } from "../types";

export const head: DocEntry = {
  id: "html/head",
  domain: "html",
  term: "<head>",
  title: "La section <head>",
  summary:
    "La zone invisible de la page : métadonnées, titre d'onglet, liens vers les styles.",
  body: `
### Le centre de contrôle invisible
Le **<head>** contient ce que l'utilisateur ne voit pas directement mais qui dirige la page : le titre de l'onglet, la langue, les liens vers les feuilles de style.
`,
  syntax: "<head>\n  <title>Mon titre</title>\n</head>",
  examples: [
    {
      code: "<head>\n  <title>Base lunaire</title>\n</head>",
      caption: "Le <title> s'affiche dans l'onglet du navigateur.",
    },
  ],
  pitfalls: ["Mettre du contenu visible dans <head> : il n'apparaîtra pas."],
  related: ["html/html-element"],
  official: {
    label: "MDN — <head>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/head",
  },
};
