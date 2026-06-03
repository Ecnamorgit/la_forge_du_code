import type { ChapterData } from "@/data/courses/html/types";

export const chapitre12: ChapterData = {
  slug: "chapitre-12",
  tag: "MISSION : PROTOCOLES IMPERIAUX",
  title: "API REST &\nMETHODES HTTP",
  subtitle: "Maitrise les verbes du protocole pour piloter un serveur",
  totalXp: 280,
  completionBadge: "🛰",
  completionBadgeLabel: "OPERATEUR API",
  steps: [
    {
      startCode:
        "// Recupere la liste des vaisseaux via GET sur 'https://api.codeforge.space/vaisseaux'.\n// Logge le tableau recu. Utilise async/await.\n",
      placeholder: "// async function listerVaisseaux() { ... }",
      narrator:
        "Une API REST expose des ressources accessibles via des verbes HTTP. Le plus courant : GET, pour LIRE des donnees. Recupere la flotte complete depuis le serveur central.",
      hint: "async function listerVaisseaux() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  const flotte = await res.json();\n  console.log(flotte);\n}\nlisterVaisseaux();",
      briefing: {
        title: "REST et le verbe GET",
        content: `
### Qu'est-ce qu'une API REST ?
REST (REpresentational State Transfer) est une convention pour structurer les APIs web. Chaque ressource (vaisseau, pilote, mission...) a une URL, et on agit dessus avec des verbes HTTP.

### Les 4 verbes essentiels
| Verbe | Role | Exemple |
|-------|------|---------|
| GET | LIRE | Recuperer la liste des vaisseaux |
| POST | CREER | Ajouter un nouveau vaisseau |
| PUT | METTRE A JOUR | Modifier un vaisseau existant |
| DELETE | SUPPRIMER | Retirer un vaisseau de la flotte |

### GET, le verbe par defaut
\`fetch()\` utilise GET par defaut. Pas besoin de le specifier explicitement.

**A retenir :** GET = lecture seule. Une requete GET ne doit JAMAIS modifier l'etat du serveur.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser fetch sans option (GET par defaut)" },
        { id: "o1b", label: "Verifier response.ok et logger les donnees" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 01",
      missionTtl: "LECTURE REST",
      bannerIcon: "🛰",
      bannerTtl: "FLOTTE RECENSEE",
      bannerSub: "Le serveur a envoye le manifeste complet des vaisseaux.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Envoie une requete POST vers 'https://api.codeforge.space/vaisseaux'.\n// Le body doit contenir { nom: 'Phoenix', classe: 'cargo' } au format JSON.\n// N'oublie pas le header Content-Type.\n",
      placeholder: "// fetch(url, { method: 'POST', headers: {...}, body: JSON.stringify(...) })",
      narrator:
        "Tu dois enregistrer un nouveau vaisseau dans la flotte. Pour CREER une ressource, on utilise POST avec un corps de requete contenant les donnees au format JSON.",
      hint: "async function ajouterVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' })\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  const cree = await res.json();\n  console.log(cree);\n}\najouterVaisseau();",
      briefing: {
        title: "POST : creer une ressource",
        content: `
### La structure d'un POST
Trois ingredients indispensables :
1. **method: 'POST'** pour declarer l'intention de creer
2. **headers** avec \`Content-Type: application/json\`
3. **body** contenant les donnees, converties avec \`JSON.stringify()\`

### Pourquoi JSON.stringify ?
Le reseau ne transporte que du texte. Sans la conversion, le serveur recevrait "[object Object]" — un grand classique du debogage.

**A retenir :** POST = creation. Le serveur renvoie generalement la ressource creee (avec son nouvel id).
        `,
      },
      objectives: [
        { id: "o2a", label: "Specifier method, headers et body" },
        { id: "o2b", label: "Convertir l'objet avec JSON.stringify" },
      ],
      missionIcon: "📤",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CREATION POST",
      bannerIcon: "📤",
      bannerTtl: "VAISSEAU ENREGISTRE",
      bannerSub: "Le serveur a accepte le nouveau membre de la flotte.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Mets a jour le vaisseau d'ID 42 via PUT sur 'https://api.codeforge.space/vaisseaux/42'.\n// Le nouveau body : { nom: 'Phoenix II', classe: 'combat' }.\n",
      placeholder: "// fetch(url, { method: 'PUT', ... })",
      narrator:
        "Le Phoenix a ete reconverti en vaisseau de combat. Mets a jour son enregistrement avec la methode PUT, qui remplace une ressource existante.",
      hint: "async function modifierVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux/42', {\n    method: 'PUT',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' })\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  console.log('Mise a jour OK');\n}\nmodifierVaisseau();",
      briefing: {
        title: "PUT : mettre a jour",
        content: `
### URL avec identifiant
Pour cibler UNE ressource precise, on ajoute son id a l'URL :
- GET \`/vaisseaux\` -> tous
- GET \`/vaisseaux/42\` -> uniquement le 42
- PUT \`/vaisseaux/42\` -> remplace le 42
- DELETE \`/vaisseaux/42\` -> supprime le 42

### PUT vs PATCH
- **PUT** remplace TOUTE la ressource (tu envoies tous les champs)
- **PATCH** modifie UNE PARTIE (tu envoies juste les champs a changer)

### Idempotence
PUT est dit "idempotent" : envoyer la meme requete 10 fois donne le meme resultat qu'une seule. POST, lui, creerait 10 ressources differentes.

**A retenir :** PUT = mise a jour complete. L'URL contient l'id de la ressource ciblee.
        `,
      },
      objectives: [
        { id: "o3a", label: "Cibler la ressource par son id dans l'URL" },
        { id: "o3b", label: "Utiliser method: 'PUT' avec le body complet" },
      ],
      missionIcon: "✏",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MISE A JOUR PUT",
      bannerIcon: "✏",
      bannerTtl: "DOSSIER ACTUALISE",
      bannerSub: "Le Phoenix II est desormais inscrit comme vaisseau de combat.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Supprime le vaisseau d'ID 7 via DELETE sur 'https://api.codeforge.space/vaisseaux/7'.\n// Verifie response.ok et logge 'Vaisseau retire de la flotte' en cas de succes.\n",
      placeholder: "// fetch(url, { method: 'DELETE' })",
      narrator:
        "Le vaisseau 7 a ete demantele. Retire-le du registre central avec la methode DELETE. C'est la derniere des operations CRUD.",
      hint: "async function supprimerVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux/7', {\n    method: 'DELETE'\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  console.log('Vaisseau retire de la flotte');\n}\nsupprimerVaisseau();",
      briefing: {
        title: "DELETE : supprimer",
        content: `
### La requete la plus simple
DELETE ne necessite ni headers ni body dans la majorite des cas. Juste l'URL avec l'id, et la methode.

### Le pattern CRUD complet
Tu maitrises maintenant les 4 operations fondamentales :
- **C**reate -> POST
- **R**ead -> GET
- **U**pdate -> PUT (ou PATCH)
- **D**elete -> DELETE

C'est le socle de 90% des applications web.

### Codes de reponse a connaitre
- **200 OK** : succes
- **201 Created** : ressource creee (POST)
- **204 No Content** : succes mais pas de corps (DELETE)
- **400 Bad Request** : requete mal formee
- **401 Unauthorized** : non authentifie
- **404 Not Found** : ressource introuvable
- **500 Internal Server Error** : panne serveur

**A retenir :** GET/POST/PUT/DELETE + JSON + codes HTTP = vocabulaire universel de toute API moderne.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser method: 'DELETE' sur la ressource ciblee" },
        { id: "o4b", label: "Verifier response.ok avant de confirmer le succes" },
      ],
      missionIcon: "🗑",
      missionTag: "PROTOCOLE 04",
      missionTtl: "SUPPRESSION DELETE",
      bannerIcon: "🛰",
      bannerTtl: "CRUD MAITRISE",
      bannerSub: "Tu maitrises les 4 verbes du protocole REST.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
