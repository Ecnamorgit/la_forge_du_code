import type { ChapterData } from "@/data/courses/html/types";

const LIRE_MEMOIRE = `// La mémoire d'ORBI vit dans localStorage, sous la clé "memoire-orbi",
// sous forme de texte JSON. lireMemoire la relit et la transforme en objet.
function lireMemoire() {
  return JSON.parse(localStorage.getItem("memoire-orbi") || "{}");
}
`;

const ESSAIS_MEMOIRE = `
retenir("pilote", "Lia");
retenir("vaisseau", "Aurore");

console.log(rappeler("pilote"));
console.log(rappeler("vaisseau"));
console.log(rappeler("planete"));
console.log(localStorage.getItem("memoire-orbi"));
`;

/** Simulated model that greets the pilot named in the system message. */
const NOYAU_ACCUEIL = `
// Le noyau simulé : il ne connaît le pilote que si son nom figure
// dans le message system.
function noyau(messages) {
  const systeme = messages[0].content;
  const trouve = systeme.match(/pilote = ([^,.]+)/);
  const pilote = trouve ? trouve[1] : "inconnu";
  return {
    role: "assistant",
    content: "Bonjour " + pilote + ", ORBI à ton service.",
  };
}
`;

/** Simulated model that decides, on its own, to memorise a fact. */
const NOYAU_RETENIR = `
// Le noyau simulé : quand l'humain lui confie un fait, il DÉCIDE
// de le mémoriser en demandant l'outil retenir.
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  if (dernier.role === "tool") {
    return { role: "assistant", content: "C'est noté : " + dernier.content };
  }
  const trouve = dernier.content.match(/Retiens que mon ([a-z]+) est ([^ .]+)/);
  if (trouve) {
    return {
      role: "assistant",
      outil: "retenir",
      argument: trouve[1] + "=" + trouve[2],
    };
  }
  return { role: "assistant", content: "Rien à retenir." };
}
`;

const UTILISER_PROTEGE = `
function utiliser(nom, argument) {
  const outil = outils[nom];
  if (!outil) return "Outil inconnu : " + nom;
  try {
    return outil.executer(argument);
  } catch (erreur) {
    return "Erreur : " + erreur.message;
  }
}
`;

const AGENT_BORNE = `
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
`;

const OUTILS_DECOLLAGE = `
const outils = {
  verifier: {
    description: "Vérifie un système du vaisseau avant le décollage",
    executer: (systeme) => systeme + " OK",
  },
  retenir: {
    description: "Mémorise un fait, au format cle=valeur",
    executer: (argument) => {
      const morceaux = argument.split("=");
      memoire[morceaux[0]] = morceaux[1];
      return morceaux[0] + " = " + morceaux[1];
    },
  },
};
`;

/** Simulated model for the final micro-task: a take-off checklist. */
const NOYAU_DECOLLAGE = `
// Le noyau simulé : il lit le nom de l'agent et celui du pilote dans le
// message system, puis déroule la checklist de décollage outil par outil.
function noyau(messages) {
  const systeme = messages[0].content;
  const nom = (systeme.match(/Tu es ([^,.]+)/) || [])[1] || "???";
  const pilote = (systeme.match(/pilote = ([^,.]+)/) || [])[1] || "???";
  const resultats = messages
    .filter((m) => m.role === "tool")
    .map((m) => m.content);
  if (resultats.length === 0) {
    return { role: "assistant", outil: "verifier", argument: "moteurs" };
  }
  if (resultats.length === 1) {
    return { role: "assistant", outil: "verifier", argument: "carburant" };
  }
  if (resultats.length === 2) {
    return { role: "assistant", outil: "retenir", argument: "dernier_decollage=OK" };
  }
  return {
    role: "assistant",
    content:
      nom + " : checklist terminée pour " + pilote + ". " +
      resultats[0] + ", " + resultats[1] + ". Décollage autorisé.",
  };
}
`;

const ESSAI_DECOLLAGE = `
console.log(agent("Prépare le décollage"));
console.log(memoire.dernier_decollage);
`;

