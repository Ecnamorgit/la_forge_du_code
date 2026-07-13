import type { DocEntry } from "../types";

export const jsAsync: DocEntry = {
  id: "js/async",
  domain: "js",
  term: "async / await",
  title: "Promises & async",
  summary:
    "Une Promise représente un résultat futur ; async/await l'attend sans bloquer, en écriture linéaire.",
  body: `
### Promise
Trois états : pending, fulfilled (valeur), rejected (erreur). On la consomme avec \`.then()\` / \`.catch()\`.

### async/await
Dans une fonction \`async\`, \`await\` suspend jusqu'à la résolution, puis renvoie la valeur.
`,
  syntax: "async function charger() {\n  const v = await maPromise;\n  console.log(v);\n}",
  examples: [
    { code: "promise.then((v) => console.log(v)).catch((e) => console.error(e));", caption: "Version .then / .catch." },
  ],
  pitfalls: [
    "await n'est utilisable que dans une fonction async.",
    "Oublier .catch (ou try/catch) laisse une erreur non gérée.",
  ],
  related: ["js/fetch", "js/fonctions"],
  official: { label: "MDN — async/await", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function" },
};
