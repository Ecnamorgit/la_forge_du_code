import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : CENTRE DE COMMANDEMENT",
  title: "NODE.JS &\nEXPRESS",
  subtitle: "Construis ton propre serveur d'API",
  totalXp: 280,
  completionBadge: "🛸",
  completionBadgeLabel: "ARCHITECTE BACK-END",
  steps: [
    {
      startCode:
        "// Importe express, cree une application, et fais-la ecouter sur le port 3000.\n// Affiche 'Serveur en ligne sur le port 3000' au demarrage.\n",
      placeholder: "// const app = express(); app.listen(3000, ...)",
      narrator:
        "Jusqu'ici tu consommais des APIs faites par d'autres. Maintenant tu vas en CRÉER une. Node.js execute du JavaScript côté serveur, et Express est le framework qui rend la création d'API simple.",
      hint: "import express from 'express';\n\nconst app = express();\n\napp.listen(3000, () => {\n  console.log('Serveur en ligne sur le port 3000');\n});",
      briefing: {
        title: "Node.js et Express",
        content: `
### Node.js
Node.js est un environnement qui execute du JavaScript en dehors du navigateur, directement sur ta machine ou un serveur. Tu peux lire des fichiers, ouvrir des connexions réseau, manipuler une base de données.

### Express
Express est le framework HTTP minimaliste de Node. Il s'installe avec :
\`npm install express\`

### L'application Express
\`import express from 'express';\`
\`const app = express();\`

\`app\` est ton serveur. Tu vas y attacher des routes (GET, POST...) puis le faire écouter sur un port.

### app.listen
Le port est un numero de "porte" réseau. Par convention :
- **3000** ou **8080** -> developpement local
- **80** -> HTTP en production
- **443** -> HTTPS en production

\`app.listen(3000, () => console.log('Pret'));\`

### Le fichier package.json
Tout projet Node a un \`package.json\` qui liste les dependances. \`npm init -y\` le cree automatiquement. \`"type": "module"\` permet d'utiliser \`import\` au lieu de \`require\`.

**À retenir :** Node execute du JS côté serveur. Express te donne les briques HTTP. listen ouvre la porte aux clients.
        `,
      },
      objectives: [
        { id: "o1a", label: "Créer une app Express" },
        { id: "o1b", label: "Faire écouter le serveur sur le port 3000" },
      ],
      missionIcon: "🛸",
      missionTag: "PROTOCOLE 01",
      missionTtl: "BOOT SERVEUR",
      bannerIcon: "🛸",
      bannerTtl: "SERVEUR EN LIGNE",
      bannerSub: "Ton centre de commandement est opérationnel.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Ajoute une route GET /ping qui repond avec un objet JSON : { status: 'ok' }.\nimport express from 'express';\nconst app = express();\n\n// ... ta route ici ...\n\napp.listen(3000, () => console.log('Serveur en ligne'));\n",
      placeholder: "// app.get('/ping', (req, res) => res.json({...}))",
      narrator:
        "Un serveur sans routes ne sert a rien. Ajoute ta première route GET qui répond a une requête avec un objet JSON. C'est la base de toute API.",
      hint: "import express from 'express';\nconst app = express();\n\napp.get('/ping', (req, res) => {\n  res.json({ status: 'ok' });\n});\n\napp.listen(3000, () => console.log('Serveur en ligne'));",
      briefing: {
        title: "Routes et reponses JSON",
        content: `
### Déclarer une route
\`app.METHODE(chemin, gestionnaire);\`

- MÉTHODE : \`get\`, \`post\`, \`put\`, \`delete\`...
- chemin : l'URL relative (\`/ping\`, \`/vaisseaux\`...)
- gestionnaire : la fonction qui sera exécutée à chaque requête sur cette route

### req et res
Deux objets te sont passes à chaque appel :
- **req** (request) : tout ce que le client envoie (URL, headers, body, params...)
- **res** (response) : ce que tu vas renvoyer

### Repondre en JSON
\`res.json({ status: 'ok' });\`

\`res.json()\` fait deux choses :
1. Convertit l'objet en JSON
2. Met automatiquement le header \`Content-Type: application/json\`

### Autres méthodes de réponse
- \`res.send('texte')\` -> texte brut ou HTML
- \`res.status(201).json(...)\` -> avec un code HTTP custom
- \`res.sendStatus(204)\` -> juste un code, sans corps

### Tester la route
Une fois le serveur lance, ouvre dans le navigateur : \`http://localhost:3000/ping\` ou en CLI : \`curl http://localhost:3000/ping\`.

**À retenir :** Route = chemin + verbe + handler. Le handler reçoit (req, res) et appelle une méthode sur res pour repondre.
        `,
      },
      objectives: [
        { id: "o2a", label: "Définir une route GET sur /ping" },
        { id: "o2b", label: "Repondre avec res.json et l'objet { status: 'ok' }" },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 02",
      missionTtl: "PREMIÈRE ROUTE",
      bannerIcon: "📡",
      bannerTtl: "PING ACTIF",
      bannerSub: "Ton serveur répond aux requetes du client.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Active la lecture du JSON dans les requetes entrantes.\n// Ajoute une route POST /vaisseaux qui recoit { nom, classe } dans le body,\n// et repond avec le meme objet et le statut 201.\n",
      placeholder: "// app.use(express.json()); app.post(...)",
      narrator:
        "Pour CRÉER une ressource, le client envoie un POST avec un body JSON. Mais par défaut, Express ne lit pas le body. Active le middleware express.json() pour parser le contenu.",
      hint: "import express from 'express';\nconst app = express();\n\napp.use(express.json());\n\napp.post('/vaisseaux', (req, res) => {\n  const { nom, classe } = req.body;\n  res.status(201).json({ nom, classe });\n});\n\napp.listen(3000);",
      briefing: {
        title: "POST, body et middlewares",
        content: `
### Les middlewares
Un **middleware** est une fonction qui s'execute AVANT tes routes, pour preparer la requête. \`express.json()\` est un middleware qui :
1. Lit le body de la requête
2. Le parse en objet JavaScript
3. Le place dans \`req.body\`

\`app.use(express.json());\`

Sans cette ligne, \`req.body\` est \`undefined\`. C'est LE piège n°1 des juniors sur Express.

### Lire le body
Une fois le middleware actif :
\`app.post('/vaisseaux', (req, res) => {\`
\`  const { nom, classe } = req.body;\`
\`  // ... logique ...\`
\`});\`

### Les codes HTTP
- \`res.status(200).json(...)\` -> OK
- \`res.status(201).json(...)\` -> Created (après un POST réussi)
- \`res.status(400).json({ error: '...' })\` -> mauvaise requête
- \`res.status(404).json({ error: 'Not found' })\` -> ressource introuvable
- \`res.status(500).json({ error: '...' })\` -> erreur serveur

### Valider les entrees
TOUJOURS valider \`req.body\` avant de l'utiliser : un client peut envoyer n'importe quoi. Les bibliotheques pro : **Zod**, **Joi**, **Yup**.

\`if (!nom) return res.status(400).json({ error: 'nom requis' });\`

**À retenir :** express.json() obligatoire pour lire un body JSON. status(201) pour signaler une création reussie.
        `,
      },
      objectives: [
        { id: "o3a", label: "Activer le middleware express.json()" },
        { id: "o3b", label: "Lire req.body et repondre avec status 201" },
      ],
      missionIcon: "📥",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ROUTE POST",
      bannerIcon: "📥",
      bannerTtl: "REQUÊTE TRAITEE",
      bannerSub: "Ton serveur sait recevoir et lire des données clientes.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Ajoute une route GET /vaisseaux/:id qui :\n//  - recupere l'id depuis l'URL\n//  - si id === '42', repond { id: 42, nom: 'Phoenix' }\n//  - sinon, repond avec un status 404 et { error: 'Not found' }\n",
      placeholder: "// app.get('/vaisseaux/:id', (req, res) => { ... })",
      narrator:
        "Mission finale : les paramètres d'URL dynamiques. Une route comme `/vaisseaux/:id` capture la valeur passée dans l'URL. C'est avec ca qu'on construit de vraies APIs REST.",
      hint: "import express from 'express';\nconst app = express();\n\napp.get('/vaisseaux/:id', (req, res) => {\n  const { id } = req.params;\n  if (id === '42') {\n    return res.json({ id: 42, nom: 'Phoenix' });\n  }\n  res.status(404).json({ error: 'Not found' });\n});\n\napp.listen(3000);",
      briefing: {
        title: "Paramètres dynamiques et REST",
        content: `
### Les params d'URL
Le \`:\` déclare un segment dynamique dans la route :
\`app.get('/vaisseaux/:id', ...)\`

Une requête vers \`/vaisseaux/42\` est captee, et \`req.params.id\` vaut \`'42'\`.

**Note** : les params sont TOUJOURS des chaînes, même si l'URL ressemble a un nombre. Pour comparer a un nombre : \`Number(req.params.id)\`.

### Les query strings
Pour les filtres optionnels (\`/vaisseaux?classe=combat\`), on utilise \`req.query\` :
\`const { classe } = req.query; // 'combat'\`

### Une API REST complete
Avec les briques apprises, tu peux maintenant écrire un CRUD complet :

\`app.get('/vaisseaux', listerTous);\`
\`app.get('/vaisseaux/:id', recupererUn);\`
\`app.post('/vaisseaux', creer);\`
\`app.put('/vaisseaux/:id', modifier);\`
\`app.delete('/vaisseaux/:id', supprimer);\`

### La suite logique
- **Base de données** : connecter ton API a PostgreSQL/MongoDB (souviens-toi de la mission SQL)
- **Authentification** : JWT, sessions, OAuth
- **Validation** : Zod sur req.body et req.params
- **Tests** : Vitest + Supertest pour tester les routes
- **Déploiement** : Render, Railway, Fly.io, ou Docker sur un VPS

### Une alternative moderne
**Fastify** (plus rapide) et **NestJS** (architecture entreprise, decorateurs, modules) sont des concurrents serieux d'Express. Mais Express reste la porte d'entrée la plus accessible.

**À retenir :** :param -> req.params, ?query -> req.query. Les params transforment ton serveur en VRAIE API REST.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir une route avec un param :id" },
        { id: "o4b", label: "Lire req.params et gérer le cas 404" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ROUTE DYNAMIQUE",
      bannerIcon: "🛸",
      bannerTtl: "API OPÉRATIONNELLE",
      bannerSub: "Tu as construit ta première API REST de A a Z. Bienvenue côté serveur.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
