import type { ChapterData } from "@/data/courses/html/types";

export const chapitre11: ChapterData = {
  slug: "chapitre-11",
  tag: "MISSION : LIAISON SATELLITE",
  title: "RÉSEAU &\nFETCH",
  subtitle: "Communique avec des serveurs distants de manière asynchrone",
  totalXp: 280,
  completionBadge: "📡",
  completionBadgeLabel: "OFFICIER DE TRANSMISSION",
  steps: [
    {
      startCode:
        "// Lance une requete vers 'https://api.codeforge.space/ping'.\n// Utilise .then() pour recuperer la reponse et logge-la.\n",
      placeholder: "// fetch(...).then(...)",
      narrator:
        "Pour obtenir les coordonnées de vol, nous devons interroger le centre de commandement. Utilise fetch() pour envoyer une requête au serveur distant et recupere la réponse avec .then().",
      hint: "fetch('https://api.codeforge.space/ping').then(response => console.log(response));",
      briefing: {
        title: "La fonction fetch()",
        content: `
*« Nos coordonnées viennent du central, pas de nulle part. \`fetch\` ouvre la liaison ; le \`.then\` traite la réponse quand elle nous parvient. »* — **Kira**

### Qu'est-ce que fetch ?
\`fetch()\` est la fonction native de JavaScript pour faire des requetes réseau (HTTP). Elle permet de demander des données a un serveur distant.

### Asynchrone par nature
Interroger un serveur prend du temps à cause de la distance. \`fetch()\` ne bloque pas l'exécution de ton code. Au lieu de ca, elle renvoie une **Promise** (Promesse).

### Les Promesses et .then()
Une Promise represente une valeur qui sera disponible *plus tard*. Pour exécuter du code quand la réponse arrive, on attache une fonction avec \`.then()\` :

\`fetch('https://api.serveur.com/status')\`
\`  .then((response) => {\`
\`    console.log("Reponse recue !", response);\`
\`  });\`

**À retenir :** \`fetch()\` lance la requête. \`.then()\` indique quoi faire une fois que le serveur répond.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser fetch avec la bonne URL" },
        { id: "o1b", label: "Chainer un .then() et logger la réponse" },
      ],
      docRefs: ["js/fetch"],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER CONTACT",
      bannerIcon: "📡",
      bannerTtl: "SIGNAL ENVOYE",
      bannerSub: "Le serveur a repondu au ping de ton vaisseau.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Fais un fetch vers 'https://api.codeforge.space/vaisseau'.\n// Transforme la reponse en JSON avec .json(), puis logge l'objet final.\n",
      placeholder: "// fetch(...).then(res => res.json()).then(data => ...)",
      narrator:
        "Le serveur nous répond, mais ses données sont compressees au format JSON. Utilise une deuxième étape pour decoder la réponse et afficher les données du vaisseau.",
      hint: "fetch('https://api.codeforge.space/vaisseau')\n  .then(res => res.json())\n  .then(data => console.log(data));",
      briefing: {
        title: "Decoder le JSON",
        content: `
### Le flux de réponse
Quand le premier \`.then()\` se declenche, la réponse HTTP brute vient d'arriver, mais le corps du message (le texte complet) n'est pas encore totalement télécharge.

### response.json()
Pour lire le contenu sous forme d'objet JavaScript utilisable, on appelle la méthode \`json()\` sur l'objet réponse. 
Cette méthode renvoie **elle aussi** une Promesse ! Il faut donc chainer un second \`.then()\`.

### Le pattern standard
\`fetch('https://api.url.com/data')\`
\`  .then(reponse => reponse.json())\`
\`  .then(donnees => {\`
\`    // Ici, "donnees" contient l'objet JSON decode\n\`
\`    console.log(donnees);\`\n\`
\`  });\`

**À retenir :** \`fetch()\` retourne une Promise qui se resout avec un objet Response. Utilisez \`response.json()\` pour obtenir le contenu au format JSON.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .json() pour decoder la réponse" },
        { id: "o2b", label: "Logger l'objet JSON decode" },
      ],
      missionIcon: "⚙️",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DECODEUR",
      bannerIcon: "⚙️",
      bannerTtl: "DONNÉES DÉCODÉES",
      bannerSub: "Le contenu JSON est maintenant exploitable.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Creer une fonction avec le mot-cle async pour getVaisseau.\n// Utilise await pour recuperer et parser les donnees de 'https://api.codeforge.space/vaisseau'.\n",
      placeholder: "// async function getVaisseau() { ... }",
      narrator:
        "Le code asynchrone peut être rendu plus lisible en utilisant des fonctions async. Cela permet d'utiliser le mot-clé await pour attendre la résolution de la Promise.",
      hint: "async function getVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseau');\n  const data = await res.json();\n  console.log(data);\n}\ngetVaisseau();",
      briefing: {
        title: "Syntaxe Async/Await",
        content: `
### Asynchrone avec async/await
La syntaxe \`async / await\` rend le code asynchrone plus lisible et plus facile à écrire. Elle permet de gérer les Promises comme si elles étaient des appels synchrones.

1. Déclarez une fonction avec le mot-clé **async**.
2. Utilisez **await** devant une Promise pour attendre sa résolution.

\`async function recupererDonnees() {\`
\`  const res = await fetch('api/donnees');\`
\`  const data = await res.json();\`
\`  console.log(data);\`
\`}\`

**À retenir :** \`await\` rend le code asynchrone synchrone en apparence, ce qui facilite sa lecture.
        `,
      },
      objectives: [
        { id: "o3a", label: "Créer une fonction async getVaisseau" },
        { id: "o3b", label: "Utiliser await pour récupérer et parser les données" },
      ],
      missionIcon: "⚡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "VITESSE ASYNC",
      bannerIcon: "⚡",
      bannerTtl: "CODE MODERNISÉ",
      bannerSub: "Ta requête utilise désormais les derniers standards JS.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Ajoute un bloc try...catch dans ta fonction getVaisseau.\n// Provoque une erreur en fetchant 'https://api.codeforge.space/erreur'.\n// Dans le catch, logge 'Erreur de transmission : ' suivi du message d'erreur.\n",
      placeholder: "// try { ... } catch (erreur) { ... }",
      narrator:
        "Une tempete solaire perturbe les réseaux. Les requetes peuvent echouer ! Entoure ton code asynchrone d'un bloc try/catch pour gérer les pannes avec grâce.",
      hint: "async function getVaisseau() {\n  try {\n    const res = await fetch('https://api.codeforge.space/erreur');\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const data = await res.json();\n    console.log(data);\n  } catch (e) {\n    console.log('Erreur de transmission : ' + e.message);\n  }\n}\ngetVaisseau();",
      briefing: {
        title: "Gérer les erreurs réseau",
        content: `
### Pourquoi anticiper l'echec ?
Le réseau est imprévisible : le serveur peut être en panne, le signal perdu, ou l'URL peut être fausse. Si tu ne geres pas l'erreur, ton application entiere peut planter.

### Le bloc try / catch
Avec la syntaxe \`async / await\`, la meilleure façon d'intercepter un problème est d'utiliser \`try...catch\`.

\`async function mission() {\`
\`  try {\`
\`    const res = await fetch('url-invalide');\`
\`    const data = await res.json();\`
\`  } catch (erreur) {\`
\`    console.log("Alerte rouge :", erreur.message);\`
\`  }\`
\`}\`

### Piège classique : fetch ne rejette PAS sur 404 ou 500
Attention cadet : \`fetch()\` ne declenche une erreur QUE si le réseau echoue (DNS, signal perdu). Un statut HTTP 404 ou 500 est considere comme une "réponse valide" par fetch. Pour les attraper, il faut vérifier \`response.ok\` manuellement :

\`if (!res.ok) throw new Error('HTTP ' + res.status);\`

C'est le piège n°1 des juniors. Les seniors le verifient toujours.

### Avec .then() ?
Pour information, si tu utilisais l'ancienne syntaxe \`.then()\`, on attrapait les erreurs en ajoutant un \`.catch()\` à la toute fin de la chaîne.

**À retenir :** Toujours mettre ses requetes réseau dans un \`try / catch\` ET vérifier \`response.ok\`. C'est la marque des developpeurs seniors.
        `,
      },
      objectives: [
        { id: "o4a", label: "Entourer les requetes avec try {} et vérifier response.ok" },
        { id: "o4b", label: "Logger le message en cas d'erreur dans catch {}" },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 04",
      missionTtl: "BOUCLIER ANTI-CRASH",
      bannerIcon: "🛡",
      bannerTtl: "PANNE GÉREE",
      bannerSub: "Ton code est maintenant robuste face aux erreurs réseau.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};