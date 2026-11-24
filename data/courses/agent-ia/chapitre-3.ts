import type { ChapterData } from "@/data/courses/html/types";

const OUTILS_REPARATION = `const outils = {
  scanner: {
    description: "Analyse un secteur de la station",
    executer: (secteur) => "fuite détectée en " + secteur,
  },
  reparer: {
    description: "Répare un secteur endommagé",
    executer: (secteur) => "fuite colmatée en " + secteur,
  },
};
`;

const UTILISER = `
function utiliser(nom, argument) {
  const outil = outils[nom];
  if (!outil) return "Outil inconnu : " + nom;
  return outil.executer(argument);
}
`;

/** Simulated model that needs two tool calls before it can answer. */
const NOYAU_MISSION = `
// Le noyau simulé : il lui faut DEUX outils avant de pouvoir répondre.
// Il décide de la suite en comptant les résultats déjà reçus.
function noyau(messages) {
  const resultats = messages.filter((m) => m.role === "tool");
  if (resultats.length === 0) {
    return { role: "assistant", outil: "scanner", argument: "B4" };
  }
  if (resultats.length === 1) {
    return { role: "assistant", outil: "reparer", argument: "B4" };
  }
  return {
    role: "assistant",
    content: "Mission accomplie : " + resultats.map((r) => r.content).join(" puis "),
  };
}
`;

const BOUCLE = `
function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  while (true) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) return reponse.content;
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
}
`;

export const chapter3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : BOUCLE DE DÉCISION",
  title: "BOUCLE DE\nDÉCISION",
  subtitle: "La boucle d'agent, sa limite de tours et ses garde-fous",
  totalXp: 164,
  completionBadge: "🔁",
  completionBadgeLabel: "MAÎTRE DE LA BOUCLE",
  steps: [
    {
      startCode: `${OUTILS_REPARATION}${UTILISER}${NOYAU_MISSION}
// Écris la fonction agent(demande) :
//   1. crée messages : un message system, puis le message user (demande)
//   2. en boucle :
//        - appelle noyau et ajoute sa réponse à messages
//        - si la réponse n'a pas d'outil : renvoie son content
//        - sinon : exécute l'outil, ajoute le résultat (role "tool")

console.log(agent("Répare le secteur B4"));
`,
      placeholder: "// function agent(demande) { ... while (true) { ... } }",
      narrator:
        "Voici le cœur d'un agent, Cadet. Une vraie mission demande plusieurs outils d'affilée, et c'est le modèle qui décide quand il a fini. Ton programme tourne en boucle jusque-là.",
      hint: `${OUTILS_REPARATION}${UTILISER}${NOYAU_MISSION}${BOUCLE}
console.log(agent("Répare le secteur B4"));`,
      briefing: {
        title: "La boucle d'agent",
        content: `
### Un chatbot répond, un agent boucle
Au chapitre précédent, tu as géré **un** appel d'outil à la main. Mais réparer un secteur demande de scanner, **puis** de réparer. Tu ne sais pas à l'avance combien d'outils il faudra : seul le modèle le sait, au fur et à mesure.

### La boucle
- appeler le modèle
- s'il demande un outil : l'exécuter, renvoyer le résultat, **recommencer**
- s'il répond par du texte : c'est fini, on rend sa réponse

### En code
\`while (true) { ... }\` tourne jusqu'au \`return\`.

La condition de sortie est la bifurcation que tu connais : \`if (!reponse.outil) return reponse.content;\`

### Qui pilote
C'est le **modèle** qui pilote la boucle, pas toi. À chaque tour, il relit tout l'historique (y compris les résultats d'outils) et choisit la suite. C'est ce qui distingue un agent d'un script : le chemin n'est pas écrit à l'avance.

### C'est tout
Un agent IA, c'est ça : **un modèle, des outils, une boucle**. Tout le reste est du garde-fou et du confort. Les prochaines étapes les ajoutent.

**Mission :** écris \`agent(demande)\`. Le noyau doit enchaîner le scan puis la réparation avant de répondre.
        `,
      },
      objectives: [
        { id: "o1a", label: "Boucler tant que le modèle demande un outil" },
        { id: "o1b", label: "Sortir de la boucle sur une réponse texte" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIÈRE BOUCLE",
      bannerIcon: "🔁",
      bannerTtl: "AGENT AUTONOME",
      bannerSub: "ORBI enchaîne ses outils seul, jusqu'à la fin de la mission.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `let scans = 0;

const outils = {
  scanner: {
    description: "Analyse un secteur de la station",
    executer: (secteur) => {
      scans = scans + 1;
      console.log("Scan " + scans + " du secteur " + secteur);
      return "signal instable";
    },
  },
};
${UTILISER}
// Le noyau a été déréglé par le Spectre : il ne conclut JAMAIS.
// Il redemande un scan à chaque tour.
function noyau(messages) {
  return { role: "assistant", outil: "scanner", argument: "B4" };
}

const MAX_TOURS = 3;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  // Écris la boucle d'agent, limitée à MAX_TOURS tours (boucle for).
  // Si la limite est atteinte sans réponse texte, renvoie :
  //   "Arrêt de sécurité : limite de 3 tours atteinte"
}

console.log(agent("Scanne le secteur B4"));
`,
      placeholder: "// for (let tour = 1; tour <= MAX_TOURS; tour++) { ... }",
      narrator:
        "Le Spectre a déréglé le noyau : il redemande le même scan, encore et encore. Une boucle sans limite tournerait pour toujours, en brûlant du temps et des crédits. Pose un plafond.",
      hint: `let scans = 0;

const outils = {
  scanner: {
    description: "Analyse un secteur de la station",
    executer: (secteur) => {
      scans = scans + 1;
      console.log("Scan " + scans + " du secteur " + secteur);
      return "signal instable";
    },
  },
};
${UTILISER}
function noyau(messages) {
  return { role: "assistant", outil: "scanner", argument: "B4" };
}

const MAX_TOURS = 3;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) return reponse.content;
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}

console.log(agent("Scanne le secteur B4"));`,
      briefing: {
        title: "Limiter le nombre de tours",
        content: `
### Le risque
Dans une boucle d'agent, c'est le modèle qui décide de s'arrêter. Et un modèle peut **tourner en rond** : redemander le même outil, hésiter entre deux pistes, ne jamais conclure.

Avec un vrai modèle, chaque tour coûte du temps et de l'argent. Une boucle sans fin est une facture sans fin.

### Le garde-fou
On fixe un nombre maximum de tours :

\`const MAX_TOURS = 3;\`

Et on remplace \`while (true)\` par une boucle bornée :

\`for (let tour = 1; tour <= MAX_TOURS; tour++) { ... }\`

### Après la boucle
Si le \`for\` se termine sans \`return\`, c'est que le modèle n'a pas conclu. L'agent rend alors un message **explicite**, jamais un silence :

\`"Arrêt de sécurité : limite de 3 tours atteinte"\`

### Quelle limite choisir ?
Assez pour finir une tâche normale, pas plus. Une dizaine de tours pour un petit agent, davantage pour un travail long. L'important est qu'il y en ait une.

**À retenir :** un agent sans limite de tours n'est pas un agent autonome, c'est un agent hors de contrôle.

**Mission :** écris la boucle bornée à \`MAX_TOURS\`. Le scanner ne doit tourner que trois fois, puis l'agent rend le message d'arrêt.
        `,
      },
      objectives: [
        { id: "o2a", label: "Borner la boucle d'agent avec MAX_TOURS" },
        { id: "o2b", label: "Rendre un message explicite quand la limite est atteinte" },
      ],
      missionIcon: "🛑",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ARRÊT DE SÉCURITÉ",
      bannerIcon: "🛑",
      bannerTtl: "BOUCLE SOUS CONTRÔLE",
      bannerSub: "Même déréglé, ORBI s'arrête : tu gardes la main.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `const outils = {
  reparer: {
    description: "Répare un secteur avec le bras robotique",
    executer: (secteur) => {
      throw new Error("bras robotique bloqué");
    },
  },
  drone: {
    description: "Envoie un drone de réparation",
    executer: (secteur) => "drone envoyé en " + secteur,
  },
};

