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
\`    // Ici, "donnees" est un vrai objet JS ou un tableau\`
\`    console.log(donnees.nom);\`
\`  });\`

**A retenir :** Requete \`fetch\` -> transformation \`.json()\` -> utilisation des donnees \`data\`.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser response.json() dans le premier .then()" },
        { id: "o2b", label: "Ajouter un second .then() pour logger les donnees" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DECODAGE JSON",
      bannerIcon: "📦",
      bannerTtl: "DONNEES DECODEES",
      bannerSub: "Le message JSON a ete transforme en objet utilisable.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Recris la requete de l'etape precedente de maniere moderne.\n// Cree une fonction : async function getVaisseau() { ... }\n// Dedans, utilise le mot-cle await pour fetch et .json(), puis logge les donnees.\n",
      placeholder: "// async function ... await fetch ...",
      narrator:
        "Les chaines de .then() peuvent devenir illisibles. La nouvelle norme de la flotte utilise la syntaxe async/await. Recris la fonction de recuperation du vaisseau avec cette methode.",
      hint: "async function getVaisseau() {\n  const res = await fetch('https://api.codeforge.space/vaisseau');\n  const data = await res.json();\n  console.log(data);\n}\ngetVaisseau();",
      briefing: {
        title: "La syntaxe async / await",
        content: `
### Le probleme de .then()
Chainer de multiples \`.then()\` rend le code decale vers la droite (ce qu'on appelle le "Callback Hell") et difficile a lire.

### La solution moderne
Depuis 2017, JS propose les mots-cles **async** et **await**. Ils permettent d'ecrire du code asynchrone pour qu'il ait l'air synchrone (ligne par ligne).

### Comment l'utiliser ?
1. Il faut placer le mot-cle **async** devant la fonction.
2. A l'interieur, on utilise **await** devant une Promise. Le code "met en pause" la fonction jusqu'a ce que la reponse arrive, puis stocke le resultat dans la variable.

\`async function recupererProfil() {\`
\`  const res = await fetch('api/profil');\`
\`  const data = await res.json();\`
\`  console.log(data);\`
\`}\`

**A retenir :** \`await\` supprime le besoin d'ecrire \`.then()\`. Le code redevient clair et vertical.
        `,
      },
      objectives: [
        { id: "o3a", label: "Creer une fonction avec le mot-cle async" },
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