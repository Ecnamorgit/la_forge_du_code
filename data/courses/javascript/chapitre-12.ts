import type { ChapterData } from "@/data/courses/html/types";

export const chapitre12: ChapterData = {
  slug: "chapitre-12",
  tag: "MISSION : PROTOCOLES IMPERIAUX",
  title: "API REST &\nMETHODES HTTP",
  subtitle: "Maîtrise les verbes du protocole pour piloter un serveur",
  totalXp: 280,
  completionBadge: "🛰",
  completionBadgeLabel: "OPÉRATEUR API",
  steps: [
    {
      startCode:
        "// Recupere la liste des vaisseaux via GET sur 'https://api.codeforge.space/vaisseaux'.\n// Logge le tableau recu. Utilise async/await.\n",
      placeholder: "// async function listerVaisseaux() { ... }",
      narrator:
        "Une API REST expose des ressources accessibles via des verbes HTTP. Le plus courant : GET, pour LIRE des données. Récupère la flotte complète depuis le serveur central.",
      hint: "async function listerVaisseaux() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  const flotte = await res.json();\n  console.log(flotte);\n}\nlisterVaisseaux();",
      briefing: {
        title: "REST et le verbe GET",
        content: `
*« Un serveur bien tenu obéit à des verbes précis. GET pour lire, et rien d'autre — on ne bouscule pas l'état du central pour une simple consultation. »* — **Kira**

### Qu'est-ce qu'une API REST ?
REST (REpresentational State Transfer) est une convention pour structurer les APIs web. Chaque ressource (vaisseau, pilote, mission...) a une URL, et on agit dessus avec des verbes HTTP.

### Les 4 verbes essentiels
| Verbe | Rôle | Exemple |
|-------|------|---------|
| GET | LIRE | Récupérer la liste des vaisseaux |
| POST | CRÉER | Ajouter un nouveau vaisseau |
| PUT | METTRE À JOUR | Modifier un vaisseau existant |
| DELETE | SUPPRIMER | Retirer un vaisseau de la flotte |

### GET, le verbe par défaut
\`fetch()\` utilise GET par défaut. Pas besoin de le spécifier explicitement.

**À retenir :** GET = lecture seule. Une requête GET ne doit JAMAIS modifier l'état du serveur.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser fetch sans option (GET par défaut)" },
        { id: "o1b", label: "Vérifier response.ok et logger les données" },
      ],
      docRefs: ["js/rest"],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 01",
      missionTtl: "LECTURE REST",
      bannerIcon: "🛰",
      bannerTtl: "FLOTTE RÉCENSEE",
      bannerSub: "Le serveur a envoyé le manifeste complet des vaisseaux.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Envoie une requête POST vers 'https://api.codeforge.space/vaisseaux'.\n// Le body doit contenir { nom: 'Phoenix', classe: 'cargo' } au format JSON.\n// N'oublie pas le header Content-Type.\n",
      placeholder: "// fetch(url, { method: 'POST', headers: {...}, body: JSON.stringify(...) })",
      narrator:
        "Tu dois enregistrer un nouveau vaisseau dans la flotte. Pour CRÉER une ressource, on utilise POST avec un corps de requête contenant les données au format JSON.",
      hint: "async function ajouterVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' })\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  const cree = await res.json();\n  console.log(cree);\n}\najouterVaisseau();",
      briefing: {
        title: "POST : créer une ressource",
        content: `
### La structure d'un POST
Trois ingrédients indispensables :
1. **method: 'POST'** pour déclarer l'intention de créer
2. **headers** avec \`Content-Type: application/json\`
3. **body** contenant les données, converties en JSON

### Content-Type
Le header \`Content-Type: application/json\` indique au serveur que le corps de la requête est au format JSON.

### Idempotence
POST n'est pas idempotent : envoyer la même requête 10 fois créera 10 ressources différentes.

**À retenir :** POST = création d'une nouvelle ressource. Le serveur renvoie généralement un code 201 Created en cas de succès.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser method: 'POST' avec le bon header" },
        { id: "o2b", label: "Envoyer les données au format JSON dans le body" },
      ],
      missionIcon: "🚀",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CRÉATION POST",
      bannerIcon: "🚀",
      bannerTtl: "VAISSSEAU AJOUTÉ",
      bannerSub: "Le vaisseau Phoenix a été ajouté à la flotte.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Modifie le vaisseau d'ID 42 via PUT sur 'https://api.codeforge.space/vaisseaux/42'.\n// Le body doit contenir les nouvelles données { nom: 'Nebulon', classe: 'escadre' } au format JSON.\n",
      placeholder: "// fetch(url, { method: 'PUT', headers: {...}, body: JSON.stringify(...) })",
      narrator:
        "Le vaisseau 42 a été modifié. Met à jour ses informations dans le registre central avec la méthode PUT. Cette opération remplace complètement les données existantes par de nouvelles valeurs.",
      hint: "async function modifierVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux/42', {\n    method: 'PUT',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nom: 'Nebulon', classe: 'escadre' })\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  console.log('Mise à jour OK');\n}\nmodifierVaisseau();",
      briefing: {
        title: "PUT : mettre à jour une ressource",
        content: `
### URL avec identifiant
Pour cibler UNE ressource précise, on ajoute son id à l'URL :
- GET \`/vaisseaux\` -> tous les vaisseaux
- GET \`/vaisseaux/42\` -> le vaisseau 42
- PUT \`/vaisseaux/42\` -> remplace toutes les informations du vaisseau 42

### PUT vs PATCH
- **PUT** remplace TOUTE la ressource (tu envoies tous les champs)
- **PATCH** modifie UNE PARTIE de la ressource (tu envoies juste les champs à changer)

### Idempotence
PUT est dit "idempotent" : envoyer la même requête 10 fois donne le même résultat qu'une seule. POST, lui, créerait 10 ressources différentes.

**À retenir :** PUT = mise à jour complète d'une ressource. L'URL contient l'id de la ressource ciblée.
        `,
      },
      objectives: [
        { id: "o3a", label: "Cibler la ressource par son ID dans l'URL" },
        { id: "o3b", label: "Utiliser method: 'PUT' avec les nouvelles données complètes" },
      ],
      missionIcon: "✏",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MISE À JOUR PUT",
      bannerIcon: "✏",
      bannerTtl: "INFORMATIONS MAJÉS",
      bannerSub: "Le vaisseau 42 a été mis à jour avec les nouvelles informations.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Supprime le vaisseau d'ID 13 via DELETE sur 'https://api.codeforge.space/vaisseaux/13'.\n// Vérifie response.ok et logge 'Vaisseau retiré de la flotte' en cas de succès.\n",
      placeholder: "// fetch(url, { method: 'DELETE' })",
      narrator:
        "Le vaisseau 13 a été décommissionné. Retire-le du registre central avec la méthode DELETE. C'est la dernière des opérations CRUD.",
      hint: "async function supprimerVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseaux/13', {\n    method: 'DELETE'\n  });\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  console.log('Vaisseau retiré de la flotte');\n}\nsupprimerVaisseau();",
      briefing: {
        title: "DELETE : supprimer une ressource",
        content: `
### La requête la plus simple
DELETE ne nécessite ni headers ni body dans la majorité des cas. Juste l'URL avec l'id, et la méthode.

### Le pattern CRUD complet
Tu maîtrises maintenant les 4 opérations fondamentales :
- **C**reate -> POST
- **R**ead -> GET
- **U**pdate -> PUT (ou PATCH)
- **D**elete -> DELETE

C'est le socle de 90% des applications web.

### Codes de réponse à connaître
- **200 OK** : succès
- **201 Created** : ressource créée (POST)
- **204 No Content** : succès mais pas de corps (DELETE)
- **400 Bad Request** : requête mal formée
- **401 Unauthorized** : non authentifié
- **404 Not Found** : ressource introuvable
- **500 Internal Server Error** : panne serveur

**À retenir :** GET/POST/PUT/DELETE + JSON + codes HTTP = vocabulaire universel de toute API moderne.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser method: 'DELETE' sur la ressource ciblée" },
        { id: "o4b", label: "Vérifier response.ok avant de confirmer le succès" },
      ],
      missionIcon: "🗑",
      missionTag: "PROTOCOLE 04",
      missionTtl: "SUPPRESSION DELETE",
      bannerIcon: "🚮",
      bannerTtl: "VAISSSEAU ÉLIMINÉ",
      bannerSub: "Le vaisseau 13 a été retiré de la flotte.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};