// Protège cette fonction avec try / catch :
// si l'outil lève une erreur, renvoie "Erreur : " + erreur.message
function utiliser(nom, argument) {
  const outil = outils[nom];
  if (!outil) return "Outil inconnu : " + nom;
  return outil.executer(argument);
}

// Le noyau simulé : si un outil échoue, il change de plan.
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  if (dernier.role === "user") {
    return { role: "assistant", outil: "reparer", argument: "B4" };
  }
  if (dernier.content.startsWith("Erreur")) {
    return { role: "assistant", outil: "drone", argument: "B4" };
  }
  return { role: "assistant", content: "Plan B réussi : " + dernier.content };
}

const MAX_TOURS = 5;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) return reponse.content;
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}

console.log(agent("Répare le secteur B4"));
`,
      placeholder: '// try { ... } catch (erreur) { return "Erreur : " + erreur.message; }',
      narrator:
        "Un outil, ça casse : capteur muet, bras bloqué, réseau coupé. Si l'erreur fait planter ton agent, la mission s'arrête. Si tu la renvoies au modèle, il peut changer de plan.",
      hint: `const outils = {
  reparer: {
    description: "Répare un secteur avec le bras robotique",
    executer: (secteur) => {
      throw new Error("bras robotique bloqué");
    },
  },
  drone: {
    description: "Envoie un drone de réparation",
    executer: (secteur) => "drone envoyé en " + secteur,
  },
};

function utiliser(nom, argument) {
  const outil = outils[nom];
  if (!outil) return "Outil inconnu : " + nom;
  try {
    return outil.executer(argument);
  } catch (erreur) {
    return "Erreur : " + erreur.message;
  }
}

function noyau(messages) {
  const dernier = messages[messages.length - 1];
  if (dernier.role === "user") {
    return { role: "assistant", outil: "reparer", argument: "B4" };
  }
  if (dernier.content.startsWith("Erreur")) {
    return { role: "assistant", outil: "drone", argument: "B4" };
  }
  return { role: "assistant", content: "Plan B réussi : " + dernier.content };
}

