import type { DocEntry } from "../types";

export const openGraph: DocEntry = {
  id: "html/open-graph",
  domain: "html",
  term: 'og:title',
  title: "Open Graph : la carte de visite sociale",
  summary:
    "Des balises <meta property=\"og:…\"> qui contrôlent l'aperçu d'un lien partagé sur les réseaux sociaux.",
  body: `
### Le standard Open Graph
Créé par Facebook, adopté partout (LinkedIn, WhatsApp, Slack…). Il se déclare avec des \`<meta property="og:…">\` dans le \`<head>\`.

### Les trois balises critiques
- **og:title** : le titre de l'aperçu.
- **og:description** : le texte de l'aperçu.
- **og:image** : l'image (URL **absolue**, 1200×630 px idéalement).
`,
  syntax: '<meta property="og:title" content="Mon titre">',
  examples: [
    {
      code: '<meta property="og:title" content="Mission Lunaire">\n<meta property="og:description" content="Rejoins l\'équipage.">\n<meta property="og:image" content="https://exemple.com/preview.png">',
      caption: "Un aperçu social complet (titre, texte, image).",
    },
  ],
  pitfalls: [
    "Une og:image en URL relative ne s'affiche pas : utilise une URL absolue.",
    "Sans Open Graph, le lien partagé apparaît nu, sans image ni accroche.",
  ],
  related: ["html/meta"],
  official: {
    label: "MDN — Open Graph",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/meta/name#autres_métadonnées",
  },
};
