import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : MISE EN ORBITE",
  title: "DÉPLOIEMENT &\nPRODUCTION",
  subtitle: "Mets ton application en ligne, accessible au monde entier",
  totalXp: 280,
  completionBadge: "🚀",
  completionBadgeLabel: "OFFICIER DE LANCEMENT",
  steps: [
    {
      startCode:
        "# Tu vas creer le bundle de production de ton app.\n# 1. Lance la commande de build.\n# 2. Verifie le dossier de sortie (dist ou build).\n# 3. Sers-le en local pour tester avant deploiement.\n",
      placeholder: "# npm run build / npm run preview",
      narrator:
        "Le code que tu écris en dev n'est pas celui qui tourne en prod. Le build minifie, optimise, tree-shake et bundle ton code pour qu'il soit ultra-rapide. Première étape avant tout déploiement.",
      hint: "npm run build\n# Genere le dossier dist/ (Vite) ou build/ (CRA / Next.js)\n\nnpm run preview\n# Sert le bundle de production en local sur http://localhost:4173\n# IMPORTANT : tester ici avant de deployer en prod",
      briefing: {
        title: "Build de production",
        content: `
### Pourquoi un build ?
En developpement, l'app est servie en clair : sources lisibles, sourcemaps, modules separes. En production, on veut :
- Du code MINIFIE (variables courtes, espaces supprimes)
- Du tree-shaking (seul ce qui est utilise est livre)
- Le bundling (fichiers regroupes pour réduire les requetes)
- Les sourcemaps separes (pour debugger sans alourdir le bundle)

### npm run build
Défini dans \`package.json\` :
\`"scripts": {\`
\`  "dev": "vite",\`
\`  "build": "vite build",\`
\`  "preview": "vite preview"\`
\`}\`

### Le dossier de sortie
- **Vite / CRA** -> \`dist/\` (Vite) ou \`build/\` (CRA)
- **Next.js** -> \`.next/\`
- **Statique** -> contient \`index.html\` + JS/CSS minifies + assets

### preview : tester avant de pousser
\`npm run preview\` lance un mini-serveur local qui sert le bundle exactement comme en prod. C'est OBLIGATOIRE avant le déploiement : certains bugs n'apparaissent qu'après le build (variables d'env oubliees, imports dynamiques cassants...).

### Vérifier la taille
Ouvre l'onglet Réseau du navigateur en preview. Si ton bundle initial fait > 1 MB, tu dois optimiser :
- Lazy loading des routes (React.lazy + Suspense)
- Code splitting
- Éviter les grosses libs (moment.js, lodash entier...)

**À retenir :** Pas de prod sans build prealable. Toujours tester en preview localement avant de deployer.
        `,
      },
      objectives: [
        { id: "o1a", label: "Lancer npm run build" },
        { id: "o1b", label: "Tester le bundle en local avec preview" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 01",
      missionTtl: "BUILD PRODUCTION",
      bannerIcon: "📦",
      bannerTtl: "BUNDLE PRÊT",
      bannerSub: "Ton application est compilee et optimisee pour la prod.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "# Deploie ton front-end sur Vercel.\n# 1. Installe la CLI vercel globalement.\n# 2. Connecte ton compte.\n# 3. Lance le deploiement depuis le dossier du projet.\n",
      placeholder: "# npm install -g vercel / vercel login / vercel",
      narrator:
        "Vercel detecte automatiquement ton framework (Next.js, Vite, React, Vue...), compile le projet sur leurs serveurs, et le met en ligne avec une URL HTTPS gratuite en 30 secondes. C'est devenu le standard du déploiement front moderne.",
      hint: "npm install -g vercel\nvercel login\nvercel\n\n# Premier déploiement : preview URL\n# vercel --prod : déploie en production",
      briefing: {
        title: "Vercel et alternatives",
        content: `
### Vercel
Specialise dans Next.js (même entreprise), excellent pour tout projet React/Vue/Svelte/HTML statique.

Trois façons de deployer :
1. **CLI** : \`vercel\` depuis le projet
2. **Git intégration** : connecte ton repo GitHub -> chaque push déploie automatiquement
3. **Drag & drop** : upload du dossier dist/ via vercel.com

Tu obtiens :
- URL d'aperçu pour CHAQUE pull request
- URL de production stable sur le main
- HTTPS automatique, CDN global, rollback en un clic

### Netlify
Le concurrent historique de Vercel. Memes principes, leger desavantage sur Next.js, leger avantage sur certains cas statiques. Choix d'équipe.

### Cloudflare Pages
Plus recent. Bon rapport perf/prix, integre à l'edge Cloudflare. Bon choix si tu cibles une audience mondiale.

### Render et Railway
Plus generalistes : front + back + db + services. Plus chers que Vercel pour du pur front, mais idéal quand tu deploies aussi une API et une db.

### Pour le back-end Express
Vercel et Netlify supportent les "serverless functions" mais sont moins adaptes a un serveur Express classique. Pour ca :
- **Render** -> simple, gratuit pour commencer
- **Railway** -> très rapide a setup, paie à l'usage
- **Fly.io** -> Docker, edge computing
- **VPS** (DigitalOcean, Hetzner) -> 5$/mois, contrôle total mais maintenance manuelle

**À retenir :** Vercel/Netlify pour le front statique ou SSR. Render/Railway/Fly pour un back classique.
        `,
      },
      objectives: [
        { id: "o2a", label: "Installer la CLI Vercel" },
        { id: "o2b", label: "Deployer le projet avec la commande vercel" },
      ],
      missionIcon: "▲",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DÉPLOIEMENT CLOUD",
      bannerIcon: "▲",
      bannerTtl: "EN LIGNE",
      bannerSub: "Ton application est accessible depuis n'importe ou dans le monde.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Configure les variables d'environnement.\n# 1. Cree un fichier .env a la racine.\n# 2. Ajoute API_URL=https://api.codeforge.space et DB_PASSWORD=...\n# 3. Ajoute .env au .gitignore (CRITIQUE).\n# 4. Cree un fichier .env.example sans les vraies valeurs.\n",
      placeholder: "# echo 'API_URL=...' > .env / echo '.env' >> .gitignore",
      narrator:
        "Une clé d'API ou un mot de passe DB dans le code, c'est la garantie qu'il finira sur GitHub publique. Les variables d'environnement isolent les secrets du code. C'est non-negociable.",
      hint: "# .env (jamais commit)\nAPI_URL=https://api.codeforge.space\nDB_PASSWORD=motdepasse_secret\n\n# .gitignore\n.env\n.env.local\n.env.*.local\n\n# .env.example (commit, sert de modèle)\nAPI_URL=\nDB_PASSWORD=",
      briefing: {
        title: "Variables d'environnement et secrets",
        content: `
### Le drame quotidien
"J'ai accidentellement push ma clé AWS sur GitHub. En 30 minutes, des bots l'ont détectée et ont mine du Bitcoin pour 12 000 dollars sur mon compte."
C'est arrive à des milliers de developpeurs. Tu ne veux pas être le suivant.

### Le fichier .env
Place à la racine du projet, format simple :
\`API_URL=https://api.codeforge.space\`
\`DB_PASSWORD=secret\`
\`STRIPE_KEY=sk_live_...\`

### Le .gitignore obligatoire
Toujours ajouter :
\`.env\`
\`.env.local\`
\`.env.*.local\`

Ainsi, le fichier reste UNIQUEMENT sur ta machine. Vérifie avec \`git status\` que .env n'est PAS suivi.

### Le .env.example
Tu le VERSIONNES, sans les vraies valeurs, pour que les autres developpeurs sachent quelles variables créer :
\`API_URL=\`
\`DB_PASSWORD=\`

### Accéder aux variables
- **Node.js / Express** : \`process.env.API_URL\`
- **Vite** : \`import.meta.env.VITE_API_URL\` (préfixe \`VITE_\` obligatoire pour exposer côté client)
- **Next.js** : \`process.env.NEXT_PUBLIC_API_URL\` pour le client, \`process.env.X\` pour le server

### CRITIQUE : public vs prive
Variables exposees au navigateur (\`VITE_\`, \`NEXT_PUBLIC_\`) -> tout le monde peut les lire en F12. Donc JAMAIS de clés secretes dedans. Reserve aux URLs publiques, IDs analytics, ce genre de choses.

### En production
Ne jamais uploader le .env. À la place, tu configures les variables dans le dashboard du provider :
- **Vercel** : Project Settings -> Environment Variables
- **Netlify** : Site Settings -> Environment
- **Render/Railway** : section Environment du service

Elles seront injectees automatiquement au build et au runtime.

### Le tuyau de detection
GitHub a un "secret scanning" qui detecte les patterns de clés (AWS, Stripe...). Si tu push une clé, tu recevras un email. Mais des bots l'auront aussi vue avant. **Revoque toujours la clé compromise immediatement.**

**À retenir :** .env JAMAIS commit. .env.example TOUJOURS commit. Secrets dans le dashboard du provider en prod.
        `,
      },
      objectives: [
        { id: "o3a", label: "Créer un .env avec des variables" },
        { id: "o3b", label: "Ajouter .env au .gitignore et créer .env.example" },
      ],
      missionIcon: "🔐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SECRETS PROTEGES",
      bannerIcon: "🔐",
      bannerTtl: "CONFIG SECURISEE",
      bannerSub: "Tes secrets sont isoles du code source.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Cree un Dockerfile pour ton app Node.js.\n# 1. Base : image node:20-alpine.\n# 2. Workdir : /app.\n# 3. Copie package*.json, installe les deps.\n# 4. Copie le reste, expose le port 3000, lance npm start.\n",
      placeholder: "# FROM node:20-alpine / WORKDIR ... / COPY ... / RUN ... / CMD [...]",
      narrator:
        "Docker emballe ton application avec son environnement complet (Node, dependances, OS minimal) dans une image portable. Le même conteneur tournera sur ta machine, en staging, en prod. Fini les 'ca marche chez moi'.",
      hint: "# Dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n\n# Build et run :\n# docker build -t codeforge-api .\n# docker run -p 3000:3000 codeforge-api",
      briefing: {
        title: "Docker et orchestration",
        content: `
### Pourquoi Docker ?
Une application a besoin de plus que du code : version de Node, dependances système, variables d'env, services lies (db, cache). Docker emballe TOUT ca dans une image immuable.

\`Image\` -> \`Conteneur en execution\`

C'est comme une "snapshot" complete qui tourne identique partout.

### Anatomie d'un Dockerfile
\`FROM node:20-alpine        # image de base, alpine = legere\`
\`WORKDIR /app               # dossier de travail dans le conteneur\`
\`COPY package*.json ./      # copier les manifestes\`
\`RUN npm ci --omit=dev      # install (sans devDependencies)\`
\`COPY . .                   # copier le reste du code\`
\`EXPOSE 3000                # documenter le port\`
\`CMD ["npm", "start"]       # commande au demarrage\`

### Pourquoi copier package.json AVANT le code ?
Docker cache chaque étape. Si tu modifies seulement \`src/index.js\`, l'étape \`npm ci\` n'est PAS rejouee (cache réutilise). Build x10 plus rapide.

### docker build et docker run
\`docker build -t codeforge-api .\` -> construit l'image
\`docker run -p 3000:3000 codeforge-api\` -> lance un conteneur, mappe le port

### docker-compose : plusieurs services
Pour ton projet fil rouge (front + back + db), un fichier \`docker-compose.yml\` orchestre tout :

\`services:\`
\`  api:\`
\`    build: ./api\`
\`    ports: ['3000:3000']\`
\`    depends_on: [db]\`
\`  front:\`
\`    build: ./front\`
\`    ports: ['5173:5173']\`
\`  db:\`
\`    image: postgres:16\`
\`    environment:\`
\`      POSTGRES_PASSWORD: secret\`

\`docker compose up\` -> lance les 3 services lies ensemble.

### Le multi-stage build
Pour un front React, on builde dans une image avec Node, puis on copie SEULEMENT le bundle final dans une image nginx legere.

### CI/CD : la suite naturelle
Une fois Docker maîtrise, tu passes a :
- **GitHub Actions** : sur chaque push -> tests + build image + deploy
- **Kubernetes** : orchestration d'images a grande echelle (overkill pour un projet etudiant)
- **Ansible** : configurer des VMs (alternative quand tu n'as pas Docker)

**À retenir :** Docker = environnement reproductible. Dockerfile pour un service, docker-compose pour plusieurs. Multi-stage pour des images minimales.
        `,
      },
      objectives: [
        { id: "o4a", label: "Écrire un Dockerfile complet pour une app Node" },
        { id: "o4b", label: "Connaître la différence entre image, conteneur et compose" },
      ],
      missionIcon: "🐳",
      missionTag: "PROTOCOLE 04",
      missionTtl: "CONTENEURISATION",
      bannerIcon: "🚀",
      bannerTtl: "MISSION ACCOMPLIE",
      bannerSub: "Tu maitrises la chaîne complete : code -> tests -> build -> déploiement.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
