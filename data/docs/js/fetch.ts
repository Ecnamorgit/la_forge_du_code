import type { DocEntry } from "../types";

export const fetchDoc: DocEntry = {
  id: "js/fetch",
  domain: "js",
  term: "fetch()",
  title: "Réseau & fetch",
  summary:
    "fetch() envoie une requête HTTP et renvoie une Promise résolue avec la réponse du serveur.",
  body: `
### Récupérer des données
\`fetch(url)\` renvoie une Promise ; on lit le corps JSON avec \`response.json()\` (aussi async).

### En async/await
\`const res = await fetch(url); const data = await res.json();\`.
`,
  syntax: "const res = await fetch('https://api.exemple.com/data');\nconst data = await res.json();",
  examples: [
    { code: "fetch(url).then((r) => r.json()).then((d) => console.log(d));", caption: "Version chaînée avec .then." },
  ],
  pitfalls: [
    "fetch ne rejette pas sur une erreur HTTP (404/500) : vérifier response.ok.",
    "response.json() est asynchrone — il faut aussi l'attendre.",
  ],
  related: ["js/async", "js/rest"],
  official: { label: "MDN — fetch", url: "https://developer.mozilla.org/fr/docs/Web/API/Window/fetch" },
};
