import type { ChapterData } from "@/data/courses/html/types";

export const chapitre4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : INVENTAIRE TACTIQUE",
  title: "TABLEAUX\n& BOUCLES",
  subtitle: "Manipule des listes et itere dessus",
  totalXp: 230,
  completionBadge: "📚",
  completionBadgeLabel: "GESTIONNAIRE D'INVENTAIRE",
  steps: [
    {
      startCode:
        '// Cree un tableau de 3 vaisseaux et affiche-le\n',
      placeholder: '// const flotte = [...]',
      narrator:
        "Cree ta première liste : un tableau de trois vaisseaux, puis affiche-le pour contrôle.",
      hint: 'const flotte = ["Alpha", "Bravo", "Charlie"];\\nconsole.log(flotte);',
      briefing: {
        title: "Les tableaux (Array)",
        content: `
*« Une flotte sans registre, c'est le chaos. Range tes unités dans un tableau — et souviens-toi : le premier vaisseau porte l'index zéro. »* — **Kira**

### Déclarer un tableau
\`const flotte = ["Alpha", "Bravo", "Charlie"];\`

- Les crochets **[ ]** delimitent le tableau.
- Les éléments sont separes par des virgules.
- Les éléments peuvent être de n'importe quel type (mixte autorise).

### Accéder a un élément
Avec un **index commencant a 0** :
\`flotte[0]  // "Alpha"\`
\`flotte[2]  // "Charlie"\`

### À retenir
- **flotte.length** donne le nombre d'éléments.
- Un tableau vide se note \`[]\`.

**Mission :** cree un tableau avec **au moins 3 éléments** et logue-le.
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer un tableau (au moins 3 éléments)" },
        { id: "o1b", label: "L'afficher avec console.log" },
      ],
      docRefs: ["js/tableaux"],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER INVENTAIRE",
      bannerIcon: "📋",
      bannerTtl: "LISTE DRESSEE",
      bannerSub: "La flotte est répertoriée.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        'const flotte = ["Alpha", "Bravo", "Charlie"];\n// Ajoute "Delta" au tableau et affiche la longueur finale\n',
      placeholder: "// flotte.push(...)",
      narrator:
        "Un nouveau vaisseau rejoint la flotte. Ajoute-le et confirme le nombre total.",
      hint: 'flotte.push("Delta");\\nconsole.log(flotte.length);',
      briefing: {
        title: "Méthodes courantes",
        content: `
### .push(...) — ajouter en fin
\`flotte.push("Delta");\`

Ajoute un élément à la fin et retourne la nouvelle longueur.

### .length — compter les éléments
\`flotte.length // 4\`

### Autres méthodes utiles
- **.pop()** : retire et retourne le dernier élément.
- **.shift()** : retire et retourne le premier.
- **.unshift(x)** : ajoute en début.
- **.includes(x)** : true si x est dans le tableau.

**Mission :** après push, **flotte.length** doit valoir **4**.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .push() pour ajouter un élément" },
        { id: "o2b", label: "Afficher 4 (la longueur finale)" },
      ],
      missionIcon: "➕",
      missionTag: "PROTOCOLE 02",
      missionTtl: "NOUVEL ARRIVANT",
      bannerIcon: "🚀",
      bannerTtl: "FLOTTE ETENDUE",
      bannerSub: "La flotte compte un membre de plus.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        'const flotte = ["Alpha", "Bravo", "Charlie", "Delta"];\n// Affiche chaque vaisseau, un par ligne, avec une boucle for\n',
      placeholder: "// for (let i = 0; i < flotte.length; i++) { ... }",
      narrator:
        "Liste chaque vaisseau à la console avec une boucle **for** classique.",
      hint:
        "for (let i = 0; i < flotte.length; i++) { console.log(flotte[i]); }",
      briefing: {
        title: "La boucle for",
        content: `
### Syntaxe
\`for (let i = 0; i < flotte.length; i++) {\`
\`  console.log(flotte[i]);\`
\`}\`

### Decompose en trois parties
- **Initialisation** : \`let i = 0\` (point de départ).
- **Condition** : \`i < flotte.length\` (continue tant que vrai).
- **Increment** : \`i++\` (raccourci pour \`i = i + 1\`).

### Résultat
La console affichera **chaque élément** sur sa propre ligne.

**Mission :** la console doit contenir **4 lignes** distinctes (une par vaisseau).
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser une boucle for" },
        { id: "o3b", label: "Afficher 4 lignes distinctes" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 03",
      missionTtl: "PARCOURS COMPLET",
      bannerIcon: "📜",
      bannerTtl: "ROLLCALL EFFECTUE",
      bannerSub: "Tous les vaisseaux ont repondu à l'appel.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "const distances = [120, 250, 80, 410];\n// Calcule la somme totale avec une boucle for et logue-la\n",
      placeholder: "// let total = 0; for (...) { total += ... }",
      narrator:
        "Mission finale du chapitre : additionne toutes les distances pour obtenir le total parcouru.",
      hint:
        "let total = 0; for (let i = 0; i < distances.length; i++) { total = total + distances[i]; } console.log(total);",
      briefing: {
        title: "Accumulateur dans une boucle",
        content: `
### Le pattern
1. Déclarer une variable accumulatrice : \`let total = 0;\`
2. La mettre à jour dans la boucle : \`total = total + distances[i];\`
3. Loguer la valeur finale après la boucle.

### Raccourci
\`total += distances[i];\` est équivalent a \`total = total + distances[i];\`.

### Résultat attendu
\`120 + 250 + 80 + 410 = 860\`

### Alternative moderne (a explorer plus tard)
\`distances.reduce((a, b) => a + b, 0);\`

**Mission :** la console doit afficher **860**.
        `,
      },
      objectives: [
        { id: "o4a", label: "Cumuler les valeurs avec une boucle for" },
        { id: "o4b", label: "Afficher 860 (la somme totale)" },
      ],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TOTAL DE MISSION",
      bannerIcon: "📊",
      bannerTtl: "RAPPORT TOTALISE",
      bannerSub: "Toutes les distances ont été additionnees.",
      bannerXp: "⚡ +60 XP",
    },
  ],
};