import type { DocEntry } from "../types";

export const meta: DocEntry = {
  id: "html/meta",
  domain: "html",
  term: "<meta>",
  title: "Les métadonnées <meta>",
  summary:
    "Des balises invisibles du <head> qui configurent l'encodage, le responsive et le résumé pour les moteurs de recherche.",
  body: `
### Les métadonnées indispensables
- **<meta charset="UTF-8">** : l'encodage des caractères (accents, emojis). À placer **en premier**.
- **<meta name="viewport" content="width=device-width, initial-scale=1">** : indispensable au **responsive** mobile.
- **<meta name="description" content="…">** : le résumé affiché sous le titre dans Google (120-160 caractères).

### lang
\`<html lang="fr">\` n'est pas un \`<meta>\` mais joue le même rôle d'identité : il déclare la langue du document.
`,
  syntax: '<meta name="description" content="Résumé de la page.">',
  examples: [
    {
      code: '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="Tutoriel HTML interactif et gamifié.">',
      caption: "Le trio charset + viewport + description.",
    },
  ],
  pitfalls: [
    "Sans viewport, un mobile affiche la page comme un desktop réduit, illisible.",
    "Une description trop longue est tronquée par Google au-delà de ~160 caractères.",
  ],
  related: ["html/open-graph", "html/link", "html/head"],
  official: {
    label: "MDN — <meta>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/meta",
  },
};
