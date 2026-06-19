import type { DocEntry } from "../types";

export const picture: DocEntry = {
  id: "html/picture",
  domain: "html",
  term: "<picture>",
  title: "Images adaptatives : srcset et <picture>",
  summary:
    "Servent la bonne image selon l'écran : srcset varie la résolution, <picture> varie le format.",
  body: `
### srcset + sizes (sur <img>)
**srcset** liste plusieurs versions d'une image avec leur largeur réelle ; **sizes** indique la largeur d'affichage prévue. Le navigateur télécharge le fichier le plus adapté.

### <picture> + <source>
**<picture>** fait varier le **format** : il lit ses \`<source>\` dans l'ordre et prend le premier lisible. Le \`<img>\` final est **obligatoire** (fallback + attribut alt).
`,
  syntax: "<picture> <source …> <img src=… alt=…> </picture>",
  examples: [
    {
      code: '<picture>\n  <source srcset="lune.webp" type="image/webp">\n  <source srcset="lune.jpg" type="image/jpeg">\n  <img src="lune.jpg" alt="Surface lunaire">\n</picture>',
      caption: "WebP moderne avec repli JPG.",
    },
  ],
  pitfalls: [
    "Oublier le <img> final dans <picture> casse le fallback et perd le alt.",
    "srcset ne change que la résolution ; pour le format, il faut <picture>.",
  ],
  related: ["html/img", "html/video"],
  official: {
    label: "MDN — <picture>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/picture",
  },
};
