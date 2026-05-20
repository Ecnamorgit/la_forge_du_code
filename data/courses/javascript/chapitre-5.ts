import type { ChapterData } from "@/data/courses/html/types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : ARCHIVES DE MISSION",
  title: "OBJETS\n& METHODES",
  subtitle: "Structure tes donnees et utilise les methodes built-in",
  totalXp: 250,
  completionBadge: "🛠",
  completionBadgeLabel: "ARCHITECTE LOGICIEL",
  steps: [
    {
      startCode:
        '// Cree un objet pilote avec name, level, active. Affiche-le.\n',
      placeholder: "// const pilote = { name: ..., level: ..., active: ... }",
      narrator:
        "Le tableau, c'est bien pour une liste. Mais pour decrire **une** entite avec plusieurs caracteristiques, on utilise un **objet**.",
      hint:
        'const pilote = { name: "Cadet", level: 7, active: true };\\nconsole.log(pilote);',
      briefing: {
        title: "Les objets (object literal)",
        content: `
### Syntaxe
\`const pilote = {\`
\`  name: "Cadet",\`
\`  level: 7,\`
\`  active: true,\`
\`};\`

### Vocabulaire
- Une **propriete** est une paire **cle: valeur**.
- Les **cles** sont des chaines (sans guillemets si elles sont simples).
- Les **valeurs** peuvent etre de n'importe quel type.

### Difference avec un tableau
- **Tableau** = liste ordonnee, acces par index numerique.
- **Objet** = ensemble de cles nommees, acces par nom.

**Mission :** declare un objet avec **au moins 3 proprietes** et logue-le.
        `,
      },
      objectives: [
        { id: "o1a", label: "Declarer un objet avec >= 3 proprietes" },
        { id: "o1b", label: "L'afficher avec console.log" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 01",
      missionTtl: "FICHE PILOTE",
      bannerIcon: "📇",
      bannerTtl: "DONNEES STRUCTUREES",
      bannerSub: "Le pilote est decrit par un objet.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        'const pilote = { name: "Cadet", level: 7, active: true };\n// Affiche uniquement le name, puis modifie level a 8 et affiche le nouvel objet\n',
      placeholder: "// pilote.name / pilote.level = ...",
      narrator:
        "Lis et modifie une propriete precise. La notation **point** (.) est le passage obligatoire.",
      hint:
        "console.log(pilote.name);\\npilote.level = 8;\\nconsole.log(pilote);",
      briefing: {
        title: "Acceder et modifier",
        content: `
### Lire une propriete : la notation point
\`pilote.name // "Cadet"\`

### Modifier une propriete
\`pilote.level = 8;\`

Meme si l'objet est en **const**, ses proprietes restent **modifiables** : const empeche de reaffecter l'**objet entier**, pas son contenu.

### Notation crochets (variant)
\`pilote["name"]\` — pratique quand la cle est dans une variable :
\`const cle = "name"; pilote[cle];\`

**Mission :** ta console doit contenir d'abord \`Cadet\`, puis l'objet entier avec level = 8.
        `,
      },
      objectives: [
        { id: "o2a", label: "Lire pilote.name" },
        { id: "o2b", label: "Modifier pilote.level a 8" },
      ],
      missionIcon: "✏",
      missionTag: "PROTOCOLE 02",
      missionTtl: "LECTURE / ECRITURE",
      bannerIcon: "🪶",
      bannerTtl: "FICHE MISE A JOUR",
      bannerSub: "Le niveau du pilote a ete corrige.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        'const callsign = "nebula-7";\n// Affiche le callsign en majuscules et sa longueur\n',
      placeholder: "// .toUpperCase() / .length",
      narrator:
        "Les chaines ont leurs propres methodes intégrées. Mets l'indicatif en majuscules et logue sa taille.",
      hint:
        "console.log(callsign.toUpperCase());\\nconsole.log(callsign.length);",
      briefing: {
        title: "Methodes de string",
        content: `
### .toUpperCase() / .toLowerCase()
\`"nebula".toUpperCase() // "NEBULA"\`
\`"NEBULA".toLowerCase() // "nebula"\`

### .length — pas une methode, une propriete
\`"nebula".length // 6\`

### Autres methodes utiles
- **.includes(x)** : true si x est dans la chaine.
- **.trim()** : retire les espaces en debut/fin.
- **.split(s)** : decoupe en tableau.
- **.replace(a, b)** : remplace une sous-chaine.

### Important
Ces methodes **ne modifient pas** la chaine d'origine, elles **retournent** une nouvelle valeur. Les strings sont immuables.

**Mission :** logue \`NEBULA-7\` puis \`8\` (la longueur).
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser .toUpperCase()" },
        { id: "o3b", label: "Afficher la longueur (.length)" },
      ],
      missionIcon: "🔠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "METHODES DE STRING",
      bannerIcon: "📏",
      bannerTtl: "CHAINE MAITRISEE",
      bannerSub: "Tu sais transformer et mesurer du texte.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        'const pilote = { name: "Cadet", xp: 1234 };\n// Ajoute une methode greet() qui retourne "Salut " + name\n// puis logue pilote.greet()\n',
      placeholder: "// pilote.greet = function() { ... }",
      narrator:
        "Mission finale : une fonction stockee **dans** l'objet — une **methode**. La fonction peut acceder a l'objet via **this**.",
      hint:
        'pilote.greet = function() { return "Salut " + this.name; };\\nconsole.log(pilote.greet());',
      briefing: {
        title: "Methodes et this",
        content: `
### Ajouter une methode
\`pilote.greet = function() {\`
\`  return "Salut " + this.name;\`
\`};\`

### Le mot-cle this
A l'interieur d'une methode, **this** designe **l'objet** sur lequel la methode est appelee.
\`pilote.greet() // this = pilote -> retourne "Salut Cadet"\`

### Forme moderne
On peut declarer la methode directement dans l'objet :
\`const pilote = {\`
\`  name: "Cadet",\`
\`  greet() { return "Salut " + this.name; },\`
\`};\`

### Felicitations
Tu maitrises maintenant les fondations de JS : variables, conditions, fonctions, tableaux, objets. La suite (asynchrone, DOM, modules, frameworks) viendra dans les cursus suivants.

**Mission finale :** la console doit afficher \`Salut Cadet\`.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter une methode sur l'objet" },
        { id: "o4b", label: 'Afficher "Salut Cadet"' },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "OBJET INTELLIGENT",
      bannerIcon: "🏁",
      bannerTtl: "CURSUS COMPLET",
      bannerSub:
        "Les trois fondations HTML / CSS / JS sont posees. Bienvenue dans la flotte.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};
