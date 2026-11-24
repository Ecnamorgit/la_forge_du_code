import type { ChapterData } from "@/data/courses/html/types";

/**
 * Simulated model handed to the learner in the start code. It stands in for a
 * real language model: no network call is possible from the sandbox, so the
 * replies are deterministic and can be validated on the console output.
 */
const NOYAU_ECHO = `// Le noyau simulé : il joue le rôle du modèle de langage.
// Il reçoit TOUTE la conversation et renvoie UN message "assistant".
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  return {
    role: "assistant",
    content: "ORBI en ligne. Bien reçu : " + dernier.content,
  };
}
`;

/** Same core, but its reply depends on the history it is given. */
const NOYAU_COMPTEUR = `// Le noyau simulé : il n'a AUCUNE mémoire. Il ne connaît que
// les messages que tu lui passes, et compte les messages "user".
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  const echanges = messages.filter((m) => m.role === "user").length;
  return {
    role: "assistant",
    content: "Échange n°" + echanges + ". Bien reçu : " + dernier.content,
  };
}
`;

const CONVERSATION = `
const messages = [
  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
  { role: "user", content: "ORBI, tu me reçois ?" },
];
`;

export const chapter1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ÉVEIL DU COPILOTE",
  title: "ÉVEIL DU\nCOPILOTE",
  subtitle: "Messages, rôles et historique : parler à un modèle de langage",
  totalXp: 164,
  completionBadge: "🤖",
  completionBadgeLabel: "ÉVEILLEUR DE COPILOTE",
  steps: [
    {
      startCode: `// Construis la conversation dans un tableau messages :
//   1. un message de role "system" :
//      "Tu es ORBI, copilote de la station Nebula."
//   2. un message de role "user" :
//      "ORBI, tu me reçois ?"
// Affiche ensuite messages.length, puis le role de chaque message.
`,
      placeholder: '// const messages = [{ role: "system", content: "..." }, ...];',
      narrator:
        "Cadet, la station manque de bras. Tu vas construire ORBI, ton copilote personnel : un agent IA. Tout commence par la seule chose qu'un modèle de langage comprend, une conversation.",
      hint: `const messages = [
  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
  { role: "user", content: "ORBI, tu me reçois ?" },
];

console.log(messages.length);
for (const message of messages) {
  console.log(message.role);
}`,
      briefing: {
        title: "Une conversation est un tableau de messages",
        content: `
### Ce qu'est un agent IA
Un **agent** est un programme qui confie ses décisions à un **modèle de langage** (un LLM), et qui exécute ce que le modèle décide. Dans ce cursus, tu écris le programme autour du modèle : c'est lui, l'agent.

### Le modèle ne voit que des messages
Un LLM reçoit une liste de **messages** et renvoie le message suivant. Rien d'autre. Chaque message est un objet :

\`{ role: "user", content: "ORBI, tu me reçois ?" }\`

### Les rôles
- **system** : les consignes permanentes. Qui est l'agent, comment il se comporte.
- **user** : ce que dit l'humain.
- **assistant** : ce que répond le modèle.

### Le message system
C'est la **personnalité** de ton agent. Il se place en premier, et le modèle le relit à chaque appel.

\`{ role: "system", content: "Tu es ORBI, copilote de la station Nebula." }\`

### Un format universel
Les API des vrais modèles utilisent presque toutes cette forme : un tableau d'objets \`role\` + \`content\`. Ce que tu écris ici se transpose tel quel.

**Mission :** crée \`messages\` avec un message system et un message user, puis affiche sa longueur et le rôle de chaque message.
        `,
      },
      objectives: [
        { id: "o1a", label: "Créer un message system et un message user" },
        { id: "o1b", label: "Parcourir la conversation et afficher les rôles" },
      ],
      missionIcon: "💬",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER CONTACT",
      bannerIcon: "💬",
      bannerTtl: "CANAL OUVERT",
      bannerSub: "La conversation est prête : il reste à la confier au modèle.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${NOYAU_ECHO}${CONVERSATION}
// Appelle noyau avec la conversation et range le résultat dans reponse.
// Affiche ensuite reponse.role, puis reponse.content.
`,
      placeholder: "// const reponse = noyau(messages);",
      narrator:
        "Voici le noyau d'ORBI. Sur la station, c'est une simulation : aucun vrai modèle ne tourne dans ton navigateur. Mais il se pilote exactement comme un vrai, par un appel et une réponse.",
      hint: `${NOYAU_ECHO}${CONVERSATION}
const reponse = noyau(messages);
console.log(reponse.role);
console.log(reponse.content);`,
      briefing: {
        title: "Appeler le modèle",
        content: `
### Un modèle est une fonction
Vu depuis ton code, un LLM se résume à ceci :

**conversation en entrée, un message en sortie.**

\`const reponse = noyau(messages);\`

La réponse est elle-même un message, de rôle **assistant** :

\`{ role: "assistant", content: "..." }\`

### Le noyau simulé
La fonction \`noyau\` fournie dans l'éditeur **remplace** le modèle. Elle est déterministe : mêmes messages, même réponse. C'est ce qui permet de valider ton agent sans clé d'API ni réseau.

### Et avec un vrai modèle ?
La seule ligne qui change est l'appel : au lieu de \`noyau(messages)\`, tu envoies \`messages\` par HTTP à l'API d'un fournisseur, et tu attends sa réponse avec \`await\`. Tout le reste de ton agent reste identique.

### Lis le noyau
Prends dix secondes pour lire son code : il regarde le **dernier** message et répond en conséquence. Un vrai modèle fait la même chose, avec quelques milliards de paramètres de plus.

**Mission :** appelle \`noyau\`, range sa réponse dans \`reponse\`, puis affiche son rôle et son contenu.
        `,
      },
      objectives: [
        { id: "o2a", label: "Appeler le modèle avec la conversation" },
        { id: "o2b", label: "Lire le rôle et le contenu de la réponse" },
      ],
      missionIcon: "🧠",
      missionTag: "PROTOCOLE 02",
      missionTtl: "PREMIER ÉVEIL",
      bannerIcon: "🧠",
      bannerTtl: "ORBI RÉPOND",
      bannerSub: "Conversation en entrée, message en sortie : le cycle de base.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${NOYAU_COMPTEUR}${CONVERSATION}
// 1. Appelle noyau et AJOUTE sa réponse à messages (push)
// 2. Ajoute un nouveau message user : "Quel est ton rôle ?"
// 3. Rappelle noyau, ajoute sa réponse, puis affiche son content
// 4. Affiche messages.length
`,
      placeholder: "// messages.push(reponse);",
      narrator:
        "Point crucial, Cadet : le modèle oublie tout entre deux appels. Sa mémoire, c'est toi qui la tiens. Chaque réponse doit retourner dans la conversation, sinon ORBI repart de zéro.",
      hint: `${NOYAU_COMPTEUR}${CONVERSATION}
const premiere = noyau(messages);
messages.push(premiere);

messages.push({ role: "user", content: "Quel est ton rôle ?" });

const seconde = noyau(messages);
messages.push(seconde);
console.log(seconde.content);

console.log(messages.length);`,
      briefing: {
        title: "L'historique : la mémoire, c'est toi",
        content: `
### Le modèle est sans état
Un LLM ne se souvient de **rien** d'un appel à l'autre. S'il a l'air de suivre une discussion, c'est parce qu'on lui renvoie **toute la conversation** à chaque fois.

### La règle
Après chaque appel, on range la réponse dans l'historique :

\`messages.push(reponse);\`

Puis on ajoute le message suivant de l'humain, et on rappelle le modèle avec le tableau complet.

### L'ordre compte
Une conversation saine alterne :
- system (une fois, au début)
- user
- assistant
- user
- assistant

### Ce que ça implique
- **Oublier un push**, c'est rendre ton agent amnésique.
- L'historique **grandit** à chaque échange. Les vrais modèles ont une limite de taille (la fenêtre de contexte) et facturent ce qu'ils relisent : on finit par résumer ou couper les vieux messages.

### Vérifie-le
Le noyau de cette étape compte les messages user qu'il reçoit. S'il annonce le mauvais numéro d'échange, c'est qu'un message manque à l'appel.

**Mission :** mène deux échanges complets en gardant l'historique, puis affiche la seconde réponse et la taille de la conversation.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter chaque réponse du modèle à l'historique" },
        { id: "o3b", label: "Enchaîner un second échange avec tout l'historique" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 03",
      missionTtl: "FIL DE LA CONVERSATION",
      bannerIcon: "🗂",
      bannerTtl: "HISTORIQUE TENU",
      bannerSub: "ORBI suit le fil, parce que tu lui tends à chaque appel.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${NOYAU_COMPTEUR}
const messages = [
  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
];

// Écris la fonction envoyer(texte) :
//   1. ajoute le message user à messages
//   2. appelle noyau avec toute la conversation
//   3. ajoute la réponse à messages
//   4. renvoie le content de la réponse

console.log(envoyer("Statut des moteurs ?"));
console.log(envoyer("Et le carburant ?"));
`,
      placeholder: "// function envoyer(texte) { ... }",
      narrator:
        "Tu répètes les mêmes gestes à chaque échange : range-les dans une fonction. C'est la première brique d'ORBI, un tour de parole complet en un seul appel.",
      hint: `${NOYAU_COMPTEUR}
const messages = [
  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
];

function envoyer(texte) {
  messages.push({ role: "user", content: texte });
  const reponse = noyau(messages);
  messages.push(reponse);
  return reponse.content;
}

console.log(envoyer("Statut des moteurs ?"));
console.log(envoyer("Et le carburant ?"));`,
      briefing: {
        title: "Un tour de parole en une fonction",
        content: `
### Le cycle d'un échange
Chaque tour de parole suit les mêmes quatre gestes :
- ajouter le message **user** à l'historique
- appeler le **modèle** avec toute la conversation
- ajouter la réponse **assistant** à l'historique
- rendre le texte de la réponse

### Pourquoi une fonction
\`envoyer("Statut des moteurs ?")\`

Celui qui utilise ton agent n'a plus à penser à l'historique : impossible d'oublier un \`push\`. La conversation vit dans \`messages\`, la fonction la tient à jour.

### C'est déjà un chatbot
Un message system, un historique, une fonction \`envoyer\` : tu viens d'écrire le cœur de n'importe quel assistant conversationnel.

### Ce qui lui manque pour être un agent
ORBI parle, mais il ne **fait** rien. Il ne peut ni scanner un secteur, ni lire l'heure, ni réparer quoi que ce soit. Au prochain chapitre, tu lui donnes des **outils**.

**Mission :** écris \`envoyer\`. Les deux appels en bas du code doivent afficher les échanges n°1 et n°2.
        `,
      },
      objectives: [
        { id: "o4a", label: "Regrouper un tour de parole dans envoyer(texte)" },
        { id: "o4b", label: "Conserver l'historique entre deux appels" },
      ],
      missionIcon: "🤖",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TOUR DE PAROLE",
      bannerIcon: "🤖",
      bannerTtl: "COPILOTE ÉVEILLÉ",
      bannerSub: "ORBI converse. Prochaine étape : lui donner des mains.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
