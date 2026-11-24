import type { ChapterData } from "@/data/courses/html/types";

/** Tool registry shared by the steps of this chapter. */
const OUTILS = `const outils = {
  scanner: {
    description: "Analyse un secteur de la station",
    executer: (secteur) => "Secteur " + secteur + " : aucune anomalie",
  },
  horloge: {
    description: "Donne l'heure de bord",
    executer: () => "Heure de bord : 14h07",
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

/** Simulated model that asks for a tool instead of answering. */
const NOYAU_DEMANDE = `
// Le noyau simulé : s'il lit "scan", il ne répond pas par du texte,
// il DEMANDE un outil.
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  if (dernier.role === "user" && dernier.content.includes("scan")) {
    return { role: "assistant", outil: "scanner", argument: "B4" };
  }
  return { role: "assistant", content: "Rien à signaler, Cadet." };
}
`;

/** Same core, able to read a tool result and write the final answer. */
const NOYAU_RAPPORT = `
// Le noyau simulé : il demande un scan, puis rédige son rapport
// quand il reçoit le résultat de l'outil.
function noyau(messages) {
  const dernier = messages[messages.length - 1];
  if (dernier.role === "tool") {
    return { role: "assistant", content: "Rapport d'ORBI : " + dernier.content };
  }
  if (dernier.role === "user" && dernier.content.includes("scan")) {
    return { role: "assistant", outil: "scanner", argument: "B4" };
  }
  return { role: "assistant", content: "Rien à signaler, Cadet." };
}
`;

const CONVERSATION = `
const messages = [
  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },
  { role: "user", content: "Lance un scan du secteur B4" },
];
`;

export const chapter2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : BOÎTE À OUTILS",
  title: "BOÎTE À\nOUTILS",
  subtitle: "Donner des outils au modèle et exécuter ses demandes",
  totalXp: 164,
  completionBadge: "🧰",
  completionBadgeLabel: "OUTILLEUR DE BORD",
  steps: [
    {
      startCode: `// Un outil = un nom, une description (lue par le modèle), une fonction.
// Crée l'objet scanner :
//   nom         : "scanner"
//   description : "Analyse un secteur de la station"
//   executer    : reçoit un secteur et renvoie
//                 "Secteur <secteur> : aucune anomalie"
// Affiche ensuite scanner.nom, puis scanner.executer("B4").
`,
      placeholder: '// const scanner = { nom: "scanner", description: "...", executer: ... };',
      narrator:
        "ORBI sait parler, mais un modèle de langage ne produit que du texte. Il ne peut pas scanner un secteur. Toi, si : tu vas lui fabriquer des outils qu'il pourra te demander d'actionner.",
      hint: `const scanner = {
  nom: "scanner",
  description: "Analyse un secteur de la station",
  executer: (secteur) => "Secteur " + secteur + " : aucune anomalie",
};

console.log(scanner.nom);
console.log(scanner.executer("B4"));`,
      briefing: {
        title: "Un outil : nom, description, fonction",
        content: `
### Le modèle ne fait rien tout seul
Un LLM génère du texte. Il ne lit pas d'horloge, n'ouvre pas de fichier, n'appelle pas de capteur. Pour agir, il a besoin que **ton programme** agisse à sa place.

### Un outil
Un **outil** est une fonction de ton code que tu mets à disposition du modèle. Il a trois parties :

- **nom** : l'identifiant que le modèle utilisera pour le demander
- **description** : une phrase qui explique à quoi il sert
- **executer** : la fonction qui fait vraiment le travail

### La description est pour le modèle
C'est en lisant les descriptions que le modèle choisit quel outil demander. Une description vague donne un outil mal utilisé. Écris-la comme une consigne à un collègue : précise, courte, sans ambiguïté.

### Le résultat est du texte
\`executer\` renvoie une **chaîne** : c'est ce texte qui retournera dans la conversation pour que le modèle le lise.

### Dans les vraies API
On transmet au modèle la liste des outils (nom, description, forme des arguments). Le principe est le même, seul l'emballage change.

**Mission :** crée l'outil \`scanner\`, puis affiche son nom et le résultat d'un scan du secteur B4.
        `,
      },
      objectives: [
        { id: "o1a", label: "Décrire un outil : nom, description, fonction" },
        { id: "o1b", label: "Exécuter l'outil et lire son résultat" },
      ],
      missionIcon: "🔧",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER OUTIL",
      bannerIcon: "🔧",
      bannerTtl: "SCANNER OPÉRATIONNEL",
      bannerSub: "Ton premier outil est prêt à être demandé.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${OUTILS}
