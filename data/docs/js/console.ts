import type { DocEntry } from "../types";

export const jsConsole: DocEntry = {
  id: "js/console",
  domain: "js",
  term: "console.log",
  title: "Afficher & les variables",
  summary:
    "console.log(...) affiche une valeur dans la console ; let/const déclarent des variables.",
  body: `
### Afficher
**console.log(x)** écrit \`x\` dans la console — l'outil n°1 pour observer ton code.

### Déclarer
- **let** : variable réassignable.
- **const** : constante (référence non réassignable).
Types de base : string (\`"texte"\`), number (\`42\`), boolean (\`true\`).
`,
  syntax: 'const nom = "Nebula";\nconsole.log(nom);',
  examples: [
    { code: 'let pv = 100;\npv = 80;\nconsole.log(pv); // 80', caption: "let autorise la réassignation." },
  ],
  pitfalls: [
    "const empêche de réassigner la variable, pas de muter un objet/tableau.",
    "Les chaînes ont besoin de guillemets ; sans eux, JS croit à une variable.",
  ],
  related: ["js/conditions", "js/fonctions"],
  official: { label: "MDN — console.log", url: "https://developer.mozilla.org/fr/docs/Web/API/console/log_static" },
};
