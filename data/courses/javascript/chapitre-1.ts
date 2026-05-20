import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : PROTOCOLE DE COMMUNICATION",
  title: "PREMIER\nSIGNAL",
  subtitle: "Affiche tes premiers messages et utilise des variables",
  totalXp: 200,
  completionBadge: "📟",
  completionBadgeLabel: "OPERATEUR RADIO",
  steps: [
    {
      startCode: "// Affiche un message dans la console\n",
      placeholder: "// Ecris ton code ici",
      narrator:
        "Cadet, ton premier ordre est d'envoyer un signal radio. En JavaScript, on parle a la console via console.log.",
      hint: 'Ecris : console.log("Bonjour, station Nebula");',
      briefing: {
        title: "Le premier signal : console.log",
        content: `
### console.log
**console.log(...)** envoie un message vers la **console** du navigateur. C'est l'outil n°1 pour observer ce que fait ton code.

### Syntaxe
\`console.log("Bonjour, station Nebula");\`

### A retenir
- Les chaines de texte se mettent entre **guillemets** ("..." ou '...').
- Chaque instruction se termine par **;** (recommande, meme si JS pardonne souvent l'oubli).
- Le panneau "Sortie console" en bas affiche tout ce que tu logues.

**Mission :** affiche exactement \`Bonjour, station Nebula\`.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser console.log" },
        { id: "o1b", label: 'Afficher "Bonjour, station Nebula"' },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER SIGNAL",
      bannerIcon: "📟",
      bannerTtl: "RADIO ACTIVE",
      bannerSub: "La console a recu ton message — la liaison est ouverte.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '// Stocke ton indicatif dans une variable puis affiche-le\n',
      placeholder: "// Utilise let pour creer une variable",
      narrator:
        "Maintenant, donne-toi un indicatif d'appel. En JS, **let** declare une variable que tu pourras modifier plus tard.",
      hint: 'Ecris : let callsign = "NEBULA-7"; puis console.log(callsign);',
      briefing: {
        title: "Variables avec let",
        content: `
### let — declarer une variable modifiable
\`let callsign = "NEBULA-7";\`

- **let** dit : "je cree une boite nommee callsign".
- Le **=** range la valeur dans la boite.
- Tu peux changer la valeur plus tard : \`callsign = "ECLIPSE-3";\`

### Afficher la variable
\`console.log(callsign);\`

Note : pas de guillemets autour de **callsign** — sinon tu afficherais litteralement le mot "callsign".

**Mission :** cree une variable et affiche-la (peu importe son nom et sa valeur — du moment qu'elle s'affiche).
        `,
      },
      objectives: [
        { id: "o2a", label: "Declarer une variable avec let" },
        { id: "o2b", label: "Afficher sa valeur avec console.log" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 02",
      missionTtl: "BOITE A VALEUR",
      bannerIcon: "🪪",
      bannerTtl: "INDICATIF ENREGISTRE",
      bannerSub: "Ta variable est lue et envoyee a la console.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '// Une constante pour la masse, un nombre, un booleen\n',
      placeholder: "// Utilise const pour une valeur fixe",
      narrator:
        "Certaines donnees ne changent jamais — la vitesse de la lumiere par exemple. Pour ca, on prefere **const**.",
      hint:
        'Cree const mission = "SELENE"; const annee = 2087; const piloteActif = true; et logue les trois.',
      briefing: {
        title: "const et types primitifs",
        content: `
### const — declarer une valeur fixe
\`const mission = "SELENE";\`

Une fois affecte, **const** ne peut **plus etre reaffecte**. C'est ton ami pour eviter les bugs.

### Les types primitifs courants
- **string** : du texte. \`"Mars"\`, \`'Lune'\`
- **number** : un nombre. \`42\`, \`3.14\`, \`-7\` (pas de guillemets !)
- **boolean** : vrai ou faux. \`true\`, \`false\`

### A retenir
- \`let\` pour ce qui change, \`const\` par defaut sinon.
- Pas de guillemets autour des nombres ou booleens.

**Mission :** declare au moins une string, un number et un boolean en **const**, puis logue-les.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser const au moins une fois" },
        { id: "o3b", label: "Afficher une string, un number et un boolean" },
      ],
      missionIcon: "🔒",
      missionTag: "PROTOCOLE 03",
      missionTtl: "DONNEES FIGEES",
      bannerIcon: "🗃",
      bannerTtl: "TYPES IDENTIFIES",
      bannerSub: "Texte, nombre et booleen sont sortis correctement.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        'const pilote = "Cadet";\nconst mission = "Seléné";\n// Compose un message en combinant les deux variables\n',
      placeholder: "// Utilise un template literal avec ${...}",
      narrator:
        "Place a la composition. Combine plusieurs variables dans un seul message avec un **template literal** (les accents graves \\`).",
      hint:
        'Ecris : console.log(`Pilote ${pilote} en mission ${mission}`);',
      briefing: {
        title: "Template literals",
        content: `
### Le probleme
Sans aide, concatener du texte est verbeux :
\`console.log("Pilote " + pilote + " en mission " + mission);\`

### La solution : template literals
On utilise les **accents graves** (\\\`) et **\${variable}** pour intercaler des valeurs.

\`console.log(\\\`Pilote \${pilote} en mission \${mission}\\\`);\`

### Avantages
- Plus lisible.
- Supporte les retours a la ligne directement dans la chaine.
- Peut contenir des expressions : \`\\\`Total : \${a + b}\\\`\`

**Mission :** affiche un message combinant **pilote** et **mission** via un template literal.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser un template literal (backticks)" },
        { id: "o4b", label: "Interpoler au moins deux variables" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 04",
      missionTtl: "MESSAGE COMPOSE",
      bannerIcon: "📨",
      bannerTtl: "TRANSMISSION RICHE",
      bannerSub: "Tu sais maintenant combiner texte et variables.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