export const chapter4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : MÉMOIRE & IDENTITÉ",
  title: "MÉMOIRE &\nIDENTITÉ",
  subtitle: "Mémoire persistante, personnalité et assemblage de ton agent",
  totalXp: 164,
  completionBadge: "🧬",
  completionBadgeLabel: "CRÉATEUR D'AGENT",
  steps: [
    {
      startCode: `${LIRE_MEMOIRE}
// Écris retenir(cle, valeur) :
//   lit la mémoire, y range le fait, puis la réécrit dans localStorage
//   (JSON.stringify, clé "memoire-orbi")
//
// Écris rappeler(cle) :
//   renvoie la valeur mémorisée, ou "inconnu" si la clé n'existe pas
${ESSAIS_MEMOIRE}`,
      placeholder: '// localStorage.setItem("memoire-orbi", JSON.stringify(memoire));',
      narrator:
        "ORBI agit, mais il t'oublie à chaque conversation. Un copilote personnel doit se souvenir de toi. On lui construit une mémoire qui survit à la fin de l'échange.",
      hint: `${LIRE_MEMOIRE}
function retenir(cle, valeur) {
  const memoire = lireMemoire();
  memoire[cle] = valeur;
  localStorage.setItem("memoire-orbi", JSON.stringify(memoire));
}

function rappeler(cle) {
  const memoire = lireMemoire();
  return memoire[cle] || "inconnu";
}
${ESSAIS_MEMOIRE}`,
      briefing: {
        title: "Une mémoire qui survit à la conversation",
        content: `
### Deux mémoires
- la **mémoire de travail** : l'historique \`messages\`. Elle disparaît quand la conversation se termine.
- la **mémoire longue** : des faits rangés ailleurs, relus à la conversation suivante.

Le modèle n'a ni l'une ni l'autre. Les deux sont tenues par **ton programme**.

### Où ranger la mémoire longue
N'importe quel stockage convient : un fichier, une base de données, ou ici \`localStorage\`. L'idée est toujours la même : des paires **clé → valeur**.

\`{ "pilote": "Lia", "vaisseau": "Aurore" }\`

### Écrire
\`localStorage\` ne stocke que du texte : on convertit l'objet avec \`JSON.stringify\`.

\`localStorage.setItem("memoire-orbi", JSON.stringify(memoire));\`

### Relire
\`JSON.parse\` fait le chemin inverse. C'est le rôle de \`lireMemoire\`, déjà fournie.

### Le fait absent
\`rappeler("planete")\` doit répondre \`"inconnu"\`, pas \`undefined\`. Un agent qui ignore quelque chose doit le **dire**, pas l'inventer.

**Mission :** écris \`retenir\` et \`rappeler\`. Les essais en bas du code doivent retrouver le pilote et le vaisseau, et signaler la planète inconnue.
        `,
      },
      objectives: [
        { id: "o1a", label: "Enregistrer un fait de façon persistante" },
        { id: "o1b", label: "Relire un fait, ou signaler qu'il est inconnu" },
      ],
      missionIcon: "💾",
      missionTag: "PROTOCOLE 01",
      missionTtl: "BANQUE DE MÉMOIRE",
      bannerIcon: "💾",
      bannerTtl: "MÉMOIRE EN LIGNE",
      bannerSub: "Ce qu'ORBI apprend aujourd'hui, il le saura demain.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `const memoire = { pilote: "Lia", vaisseau: "Aurore" };
${NOYAU_ACCUEIL}
// Écris construireSysteme() : elle renvoie le message system complet,
// construit À PARTIR de l'objet memoire (Object.entries, map, join) :
//   "Tu es ORBI, copilote de la station Nebula. Faits connus : pilote = Lia, vaisseau = Aurore"
//
// Crée ensuite messages (system + un message user "Bonjour ORBI"),
// puis affiche construireSysteme() et le content de noyau(messages).
`,
      placeholder: '// Object.entries(memoire).map(([cle, valeur]) => cle + " = " + valeur).join(", ")',
      narrator:
        "Une mémoire que le modèle ne lit pas ne sert à rien. Pour qu'ORBI sache qui tu es, glisse ses souvenirs dans le message system, celui qu'il relit à chaque appel.",
      hint: `const memoire = { pilote: "Lia", vaisseau: "Aurore" };
${NOYAU_ACCUEIL}
function construireSysteme() {
  const faits = Object.entries(memoire)
    .map(([cle, valeur]) => cle + " = " + valeur)
    .join(", ");
  return "Tu es ORBI, copilote de la station Nebula. Faits connus : " + faits;
}

const messages = [
  { role: "system", content: construireSysteme() },
  { role: "user", content: "Bonjour ORBI" },
];

console.log(construireSysteme());
console.log(noyau(messages).content);`,
      briefing: {
        title: "Injecter la mémoire dans le message system",
        content: `
### Le modèle ne lit que la conversation
Ta mémoire longue est dans un stockage. Le modèle, lui, ne voit que \`messages\`. Pour qu'il connaisse un fait, il faut l'**écrire dans la conversation**.

### Le message system, construit à la volée
Au lieu d'un texte fixe, le message system devient le résultat d'une fonction :

\`{ role: "system", content: construireSysteme() }\`

Il assemble deux choses :
- l'**identité** de l'agent : « Tu es ORBI, copilote de la station Nebula. »
- les **faits connus**, tirés de la mémoire

### Transformer un objet en texte
\`Object.entries(memoire)\` donne les paires \`[cle, valeur]\`.
\`.map(([cle, valeur]) => cle + " = " + valeur)\` en fait des morceaux de texte.
\`.join(", ")\` les relie.

### Pourquoi ne pas l'écrire en dur
Si tu tapes « pilote = Lia » directement dans le texte, ORBI ne saura jamais rien de nouveau. Construit depuis \`memoire\`, le message system suit la mémoire : un fait ajouté aujourd'hui est connu au prochain appel.

### C'est la personnalisation
Un assistant « qui te connaît » ne fait rien de plus magique : il relit des faits sur toi, glissés dans ses consignes avant chaque conversation.

**Mission :** écris \`construireSysteme\`, branche-la sur le message system, puis vérifie qu'ORBI te salue par ton nom de pilote.
        `,
      },
      objectives: [
        { id: "o2a", label: "Construire le message system depuis la mémoire" },
        { id: "o2b", label: "Obtenir une réponse personnalisée du modèle" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 02",
      missionTtl: "IDENTITÉ",
      bannerIcon: "🧬",
      bannerTtl: "ORBI TE RECONNAÎT",
      bannerSub: "Ses souvenirs font maintenant partie de ses consignes.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `const memoire = {};

const outils = {
  // Ajoute l'outil retenir :
  //   description : "Mémorise un fait, au format cle=valeur"
  //   executer    : reçoit un argument "cle=valeur", range la valeur
  //                 dans memoire[cle], puis renvoie "cle = valeur"
};
${UTILISER_PROTEGE}${NOYAU_RETENIR}${AGENT_BORNE}
console.log(agent("Retiens que mon vaisseau est Aurore"));
console.log(memoire.vaisseau);
`,
      placeholder: '// retenir: { description: "...", executer: (argument) => { ... } },',
      narrator:
        "Jusqu'ici, c'est toi qui remplissais la mémoire. Fais-en un outil : c'est alors le modèle qui décide, en pleine conversation, de ce qui mérite d'être retenu.",
      hint: `const memoire = {};

const outils = {
  retenir: {
    description: "Mémorise un fait, au format cle=valeur",
    executer: (argument) => {
      const morceaux = argument.split("=");
      memoire[morceaux[0]] = morceaux[1];
      return morceaux[0] + " = " + morceaux[1];
    },
  },
};
${UTILISER_PROTEGE}${NOYAU_RETENIR}${AGENT_BORNE}
console.log(agent("Retiens que mon vaisseau est Aurore"));
console.log(memoire.vaisseau);`,
      briefing: {
        title: "La mémoire comme outil",
        content: `
### Qui décide de retenir ?
Tu ne peux pas prévoir à l'avance ce qui sera important dans une conversation. Le modèle, lui, le lit au fil de l'échange. On lui donne donc le **moyen** de retenir : un outil.

### L'outil retenir
C'est un outil comme les autres : une description, une fonction.

- **description** : « Mémorise un fait, au format cle=valeur »
- **executer** : découpe l'argument, range la valeur, confirme

### Découper l'argument
Le modèle envoie un seul texte : \`"vaisseau=Aurore"\`.

\`const morceaux = argument.split("=");\`

\`morceaux[0]\` est la clé, \`morceaux[1]\` la valeur.

### Confirmer
L'outil renvoie \`"vaisseau = Aurore"\`. Ce retour est essentiel : c'est en le lisant que le modèle sait que la mémorisation a réussi, et qu'il peut te répondre « C'est noté ».

### Ce qui vient de changer
Rien dans la boucle d'agent : elle exécute \`retenir\` comme elle exécutait \`scanner\`. Ajouter une capacité à un agent, c'est **ajouter un outil**. La boucle, elle, ne bouge plus.

### Garde-fou
Un outil qui écrit dans la mémoire agit durablement. Dans un vrai agent, on limite ce qu'il peut retenir et on ne lui confie jamais de secret.

**Mission :** ajoute l'outil \`retenir\` au registre. L'agent doit confirmer le fait, et \`memoire.vaisseau\` doit valoir Aurore.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter un outil retenir au registre" },
        { id: "o3b", label: "Laisser le modèle décider de mémoriser" },
      ],
      missionIcon: "📌",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SOUVENIR VOLONTAIRE",
      bannerIcon: "📌",
      bannerTtl: "ORBI RETIENT SEUL",
      bannerSub: "Une capacité de plus, sans toucher à la boucle.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Ton agent personnel. Remplace les ??? : donne-lui SON nom, et le tien.
const NOM_AGENT = "???";
const PILOTE = "???";

const memoire = { pilote: PILOTE };
${OUTILS_DECOLLAGE}${UTILISER_PROTEGE}${NOYAU_DECOLLAGE}
// 1. Écris construireSysteme() : elle renvoie
//    "Tu es <NOM_AGENT>, copilote personnel. Faits connus : pilote = <PILOTE>"
//    (les faits sont construits depuis l'objet memoire)
//
// 2. Écris agent(demande) : la boucle complète, avec
//    - le message system construit par construireSysteme()
//    - une limite MAX_TOURS de 5 tours et son message d'arrêt
//    - le journal de bord : "Tour <tour> : <outil>(<argument>)"
${ESSAI_DECOLLAGE}`,
      placeholder: '// const NOM_AGENT = "..."; function construireSysteme() { ... }',
      narrator:
        "Dernière mission, Cadet. Messages, outils, boucle, garde-fous, mémoire : tu as toutes les pièces. Assemble ton propre copilote, donne-lui un nom, et confie-lui la checklist de décollage.",
      hint: `const NOM_AGENT = "ORBI";
const PILOTE = "Lia";

const memoire = { pilote: PILOTE };
${OUTILS_DECOLLAGE}${UTILISER_PROTEGE}${NOYAU_DECOLLAGE}
function construireSysteme() {
  const faits = Object.entries(memoire)
    .map(([cle, valeur]) => cle + " = " + valeur)
    .join(", ");
  return "Tu es " + NOM_AGENT + ", copilote personnel. Faits connus : " + faits;
}

const MAX_TOURS = 5;

function agent(demande) {
  const messages = [
    { role: "system", content: construireSysteme() },
    { role: "user", content: demande },
  ];
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    const reponse = noyau(messages);
    messages.push(reponse);
    if (!reponse.outil) return reponse.content;
    console.log("Tour " + tour + " : " + reponse.outil + "(" + reponse.argument + ")");
    const resultat = utiliser(reponse.outil, reponse.argument);
    messages.push({ role: "tool", content: resultat });
  }
  return "Arrêt de sécurité : limite de " + MAX_TOURS + " tours atteinte";
}
${ESSAI_DECOLLAGE}`,
      briefing: {
        title: "Assembler ton agent personnel",
        content: `
### Les cinq pièces
- une **identité** : le message system, avec son nom et ce qu'il sait de toi
- un **modèle** : ici le noyau simulé
- des **outils** : \`verifier\` et \`retenir\`
- une **boucle** bornée par \`MAX_TOURS\`, avec son journal de bord
- une **mémoire** que l'agent enrichit lui-même

### Sa micro-tâche
La checklist de décollage : vérifier les moteurs, vérifier le carburant, noter le décollage en mémoire, puis rendre son rapport. Tu ne codes **aucune** de ces étapes : le modèle les choisit, ta boucle les exécute.

### Passer à un vrai modèle
Une seule fonction change : \`noyau\`. Au lieu de simuler, elle envoie la conversation à l'API d'un fournisseur de modèles et attend la réponse :

- une requête HTTP \`POST\` avec \`fetch\`, contenant \`messages\` et la liste des outils
- un \`await\`, car la réponse met du temps à arriver : \`agent\` devient une fonction \`async\`
- la réponse du fournisseur, traduite vers la forme que ta boucle connaît

Chaque fournisseur a son format exact : sa documentation te donne les noms des champs. Ta boucle, tes outils et ta mémoire restent les mêmes.

### La règle de sécurité
Un vrai modèle demande une **clé d'API**, qui est un secret. Elle ne va **jamais** dans du code exécuté par le navigateur : l'appel passe par ton propre serveur, qui garde la clé.

### Ce que tu sais faire
Tu sais lire, corriger et construire un agent IA. Les outils changent, les modèles progressent, mais la mécanique reste celle-ci : **un modèle, des outils, une boucle, une mémoire**.

**Mission :** nomme ton agent, écris \`construireSysteme\` et la boucle \`agent\`, puis lance la checklist de décollage.
        `,
      },
      objectives: [
        { id: "o4a", label: "Donner à l'agent son identité et ta mémoire" },
        { id: "o4b", label: "Assembler la boucle complète et mener la micro-tâche" },
      ],
      missionIcon: "🚀",
      missionTag: "PROTOCOLE 04",
      missionTtl: "DÉCOLLAGE ASSISTÉ",
      bannerIcon: "🚀",
      bannerTtl: "COPILOTE OPÉRATIONNEL",
      bannerSub: "Ton agent personnel vient de mener sa première mission.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
