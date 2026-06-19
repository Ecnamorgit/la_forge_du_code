import type { DocEntry } from "../types";

export const link: DocEntry = {
  id: "html/link",
  domain: "html",
  term: "<link>",
  title: "La balise <link> et le favicon",
  summary:
    "Relie le document à des ressources externes : feuilles de style et, notamment, l'icône d'onglet (favicon).",
  body: `
### À quoi ça sert
**<link>** (auto-fermante, dans le \`<head>\`) connecte la page à une ressource via **rel** (la relation) et **href** (l'adresse). Cas le plus courant : la feuille de style et le **favicon**.

### Le favicon
\`<link rel="icon" href="/favicon.ico">\` définit la petite icône de l'onglet. Formats : \`.ico\`, \`.png\` (32×32/64×64), \`.svg\`.
`,
  syntax: '<link rel="icon" href="/favicon.ico">',
  examples: [
    {
      code: '<link rel="icon" type="image/svg+xml" href="/icon.svg">\n<link rel="icon" type="image/png" href="/icon.png">',
      caption: "Plusieurs déclarations : le navigateur choisit la meilleure.",
    },
  ],
  pitfalls: [
    "Ne confonds pas <link> (ressource) et <a> (lien cliquable).",
    "Un href de favicon vide ou erroné laisse l'onglet sans icône.",
  ],
  related: ["html/meta", "html/head"],
  official: {
    label: "MDN — <link>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/link",
  },
};
