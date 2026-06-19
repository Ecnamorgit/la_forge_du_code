import type { DocEntry } from "../types";

export const aria: DocEntry = {
  id: "html/aria",
  domain: "html",
  term: "aria-current",
  title: "Accessibilité : alt et ARIA",
  summary:
    "Des attributs qui rendent la page compréhensible par les lecteurs d'écran et les moteurs de recherche.",
  body: `
### L'attribut alt
Sur une \`<img>\`, **alt** décrit l'image pour qui ne la voit pas. Une image **décorative** prend \`alt=""\` (le lecteur l'ignore) ; une image **porteuse de sens** décrit ce qu'elle montre.

### ARIA en 30 secondes
**ARIA** ajoute des informations invisibles à l'œil mais lues par les technologies d'assistance. Le plus courant : **aria-current="page"** marque le lien de la page en cours dans un menu.
`,
  syntax: '<a href="/" aria-current="page">Accueil</a>',
  examples: [
    {
      code: '<img src="lune.png" alt="Surface lunaire vue depuis l\'orbite">\n<a href="/" aria-current="page">Accueil</a>',
      caption: "Image décrite et lien actif signalé.",
    },
  ],
  pitfalls: [
    "alt=\"\" sur une image informative la rend invisible aux lecteurs d'écran.",
    "ARIA complète le HTML : préfère toujours une balise native quand elle existe.",
  ],
  related: ["html/img", "html/nav"],
  official: {
    label: "MDN — ARIA",
    url: "https://developer.mozilla.org/fr/docs/Web/Accessibility/ARIA",
  },
};
