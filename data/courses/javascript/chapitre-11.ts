import type { ChapterData } from "@/data/courses/html/types";

export const chapitre11: ChapterData = {
  slug: "chapitre-11",
  tag: "MISSION : LIAISON SATELLITE",
  title: "RESEAU &\nFETCH",
  subtitle: "Communique avec des serveurs distants de maniere asynchrone",
  totalXp: 280,
  completionBadge: "📡",
  completionBadgeLabel: "OFFICIER DE TRANSMISSION",
  steps: [
    {
      startCode:
        "// Lance une requete vers 'https://api.codeforge.space/ping'.\n// Utilise .then() pour recuperer la reponse et logge-la.\n",
      placeholder: "// fetch(...).then(...)",
      narrator:
        "Pour obtenir les coordonnees de vol, nous devons interroger le centre de commandement. Utilise fetch() pour envoyer une requete au serveur distant et recupere la reponse avec .then().",
      hint: "fetch('https://api.codeforge.space/ping').then(response => console.log(response));",
      briefing: {
        title: "La fonction fetch()",
        content: `
*« Nos coordonnées viennent du central, pas de nulle part. \`fetch\` ouvre la liaison ; le \`.then\` traite la réponse quand elle nous parvient. »* — **Kira**

### Qu'est-ce que fetch ?
\`fetch()\` est la fonction native de JavaScript pour faire des requetes reseau (HTTP). Elle permet de demander des donnees a un serveur distant.

### Asynchrone par nature
Interroger un serveur prend du temps a cause de la distance. \`fetch()\` ne bloque pas l'execution de ton code. Au lieu de ca, elle renvoie une **Promise** (Promesse).

### Les Promesses et .then()
Une Promise represente une valeur qui sera disponible *plus tard*. Pour executer du code quand la reponse arrive, on attache une fonction avec \`.then()\` :

\`fetch('https://api.serveur.com/status')\`
\`  .then((response) => {\`
\`    console.log("Reponse recue !", response);\`
\`  });\`

**A retenir :** \`fetch()\` lance la requete. \`.then()\` indique quoi faire une fois que le serveur repond.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser fetch avec la bonne URL" },
        { id: "o1b", label: "Chainer un .then() et logger la reponse" },
      ],
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
        "Le serveur nous repond, mais ses donnees sont compressees au format JSON. Utilise une deuxieme etape pour decoder la reponse et afficher les donnees du vaisseau.",
      hint: "fetch('https://api.codeforge.space/vaisseau')\n  .then(res => res.json())\n  .then(data => console.log(data));",
      briefing: {
        title: "Decoder le JSON",
        content: `
### Le flux de reponse
Quand le premier \`.then()\` se declenche, la reponse HTTP brute vient d'arriver, mais le corps du message (le texte complet) n'est pas encore totalement telecharge.

### response.json()
Pour lire le contenu sous forme d'objet JavaScript utilisable, on appelle la methode \`json()\` sur l'objet reponse. 
Cette methode renvoie **elle aussi** une Promesse ! Il faut donc chainer un second \`.then()\`.

### Le pattern standard
\`fetch('https://api.url.com/data')\`
\`  .then(reponse => reponse.json())\`
\`  .then(donnees => {\`
\`    // Ici, "donnees" contient l'objet JSON decode\n\`
\`    console.log(donnees);\`\n\`
\`  });\`

**A retenir :** \`fetch()\` retourne une Promise qui se resout avec un objet Response. Utilisez \`response.json()\` pour obtenir le contenu au format JSON.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .json() pour decoder la reponse" },
        { id: "o2b", label: "Logger l'objet JSON decode" },
      ],
      missionIcon: "⚙️",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DECODEUR",
      bannerIcon: "⚙️",
      bannerTtl: "DONNEES DÉCODÉES",
      bannerSub: "Le contenu JSON est maintenant exploitable.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Creer une fonction avec le mot-cle async pour getVaisseau.\n// Utilise await pour recuperer et parser les donnees de 'https://api.codeforge.space/vaisseau'.\n",
      placeholder: "// async function getVaisseau() { ... }",
      narrator:
        "Le code asynchrone peut être rendu plus lisible en utilisant des fonctions async. Cela permet d'utiliser le mot-cle await pour attendre la resolution de la Promise.",
      hint: "async function getVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseau');\n  const data = await res.json();\n  console.log(data);\n}\ngetVaisseau();",
      briefing: {
        title: "Syntaxe Async/Await",
        content: `
### Asynchrone avec async/await
La syntaxe \`async / await\` rend le code asynchrone plus lisible et plus facile à écrire. Elle permet de gérer les Promises comme si elles étaient des appels synchrones.

1. Déclarez une fonction avec le mot-cle **async**.
2. Utilisez **await** devant une Promise pour attendre sa résolution.

\`async function recupererDonnees() {\`
\`  const res = await fetch('api/donnees');\`
\`  const data = await res.json();\`
\`  console.log(data);\`
\`}\`

**A retenir :** \`await\` rend le code asynchrone synchrone en apparence, ce qui facilite sa lecture.
        `,
      },
      objectives: [
        { id: "o3a", label: "Creer une fonction async getVaisseau" },
        { id: "o3b", label: "Utiliser await pour recuperer et parser les donnees" },
      ],
      missionIcon: "⚡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "VITESSE ASYNC",
      bannerIcon: "⚡",
      bannerTtl: "CODE MODERNISÉ",
      bannerSub: "Ta requete utilise desormais les derniers standards JS.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Ajoute un bloc try...catch dans ta fonction getVaisseau.\n// Provoque une erreur en fetchant 'https://api.codeforge.space/erreur'.\n// Dans le catch, logge 'Erreur de transmission : ' suivi du message d'erreur.\n",
      placeholder: "// try { ... } catch (erreur) { ... }",
      narrator:
        "Une tempete solaire perturbe les reseaux. Les requetes peuvent echouer ! Entoure ton code asynchrone d'un bloc try/catch pour gerer les pannes avec grace.",
      hint: "async function getVaisseau() {\n  try {\n    const res = await fetch('https://api.codeforge.space/erreur');\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const data = await res.json();\n    console.log(data);\n  } catch (e) {\n    console.log('Erreur de transmission : ' + e.message);\n  }\n}\ngetVaisseau();",
      briefing: {
        title: "Gerer les erreurs reseau",
        content: `
### Pourquoi anticiper l'echec ?
Le reseau est imprevisible : le serveur peut etre en panne, le signal perdu, ou l'URL peut etre fausse. Si tu ne geres pas l'erreur, ton application entiere peut planter.

### Le bloc try / catch
Avec la syntaxe \`async / await\`, la meilleure facon d'intercepter un probleme est d'utiliser \`try...catch\`.

\`async function mission() {\`
\`  try {\`
\`    const res = await fetch('url-invalide');\`
\`    const data = await res.json();\`
\`  } catch (erreur) {\`
\`    console.log("Alerte rouge :", erreur.message);\`
\`  }\`
\`}\`

### Piege classique : fetch ne rejette PAS sur 404 ou 500
Attention cadet : \`fetch()\` ne declenche une erreur QUE si le reseau echoue (DNS, signal perdu). Un statut HTTP 404 ou 500 est considere comme une "reponse valide" par fetch. Pour les attraper, il faut verifier \`response.ok\` manuellement :

\`if (!res.ok) throw new Error('HTTP ' + res.status);\`

C'est le piege n°1 des juniors. Les seniors le verifient toujours.

### Avec .then() ?
Pour information, si tu utilisais l'ancienne syntaxe \`.then()\`, on attrapait les erreurs en ajoutant un \`.catch()\` a la toute fin de la chaine.

**A retenir :** Toujours mettre ses requetes reseau dans un \`try / catch\` ET verifier \`response.ok\`. C'est la marque des developpeurs seniors.
        `,
      },
      objectives: [
        { id: "o4a", label: "Entourer les requetes avec try {} et verifier response.ok" },
        { id: "o4b", label: "Logger le message en cas d'erreur dans catch {}" },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 04",
      missionTtl: "BOUCLIER ANTI-CRASH",
      bannerIcon: "🛡",
      bannerTtl: "PANNE GÉREE",
      bannerSub: "Ton code est maintenant robuste face aux erreurs reseau.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};