function utiliser(nom, argument) {
  const outil = outils.nom;
  if (!outil) return "Outil inconnu : " + nom;
  return outil.executer(argument);
}

console.log(utiliser("scanner", "B4"));
console.log(utiliser("horloge"));
console.log(utiliser("laser", "B4"));
`,
      spectreTrap:
        "J'ai débranché ta boîte à outils, Cadet. Ton copilote cherche un outil appelé « nom »... et ne trouvera jamais rien. Pratique, non ?",
      placeholder: "// Répare la recherche de l'outil",
      narrator:
        "Avec plusieurs outils, il faut un aiguillage : une fonction qui reçoit un nom et lance le bon outil. Le Spectre vient de saboter le tien.",
      hint: `${OUTILS}
function utiliser(nom, argument) {
  const outil = outils[nom];
  if (!outil) return "Outil inconnu : " + nom;
  return outil.executer(argument);
}

console.log(utiliser("scanner", "B4"));
console.log(utiliser("horloge"));
console.log(utiliser("laser", "B4"));`,
      briefing: {
        title: "Le registre d'outils et son aiguillage",
        content: `
### Un registre
On range les outils dans un objet, avec leur **nom comme clé** :

\`const outils = { scanner: { ... }, horloge: { ... } };\`

### L'aiguillage
Le modèle te donnera un nom d'outil sous forme de **texte**. Une seule fonction fait le lien entre ce texte et le code à lancer :

\`utiliser("scanner", "B4")\`

### Point ou crochets ?
- \`outils.nom\` cherche une clé qui s'appelle littéralement **nom**
- \`outils[nom]\` cherche la clé dont le nom est **la valeur** de la variable \`nom\`

Quand la clé vient d'une variable, il faut les crochets.

### Outil inconnu
Un modèle peut demander un outil qui n'existe pas. Ce n'est pas rare : il invente parfois. Ton aiguillage ne doit **pas planter** : il renvoie un message clair, que le modèle pourra lire pour corriger sa demande.

\`"Outil inconnu : laser"\`

**À retenir :** le nom d'outil vient du modèle, donc de l'extérieur. Ne lui fais jamais confiance les yeux fermés.

**Mission :** le Spectre a saboté \`utiliser\`. Répare la recherche pour que le scanner et l'horloge répondent, et que le laser reste inconnu.
        `,
      },
      objectives: [
        { id: "o2a", label: "Retrouver un outil par son nom avec outils[nom]" },
        { id: "o2b", label: "Répondre proprement à un outil inconnu" },
      ],
      missionIcon: "🧰",
      missionTag: "PROTOCOLE 02",
      missionTtl: "AIGUILLAGE SABOTÉ",
      bannerIcon: "🧰",
      bannerTtl: "AIGUILLAGE RÉTABLI",
      bannerSub: "Chaque nom mène de nouveau au bon outil.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${OUTILS}${UTILISER}${NOYAU_DEMANDE}${CONVERSATION}
// 1. Appelle noyau et range sa réponse dans reponse
// 2. Si reponse.outil existe :
//      affiche "Outil demandé : " + reponse.outil
//      exécute-le avec utiliser(...) et affiche le résultat
//    Sinon : affiche reponse.content
`,
      placeholder: "// if (reponse.outil) { ... } else { ... }",
      narrator:
        "Moment clé, Cadet. Le modèle ne lance jamais un outil lui-même : il te le demande, par écrit. C'est ton programme qui lit la demande et qui décide de l'exécuter.",
      hint: `${OUTILS}${UTILISER}${NOYAU_DEMANDE}${CONVERSATION}
const reponse = noyau(messages);

