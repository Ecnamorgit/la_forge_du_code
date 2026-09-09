import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : PROTOCOLE DE COMMUNICATION",
  title: "PREMIER\nSIGNAL",
  subtitle: "Affiche tes premiers messages et utilise des variables",
  totalXp: 200,
  completionBadge: "📟",
  completionBadgeLabel: "OPÉRATEUR RADIO",
  steps: [
    {
      startCode: 'consol.log("Bonjour, station Nebula");\n',
      spectreTrap:
        "J'ai brouillé ton émetteur, Cadet. Ce `consol.log` ne répond plus — retrouve le bon canal, si tu en es capable.",
      placeholder: "// Ecris ton code ici",
      narrator:
        "Cadet, ton premier ordre est d'envoyer un signal radio. En JavaScript, on parle à la console via console.log.",
      hint: 'Écris : console.log("Bonjour, station Nebula");',
      briefing: {
        title: "Le premier signal : console.log",
        content: `
*« Avant de piloter quoi que ce soit, apprends à écouter tes instruments. \`console.log\`, c'est ta radio : sans elle, tu voles à l'aveugle. »* — **Kira**

### console.log
**console.log(...)** envoie un message vers la **console** du navigateur. C'est l'outil n°1 pour observer ce que fait ton code.

### Syntaxe
\`console.log("Bonjour, station Nebula");\`

### À retenir
- Les chaînes de texte se mettent entre **guillemets** ("..." ou '...').
- Chaque instruction se termine par **;** (recommandé, même si JS pardonne souvent l'oubli).
- Le panneau "Sortie console" en bas affiche tout ce que tu logues.

**Mission :** affiche exactement \`Bonjour, station Nebula\`.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser console.log" },
        { id: "o1b", label: 'Afficher "Bonjour, station Nebula"' },
      ],
      docRefs: ["js/console"],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER SIGNAL",
      bannerIcon: "📟",
      bannerTtl: "RADIO ACTIVE",
      bannerSub: "La console a reçu ton message — la liaison est ouverte.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '// Stocke ton indicatif dans une variable puis affiche-le\n',
      placeholder: "// Utilise let pour créer une variable",
      narrator:
        "Maintenant, donne-toi un indicatif d'appel. En JS, **let** déclare une variable que tu pourras modifier plus tard.",
      hint: 'Écris : let callsign = "NEBULA-7"; puis console.log(callsign);',
      briefing: {
        title: "Variables avec let",
        content: `
### let — déclarer une variable modifiable
\`let callsign = "NEBULA-7";\`

- **let** dit : "je crée une boîte nommée callsign".
- Le **=** range la valeur dans la boîte.
- Tu peux changer la valeur plus tard : \`callsign = "ECLIPSE-3";\`

### Afficher la variable
\`console.log(callsign);\`

Note : pas de guillemets autour de **callsign** — sinon tu afficherais littéralement le mot "callsign".

**Mission :** crée une variable et affiche-la (peu importe son nom et sa valeur — du moment qu'elle s'affiche).
        `,
      },
      objectives: [
        { id: "o2a", label: "Déclarer une variable avec let" },
        { id: "o2b", label: "Afficher sa valeur avec console.log" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 02",
      missionTtl: "BOÎTE À VALEUR",
      bannerIcon: "🪪",
      bannerTtl: "INDICATIF ENREGISTRÉ",
      bannerSub: "Ta variable est lue et envoyée à la console.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '// Une constante pour la masse, un nombre, un booléen\n',
      placeholder: "// Utilise const pour une valeur fixe",
      narrator:
        "Certaines données ne changent jamais — la vitesse de la lumière par exemple. Pour ça, on préfère **const**.",
      hint:
        'Crée const mission = "SELENE"; const annee = 2087; const piloteActif = true; et logue les trois.',
      briefing: {
        title: "const et types primitifs",
        content: `
### const — déclarer une valeur fixe
\`const mission = "SELENE";\`

Une fois affectée, **const** ne peut **plus être réaffectée**. C'est ton ami pour éviter les bugs.

### Les types primitifs courants
- **string** : du texte. \`"Mars"\`, \`'Lune'\`
- **number** : un nombre. \`42\`, \`3.14\`, \`-7\` (pas de guillemets !)
- **boolean** : vrai ou faux. \`true\`, \`false\`

### À retenir
- \`let\` pour ce qui change, \`const\` par défaut sinon.
- Pas de guillemets autour des nombres ou booléens.

**Mission :** déclare au moins une string, un number et un boolean en **const**, puis logue-les.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser const au moins une fois" },
        { id: "o3b", label: "Afficher une string, un number et un boolean" },
      ],
      missionIcon: "🔒",
      missionTag: "PROTOCOLE 03",
      missionTtl: "DONNÉES FIGÉES",
      bannerIcon: "🗃",
      bannerTtl: "TYPES IDENTIFIÉS",
      bannerSub: "Texte, nombre et booléen sont sortis correctement.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        'const pilote = "Cadet";\nconst mission = "Seléné";\n// Compose un message en combinant les deux variables\n',
      placeholder: "// Utilise un template literal avec ${...}",
      narrator:
        "Place à la composition. Combine plusieurs variables dans un seul message avec un **template literal** (les accents graves \\`).",
      hint:
        'Écris : console.log(`Pilote ${pilote} en mission ${mission}`);',
      briefing: {
        title: "Template literals",
        content: `
### Le problème
Sans aide, concaténer du texte est verbeux :
\`console.log("Pilote " + pilote + " en mission " + mission);\`

### La solution : template literals
On utilise les **accents graves** (\\\`) et **\${variable}** pour intercaler des valeurs.

\`console.log(\\\`Pilote \${pilote} en mission \${mission}\\\`);\`

### Avantages
- Plus lisible.
- Supporte les retours à la ligne directement dans la chaîne.
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
      missionTtl: "MESSAGE COMPOSÉ",
      bannerIcon: "📨",
      bannerTtl: "TRANSMISSION RICHE",
      bannerSub: "Tu sais maintenant combiner texte et variables.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};