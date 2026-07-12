import type { ChapterData } from "@/data/courses/html/types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : REGISTRE DES VAISSEAUX",
  title: "OBJETS\n& METHODES",
  subtitle: "Structure tes données et utilise les méthodes built-in",
  totalXp: 250,
  completionBadge: "🛠",
  completionBadgeLabel: "ARCHITECTE LOGICIEL",
  steps: [
    {
      startCode:
        '// Cree un objet vaisseau avec type, crewSize, status. Affiche-le.\n',
      placeholder: "// const vaisseau = { type: ..., crewSize: ..., status: ... }",
      narrator:
        "Le tableau, c'est bien pour une liste. Mais pour décrire **une** entité avec plusieurs caractéristiques, on utilise un **objet**.",
      hint:
        'const vaisseau = { type: "Fregate", crewSize: 5, status: "En orbite" };\\nconsole.log(vaisseau);',
      briefing: {
        title: "Les objets (object literal)",
        content: `
*« Un tableau, c'est une file de coordonnées. Un objet, c'est une fiche de vaisseau : chaque champ nommé, rien laissé au hasard. Structure tes données, Cadet. »* — **Kira**

### Syntaxe
\`const vaisseau = {\`
\`  type: "Fregate",\`
\`  crewSize: 5,\`
\`  status: "En orbite",\`
\`};\`

### Vocabulaire
- Une **propriété** est une paire **clé: valeur**.
- Les **clés** sont des chaînes (sans guillemets si elles sont simples).
- Les **valeurs** peuvent être de n'importe quel type.

### Différence avec un tableau
- **Tableau** = liste ordonnée, accès par index numérique.
- **Objet** = ensemble de clés nommées, accès par nom.

**Mission :** déclare un objet avec **au moins 3 propriétés** et logue-le.
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer un objet avec >= 3 propriétés" },
        { id: "o1b", label: "L'afficher avec console.log" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 01",
      missionTtl: "FICHE VAISSAUX",
      bannerIcon: "📇",
      bannerTtl: "DONNÉES STRUCTURÉES",
      bannerSub: "Le vaisseau est décrit par un objet.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        'const vaisseau = { type: "Fregate", crewSize: 5, status: "En orbite" };\n// Affiche uniquement le type, puis modifie crewSize a 6 et affiche le nouvel objet\n',
      placeholder: "// vaisseau.type / vaisseau.crewSize = ...",
      narrator:
        "Lis et modifie une propriété précise. La notation **point** (.) est le passage obligatoire.",
      hint:
        "console.log(vaisseau.type);\\nvaisseau.crewSize = 6;\\nconsole.log(vaisseau);",
      briefing: {
        title: "Accéder et modifier",
        content: `
*« Vise juste. Une propriété se lit et se corrige au point précis — inutile de reconstruire toute la fiche pour un seul champ. »* — **Kira**

### Lire une propriété : la notation point
\`vaisseau.type // "Fregate"\`

### Modifier une propriété
\`vaisseau.crewSize = 6;\`

Même si l'objet est en **const**, ses propriétés restent **modifiables** : const empêche de réaffecter l'**objet entier**, pas son contenu.

### Notation crochets (variant)
\`vaisseau["type"]\` — pratique quand la clé est dans une variable :
\`const cle = "type"; vaisseau[cle];\`

**Mission :** ta console doit contenir d'abord \`Fregate\`, puis l'objet entier avec crewSize = 6.
        `,
      },
      objectives: [
        { id: "o2a", label: "Lire vaisseau.type" },
        { id: "o2b", label: "Modifier vaisseau.crewSize à 6" },
      ],
      missionIcon: "✏",
      missionTag: "PROTOCOLE 02",
      missionTtl: "LECTURE / ÉCRITURE",
      bannerIcon: "🪶",
      bannerTtl: "FICHE MISE À JOUR",
      bannerSub: "Le nombre de membres du crew a été corrigé.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        'const callsign = "nebula-7";\n// Affiche le callsign en majuscules et sa longueur\n',
      placeholder: "// .toUpperCase() / .length",
      narrator:
        "Les chaînes ont leurs propres méthodes intégrées. Mets l'indicatif en majuscules et logue sa taille.",
      hint:
        "console.log(callsign.toUpperCase());\\nconsole.log(callsign.length);",
      briefing: {
        title: "Méthodes de string",
        content: `
*« Le système embarque déjà ces outils. Sers-t'en, ne réinvente pas ce qui existe — on n'a pas le temps pour ça. »* — **Kira**

### .toUpperCase() / .toLowerCase()
\`"nebula".toUpperCase() // "NEBULA"\`
\`"NEBULA".toLowerCase() // "nebula"\`

### .length — pas une méthode, une propriété
\`"nebula".length // 6\`

### Autres méthodes utiles
- **.includes(x)** : true si x est dans la chaîne.
- **.trim()** : retire les espaces en début/fin.
- **.split(s)** : découpe en tableau.
- **.replace(a, b)** : remplace une sous-chaine.

### Important
Ces méthodes **ne modifient pas** la chaîne d'origine, elles **retournent** une nouvelle valeur. Les strings sont immuables.

**Mission :** logue \`NEBULA-7\` puis \`8\` (la longueur).
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser .toUpperCase()" },
        { id: "o3b", label: "Afficher la longueur (.length)" },
      ],
      missionIcon: "🔠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MÉTHODES DE STRING",
      bannerIcon: "📏",
      bannerTtl: "CHAÎNE MAÎTRISÉE",
      bannerSub: "Tu sais transformer et mesurer du texte.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        'const vaisseau = { type: "Fregate", xp: 1234 };\n// Ajoute une méthode statusReport() qui retourne "Le vaisseau est en " + status\n// puis logue vaisseau.statusReport()\n',
      placeholder: "// vaisseau.statusReport = function() { ... }",
      narrator:
        "Mission finale : une fonction stockée **dans** l'objet — une **méthode**. La fonction peut accéder à l'objet via **this**.",
      hint:
        'vaisseau.statusReport = function() { return "Le vaisseau est en " + this.status; };\\nconsole.log(vaisseau.statusReport());',
      briefing: {
        title: "Méthodes et this",
        content: `
*« Une méthode, c'est une fonction embarquée dans l'objet lui-même. \`this\` désigne l'objet aux commandes. Retiens-le. »* — **Kira**

### Ajouter une méthode
\`vaisseau.statusReport = function() {\`
\`  return "Le vaisseau est en " + this.status;\`
\`};\`

### Le mot-clé this
À l'intérieur d'une méthode, **this** désigne **l'objet** sur lequel la méthode est appelée.
\`vaisseau.statusReport() // this = vaisseau -> retourne "Le vaisseau est en En orbite"\`

### Forme moderne
On peut déclarer la méthode directement dans l'objet :
\`const vaisseau = {\`
\`  type: "Fregate",\`
\`  statusReport() { return "Le vaisseau est en " + this.status; },\`
\`};\`

### Palier franchi
Tu maitrises maintenant le socle de JS : variables, conditions, fonctions, tableaux, objets. La suite (asynchrone, DOM, modules...) t'attend dans les prochains chapitres du cursus.

**Mission finale :** la console doit afficher \`Le vaisseau est en En orbite\`.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter une méthode sur l'objet" },
        { id: "o4b", label: 'Afficher "Le vaisseau est en En orbite"' },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "OBJET INTELLIGENT",
      bannerIcon: "🏁",
      bannerTtl: "STRUCTURE STABILISÉE",
      bannerSub:
        "Objets et méthodes maîtrisés. La structure de tes données tient bon.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};