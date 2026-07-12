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
        "Cree ta premiere liste : un tableau de trois vaisseaux, puis affiche-le pour controle.",
      hint: 'const flotte = ["Alpha", "Bravo", "Charlie"];\\nconsole.log(flotte);',
      briefing: {
        title: "Les tableaux (Array)",
        content: `
*« Une flotte sans registre, c'est le chaos. Range tes unités dans un tableau — et souviens-toi : le premier vaisseau porte l'index zéro. »* — **Kira**

### Declarer un tableau
\`const flotte = ["Alpha", "Bravo", "Charlie"];\`

- Les crochets **[ ]** delimitent le tableau.
- Les elements sont separes par des virgules.
- Les elements peuvent etre de n'importe quel type (mixte autorise).

### Acceder a un element
Avec un **index commencant a 0** :
\`flotte[0]  // "Alpha"\`
\`flotte[2]  // "Charlie"\`

### A retenir
- **flotte.length** donne le nombre d'elements.
- Un tableau vide se note \`[]\`.

**Mission :** cree un tableau avec **au moins 3 elements** et logue-le.
        `,
      },
      objectives: [
        { id: "o1a", label: "Declarer un tableau (au moins 3 elements)" },
        { id: "o1b", label: "L'afficher avec console.log" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER INVENTAIRE",
      bannerIcon: "📋",
      bannerTtl: "LISTE DRESSEE",
      bannerSub: "La flotte est repertoriee.",
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
        title: "Methodes courantes",
        content: `
### .push(...) — ajouter en fin
\`flotte.push("Delta");\`

Ajoute un element a la fin et retourne la nouvelle longueur.

### .length — compter les elements
\`flotte.length // 4\`

### Autres methodes utiles
- **.pop()** : retire et retourne le dernier element.
- **.shift()** : retire et retourne le premier.
- **.unshift(x)** : ajoute en debut.
- **.includes(x)** : true si x est dans le tableau.

**Mission :** apres push, **flotte.length** doit valoir **4**.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .push() pour ajouter un element" },
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
        "Liste chaque vaisseau a la console avec une boucle **for** classique.",
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
- **Initialisation** : \`let i = 0\` (point de depart).
- **Condition** : \`i < flotte.length\` (continue tant que vrai).
- **Increment** : \`i++\` (raccourci pour \`i = i + 1\`).

### Resultat
La console affichera **chaque element** sur sa propre ligne.

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
      bannerSub: "Tous les vaisseaux ont repondu a l'appel.",
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
1. Declarer une variable accumulatrice : \`let total = 0;\`
2. La mettre a jour dans la boucle : \`total = total + distances[i];\`
3. Loguer la valeur finale apres la boucle.

### Raccourci
\`total += distances[i];\` est equivalent a \`total = total + distances[i];\`.

### Resultat attendu
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
      bannerSub: "Toutes les distances ont ete additionnees.",
      bannerXp: "⚡ +60 XP",
    },
  ],
};