if (reponse.outil) {
  console.log("Outil demandé : " + reponse.outil);
  const resultat = utiliser(reponse.outil, reponse.argument);
  console.log(resultat);
} else {
  console.log(reponse.content);
}`,
      briefing: {
        title: "Le modèle demande, ton code exécute",
        content: `
### Deux sortes de réponses
Quand il dispose d'outils, le modèle peut répondre de deux façons :

- du **texte** : \`{ role: "assistant", content: "..." }\`
- une **demande d'outil** : \`{ role: "assistant", outil: "scanner", argument: "B4" }\`

### Qui fait quoi
- le **modèle** choisit l'outil et ses arguments
- ton **programme** exécute, s'il le veut bien

Le modèle n'a aucun accès direct à tes fonctions. C'est le garde-fou central d'un agent : tu peux refuser, journaliser, ou demander confirmation avant toute action sensible.

### Le test
\`if (reponse.outil) { ... } else { ... }\`

Ce \`if\` est la **bifurcation** de tout agent : soit il reste du travail à faire avec un outil, soit le modèle a fini et on affiche sa réponse.

### Dans les vraies API
La demande d'outil arrive dans un format plus verbeux (un identifiant d'appel, des arguments en JSON), mais elle porte les mêmes informations : quel outil, avec quoi.

**Mission :** appelle le noyau. S'il demande un outil, annonce-le et exécute-le. Sinon, affiche son texte.
        `,
      },
      objectives: [
        { id: "o3a", label: "Distinguer une demande d'outil d'une réponse texte" },
        { id: "o3b", label: "Exécuter l'outil demandé par le modèle" },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "DEMANDE D'OUTIL",
      bannerIcon: "📡",
      bannerTtl: "DEMANDE EXÉCUTÉE",
      bannerSub: "Le modèle décide, ton code agit : ORBI a des mains.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `${OUTILS}${UTILISER}${NOYAU_RAPPORT}${CONVERSATION}
// 1. Appelle noyau et ajoute sa réponse à messages
// 2. Exécute l'outil demandé, puis ajoute le résultat à messages :
//      { role: "tool", content: resultat }
// 3. Rappelle noyau et affiche le content de sa réponse finale
`,
      placeholder: '// messages.push({ role: "tool", content: resultat });',
      narrator:
        "Le scan est fait, mais ORBI n'en sait rien : le résultat est resté dans ton code. Renvoie-le dans la conversation, et laisse le modèle rédiger son rapport.",
      hint: `${OUTILS}${UTILISER}${NOYAU_RAPPORT}${CONVERSATION}
const demande = noyau(messages);
messages.push(demande);

const resultat = utiliser(demande.outil, demande.argument);
messages.push({ role: "tool", content: resultat });

const finale = noyau(messages);
console.log(finale.content);`,
      briefing: {
        title: "Renvoyer le résultat au modèle",
        content: `
### Le circuit complet
Un appel d'outil se joue en quatre temps :

- le modèle **demande** un outil
- ton code **exécute** l'outil
- ton code **renvoie** le résultat dans la conversation
- le modèle **lit** le résultat et répond

Sans le troisième temps, le modèle ne saura jamais ce que l'outil a trouvé.

### Le message tool
Le résultat se range dans l'historique avec un rôle dédié :

\`messages.push({ role: "tool", content: resultat });\`

### L'ordre dans l'historique
- user : la demande de l'humain
- assistant : la demande d'outil du modèle
- tool : le résultat
- assistant : la réponse finale

La demande d'outil du modèle doit elle aussi être ajoutée à l'historique, **avant** le résultat. Sinon le modèle lit un résultat sorti de nulle part.

### Pourquoi repasser par le modèle
Le résultat brut d'un outil est rarement une bonne réponse. C'est le modèle qui le reformule, le croise avec la question, et décide s'il faut un autre outil.

**Mission :** exécute l'outil demandé, renvoie son résultat avec le rôle \`tool\`, puis affiche la réponse finale du noyau.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter le résultat avec le rôle tool" },
        { id: "o4b", label: "Rappeler le modèle pour obtenir la réponse finale" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RETOUR D'OUTIL",
      bannerIcon: "🧰",
      bannerTtl: "CIRCUIT BOUCLÉ",
      bannerSub: "Demande, exécution, résultat, réponse : le circuit est complet.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
