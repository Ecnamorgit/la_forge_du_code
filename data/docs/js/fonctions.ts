import type { DocEntry } from "../types";

export const fonctions: DocEntry = {
  id: "js/fonctions",
  domain: "js",
  term: "function",
  title: "Fonctions",
  summary:
    "Une fonction encapsule un bloc réutilisable qui prend des paramètres et retourne une valeur.",
  body: `
### Déclarer & appeler
\`function nom(param) { return ...; }\`, puis \`nom(argument)\`.

### Fonction fléchée
Forme concise : \`const f = (x) => x * 2;\`. Sans \`return\` explicite pour un corps sur une ligne.
`,
  syntax: "function greet(name) {\n  return 'Bonjour, ' + name;\n}\ngreet('Cadet');",
  examples: [
    { code: "const double = (n) => n * 2;\ndouble(5); // 10", caption: "Fonction fléchée à retour implicite." },
  ],
  pitfalls: [
    "Une fonction sans return renvoie undefined.",
    "Les paramètres sont locaux à la fonction — invisibles à l'extérieur.",
  ],
  related: ["js/conditions", "js/tableaux"],
  official: { label: "MDN — Fonctions", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Functions" },
};
