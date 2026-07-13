import type { DocEntry } from "../types";

export const localStorageDoc: DocEntry = {
  id: "js/localstorage",
  domain: "js",
  term: "localStorage",
  title: "Stockage local",
  summary:
    "localStorage conserve des paires clé/valeur (strings) dans le navigateur, même après fermeture.",
  body: `
### Écrire & lire
\`localStorage.setItem('cle', 'valeur')\` et \`localStorage.getItem('cle')\` (renvoie null si absent).

### Objets
Seules des strings sont stockées : \`JSON.stringify\` avant, \`JSON.parse\` en lecture.
`,
  syntax: "localStorage.setItem('theme', 'dark');\nconst t = localStorage.getItem('theme');",
  examples: [
    { code: "localStorage.setItem('user', JSON.stringify(obj));", caption: "Stocker un objet via JSON." },
  ],
  pitfalls: [
    "Tout est stocké en string ; un number ressort en string.",
    "getItem renvoie null (pas undefined) quand la clé n'existe pas.",
  ],
  related: ["js/objets", "js/fetch"],
  official: { label: "MDN — localStorage", url: "https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage" },
};