const MAX_TOURS = 5;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) return reponse.content;
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}

console.log(agent("Répare le secteur B4"));`,
      briefing: {
        title: "Quand un outil échoue",
        content: `
### Les outils échouent
Un outil touche le monde réel : un fichier absent, un service en panne, un argument invalide. Tôt ou tard, il lève une erreur.

### Deux réactions possibles
- **laisser planter** : l'erreur remonte, la boucle s'arrête, la mission est perdue
- **renvoyer l'erreur au modèle** : il la lit comme n'importe quel résultat, et peut réagir

La seconde est presque toujours la bonne.

### try / catch dans l'aiguillage
\`try { return outil.executer(argument); } catch (erreur) { return "Erreur : " + erreur.message; }\`

L'erreur devient un **texte**, rangé dans un message \`tool\` comme un résultat normal.

### Ce que le modèle en fait
En lisant « Erreur : bras robotique bloqué », le modèle peut :
- réessayer avec un autre argument
- choisir un autre outil
- expliquer à l'humain ce qui bloque

Tu n'as rien codé de tout ça : c'est le modèle qui s'adapte. Ton seul travail est de lui dire la vérité sur ce qui s'est passé.

### Un bon message d'erreur
Écris-le pour qu'il soit **utile au modèle** : ce qui a échoué, et si possible pourquoi. « Erreur » tout seul ne l'aide pas à choisir un plan B.

**Mission :** protège \`utiliser\` avec \`try / catch\`. L'agent doit survivre à la panne du bras et finir avec le drone.
        `,
      },
      objectives: [
        { id: "o3a", label: "Intercepter l'erreur d'un outil avec try / catch" },
        { id: "o3b", label: "Renvoyer l'erreur au modèle sous forme de texte" },
      ],
      missionIcon: "⚠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "PANNE D'OUTIL",
      bannerIcon: "⚠",
      bannerTtl: "PLAN B ENGAGÉ",
      bannerSub: "Une panne n'arrête plus ORBI : il la lit et s'adapte.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${OUTILS_REPARATION}${UTILISER}${NOYAU_MISSION}
const MAX_TOURS = 5;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    // Ajoute le journal de bord :
    //   réponse texte  -> affiche "Tour <tour> : réponse finale"
    //   demande d'outil -> affiche "Tour <tour> : <outil>(<argument>)"
    if (!reponse.outil) return reponse.content;
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}

console.log(agent("Répare le secteur B4"));
`,
      placeholder: '// console.log("Tour " + tour + " : " + reponse.outil + "(" + reponse.argument + ")");',
      narrator:
        "Ton agent décide seul : tu dois pouvoir relire ce qu'il a fait, tour par tour. Sans journal de bord, un agent qui se trompe est une boîte noire. Avec, c'est un rapport de mission.",
      hint: `${OUTILS_REPARATION}${UTILISER}${NOYAU_MISSION}
const MAX_TOURS = 5;

function agent(demande) {
  const messages = [
    { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) {
      console.log("Tour " + tour + " : réponse finale");
      return reponse.content;
    }
    console.log("Tour " + tour + " : " + reponse.outil + "(" + reponse.argument + ")");
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}

console.log(agent("Répare le secteur B4"));`,
      briefing: {
        title: "Le journal de bord",
        content: `
### Pourquoi tracer
Dans un programme classique, tu sais quel chemin le code a pris : tu l'as écrit. Dans un agent, le chemin est choisi par le modèle, et il peut changer d'une exécution à l'autre.

Quand le résultat est mauvais, il faut pouvoir répondre à une question : **qu'a-t-il fait, exactement ?**

### Une ligne par tour
\`Tour 1 : scanner(B4)\`
\`Tour 2 : reparer(B4)\`
\`Tour 3 : réponse finale\`

Trois lignes suffisent pour relire la mission entière.

### Quoi consigner
- le **numéro** du tour
- l'**outil** demandé et son **argument**
- le moment où le modèle rend sa **réponse finale**

Dans un vrai agent, on ajoute souvent le résultat de chaque outil et la durée du tour.

### Ce que le journal révèle
- un outil appelé **en boucle** : la description de l'outil est sans doute ambiguë
- un outil **jamais** appelé : le modèle ne comprend pas à quoi il sert
- un argument **farfelu** : la consigne system manque de précision

Presque tous les défauts d'un agent se lisent dans son journal.

**Mission :** ajoute le journal de bord à la boucle. Chaque tour doit laisser une ligne, y compris le dernier.
        `,
      },
      objectives: [
        { id: "o4a", label: "Consigner chaque demande d'outil avec son tour" },
        { id: "o4b", label: "Consigner le tour de la réponse finale" },
      ],
      missionIcon: "📓",
      missionTag: "PROTOCOLE 04",
      missionTtl: "JOURNAL DE BORD",
      bannerIcon: "📓",
      bannerTtl: "MISSION TRAÇABLE",
      bannerSub: "Chaque décision d'ORBI est écrite : plus de boîte noire.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
