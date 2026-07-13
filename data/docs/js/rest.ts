import type { DocEntry } from "../types";

export const rest: DocEntry = {
  id: "js/rest",
  domain: "js",
  term: "REST",
  title: "API REST & HTTP",
  summary:
    "REST structure une API autour de ressources manipulées par des verbes HTTP : GET, POST, PUT, DELETE.",
  body: `
### Les verbes
- **GET** : lire (jamais modifier).
- **POST** : créer.
- **PUT** : mettre à jour.
- **DELETE** : supprimer.

### Avec fetch
On passe la méthode et le corps : \`fetch(url, { method: 'POST', body: JSON.stringify(data) })\`.
`,
  syntax: "await fetch('/api/vaisseaux', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(v),\n});",
  examples: [
    { code: "await fetch('/api/vaisseaux/3', { method: 'DELETE' });", caption: "Supprime la ressource d'id 3." },
  ],
  pitfalls: [
    "GET doit rester en lecture seule : ne jamais l'utiliser pour modifier l'état.",
    "Pour envoyer du JSON, préciser l'en-tête Content-Type: application/json.",
  ],
  related: ["js/fetch", "js/async"],
  official: { label: "MDN — Méthodes HTTP", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Methods" },
};
