import type { DocEntry } from "../types";

export const doctype: DocEntry = {
  id: "html/doctype",
  domain: "html",
  term: "<!DOCTYPE html>",
  title: "La déclaration <!DOCTYPE html>",
  summary:
    "La toute première ligne d'une page : elle indique au navigateur d'interpréter le document en HTML5.",
  body: `
### À quoi ça sert
**<!DOCTYPE html>** n'est pas une balise : c'est une *déclaration*. Elle se place tout en haut du fichier et annonce au navigateur : « lis ce document comme du HTML5 moderne ».

### Pourquoi c'est obligatoire
Sans elle, les navigateurs basculent en *mode quirks*, un mode de compatibilité ancien où la mise en page se comporte de façon imprévisible.
`,
  syntax: "<!DOCTYPE html>",
  examples: [
    {
      code: "<!DOCTYPE html>\n<html>\n</html>",
      caption: "La déclaration précède toujours la balise <html>.",
    },
  ],
  pitfalls: [
    "Elle doit être la première ligne, avant tout autre contenu (même un espace avant peut poser problème).",
    "Elle ne se ferme pas : il n'y a pas de </!DOCTYPE>.",
  ],
  related: ["html/html-element"],
  official: {
    label: "MDN — Doctype",
    url: "https://developer.mozilla.org/fr/docs/Glossary/Doctype",
  },
};
