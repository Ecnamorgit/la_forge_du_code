import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : CALCUL OPTIMAL",
  title: "ALGORITHMIE &\nCOMPLEXITE",
  subtitle: "Maitrise les fondamentaux qui font les entretiens techniques",
  totalXp: 280,
  completionBadge: "🧮",
  completionBadgeLabel: "STRATEGE ALGORITHMIQUE",
  steps: [
    {
      startCode:
        "// Estime la complexite Big-O de ces fonctions en commentaire :\n//   fonction A : un seul acces tableau[0] -> ???\n//   fonction B : une boucle sur tableau -> ???\n//   fonction C : deux boucles imbriquees sur le meme tableau -> ???\nfunction A(tableau) { return tableau[0]; }\nfunction B(tableau) { for (const x of tableau) console.log(x); }\nfunction C(tableau) {\n  for (const x of tableau)\n    for (const y of tableau)\n      console.log(x, y);\n}\n",
      placeholder: "// O(1), O(n), O(n^2)",
      narrator:
        "Avant d'ecrire un algorithme, il faut savoir le mesurer. La notation Big-O exprime COMMENT le temps d'execution evolue selon la taille de l'entree. C'est la base des entretiens techniques.",
      hint: "// A : O(1) — temps constant, ne depend pas de la taille\n// B : O(n) — lineaire, une seule boucle\n// C : O(n^2) — quadratique, deux boucles imbriquees\n\n// Ces commentaires sont les bonnes reponses.",
      briefing: {
        title: "Big-O : la mesure de complexite",
        content: `
### Pourquoi mesurer ?
Une fonction qui marche sur 10 elements peut planter sur 10 millions. La complexite te dit comment ton code va se comporter quand l'entree grandit.

### Les classes courantes (du plus rapide au pire)
- **O(1)** : constant — acces tableau, hashmap lookup
- **O(log n)** : logarithmique — recherche binaire
- **O(n)** : lineaire — une seule boucle
- **O(n log n)** : log-lineaire — bons algos de tri (merge, heap, quicksort moyen)
- **O(n^2)** : quadratique — deux boucles imbriquees
- **O(n^3)** : cubique — trois boucles imbriquees
- **O(2^n)** : exponentielle — recursion naive de fibonacci, force brute
- **O(n!)** : factorielle — permutations completes

### Repere visuel pour n = 1000
- O(1) : 1 operation
- O(log n) : 10 operations
- O(n) : 1 000 operations
- O(n log n) : 10 000 operations
- O(n^2) : 1 000 000 operations
- O(2^n) : pas calculable

### Comment determiner la complexite
1. Pas de boucle dependante de n -> O(1)
2. Une boucle sur n elements -> O(n)
3. Deux boucles imbriquees sur n -> O(n^2)
4. Boucle qui divise par 2 a chaque tour -> O(log n)
5. Recursion qui appelle deux fois -> O(2^n)

### Pieges
- \`array.includes(x)\` parcourt -> O(n)
- \`set.has(x)\` est O(1)
- Une boucle dans une recursion -> multiplier les complexites

**A retenir :** Big-O = ordre de grandeur quand n est grand. Un O(n^2) sur 1M elements = 1000 milliards d'ops = ton serveur meurt.
        `,
      },
      objectives: [
        { id: "o1a", label: "Identifier O(1), O(n), O(n^2)" },
        { id: "o1b", label: "Comprendre l'impact sur les grandes entrees" },
      ],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 01",
      missionTtl: "BIG-O",
      bannerIcon: "🧮",
      bannerTtl: "COMPLEXITE COMPRISE",
      bannerSub: "Tu sais predire le comportement d'un algorithme.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Implemente la recherche binaire dans un tableau TRIE.\n// Retourne l'index de la cible, ou -1 si non trouvee.\n// Complexite attendue : O(log n).\nfunction rechercheBinaire(tableau, cible) {\n  // ton code ici\n}\n",
      placeholder: "// while debut <= fin : milieu = (debut + fin) / 2 ; ...",
      narrator:
        "La recherche lineaire teste chaque element : O(n). La recherche binaire coupe l'espace en deux a chaque etape : O(log n). Sur 1 million d'elements, c'est 20 etapes au lieu de 1 million. Vital.",
      hint: "function rechercheBinaire(tableau, cible) {\n  let debut = 0;\n  let fin = tableau.length - 1;\n  while (debut <= fin) {\n    const milieu = Math.floor((debut + fin) / 2);\n    if (tableau[milieu] === cible) return milieu;\n    if (tableau[milieu] < cible) debut = milieu + 1;\n    else fin = milieu - 1;\n  }\n  return -1;\n}",
      briefing: {
        title: "Recherche binaire",
        content: `
### Le principe
Le tableau doit etre **TRIE** (condition imperative).
1. Regarde l'element du milieu
2. Si c'est la cible -> trouve
3. Si trop petit -> chercher dans la moitie droite
4. Si trop grand -> chercher dans la moitie gauche
5. Repeter jusqu'a trouver ou tableau vide

A chaque iteration, on divise l'espace par 2. D'ou O(log n).

### Pourquoi c'est si efficace
1 million d'elements en recherche lineaire : 500k iterations en moyenne.
1 million en recherche binaire : 20 iterations max.

### Pieges classiques d'implementation
- **Overflow** : \`(debut + fin) / 2\` peut deborder pour de TRES grands entiers. Solution : \`debut + (fin - debut) / 2\`.
- **Boundary bugs** : \`<\` vs \`<=\`, off-by-one. Toujours tester avec tableau de 1, 2, 3 elements.
- **Tableau non trie** : la binaire renverra n'importe quoi. Verifier le pre-requis.

### Variantes utiles
- Trouver la PREMIERE occurrence (au lieu d'une quelconque)
- Trouver le plus petit element >= cible
- Recherche dans un tableau cyclique

C'est un classique d'entretien. Chaque variante est un sujet a part.

### Quand l'utiliser
- Tableau statique trie
- Operation de recherche frequente
- Sinon, prefere une Map / Set pour des O(1) lookups

**A retenir :** Binaire = diviser pour regner. O(log n) = exponentiellement plus rapide. Pre-requis : tableau trie.
        `,
      },
      objectives: [
        { id: "o2a", label: "Implementer la boucle while avec debut/fin" },
        { id: "o2b", label: "Diviser l'espace de recherche a chaque iteration" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "RECHERCHE BINAIRE",
      bannerIcon: "🎯",
      bannerTtl: "LOG N ATTEINT",
      bannerSub: "Tu maitrises la recherche logarithmique.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Implemente le tri a bulles (bubble sort) sur un tableau de nombres.\n// Note : c'est un tri O(n^2), pedagogique mais a EVITER en prod.\nfunction trierBulles(tableau) {\n  // ton code ici\n  return tableau;\n}\n",
      placeholder: "// double boucle avec swap si l'element suivant est plus petit",
      narrator:
        "Le tri a bulles est l'algo de tri le plus simple a coder. Son nom vient des elements qui 'remontent' comme des bulles. Inefficient (O(n^2)) mais parfait pour comprendre le principe d'un tri.",
      hint: "function trierBulles(tableau) {\n  const n = tableau.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (tableau[j] > tableau[j + 1]) {\n        [tableau[j], tableau[j + 1]] = [tableau[j + 1], tableau[j]];\n      }\n    }\n  }\n  return tableau;\n}",
      briefing: {
        title: "Algorithmes de tri",
        content: `
### Bubble sort : le plus simple
A chaque passe, compare les paires adjacentes et echange si elles sont dans le mauvais ordre. Le plus grand element "remonte" en haut a chaque passe.

Complexite : O(n^2) — a eviter en prod.

### Les vrais algos de tri
- **Insertion sort** : O(n^2), mais tres rapide sur petits tableaux ou presque tries
- **Merge sort** : O(n log n), stable, mais utilise de la memoire en O(n)
- **Quicksort** : O(n log n) en moyenne, O(n^2) au pire, en place
- **Heapsort** : O(n log n), en place
- **Timsort** : hybride merge+insertion, utilise par JavaScript et Python

### Le tri en JS / Python
**N'IMPLEMENTE PAS un tri en prod.** Utilise le tri natif :
\`tableau.sort((a, b) => a - b);\` // JS, croissant
\`sorted(liste)\` // Python

C'est du Timsort, optimal pour la plupart des cas reels.

### La fonction de comparaison JS
\`array.sort()\` sans fonction trie en STRINGS — piege classique.
\`[10, 2, 30].sort()\` -> \`[10, 2, 30]\` (ordre alphabetique : "10" < "2")
\`[10, 2, 30].sort((a, b) => a - b)\` -> \`[2, 10, 30]\` (ordre numerique)

### Stable vs unstable
Un tri "stable" preserve l'ordre relatif des elements equivalents. Crucial pour trier sur plusieurs criteres successivement.

### Quand connaitre les details
- Entretien technique : OUI, on te demande de l'implementer
- Vraie vie : tu utilises le tri natif

**A retenir :** Bubble pour comprendre, sort() pour produire. O(n log n) est la limite theorique des tris par comparaison.
        `,
      },
      objectives: [
        { id: "o3a", label: "Implementer la double boucle du bubble sort" },
        { id: "o3b", label: "Echanger deux elements avec destructuring" },
      ],
      missionIcon: "📊",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TRI",
      bannerIcon: "📊",
      bannerTtl: "DONNEES ORDONNEES",
      bannerSub: "Tu connais le principe des algorithmes de tri.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Calcule fibonacci(n) de maniere RECURSIVE puis ITERATIVE.\n// fibo(0) = 0, fibo(1) = 1, fibo(n) = fibo(n-1) + fibo(n-2).\nfunction fiboRecursif(n) {\n  // ton code ici\n}\n\nfunction fiboIteratif(n) {\n  // ton code ici\n}\n",
      placeholder: "// recursif : if n < 2 return n; return f(n-1) + f(n-2); / iteratif : boucle",
      narrator:
        "La recursion permet d'exprimer des algorithmes elegamment, mais peut etre piegeuse. Fibonacci illustre parfaitement le passage du recursif naif (O(2^n)) a l'iteratif efficace (O(n)).",
      hint: "function fiboRecursif(n) {\n  if (n < 2) return n;\n  return fiboRecursif(n - 1) + fiboRecursif(n - 2);\n}\n\nfunction fiboIteratif(n) {\n  if (n < 2) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}",
      briefing: {
        title: "Recursion et memoisation",
        content: `
### Les 2 elements d'une recursion
1. **Cas de base** : la condition d'arret (sinon boucle infinie)
2. **Appel recursif** : la fonction s'appelle elle-meme sur un sous-probleme plus petit

\`function fibo(n) {\`
\`  if (n < 2) return n;          // cas de base\`
\`  return fibo(n-1) + fibo(n-2); // appel recursif\`
\`}\`

### Le piege de Fibonacci recursif
\`fibo(40)\` recursif fait des MILLIARDS d'appels redondants. Pourquoi ? Parce que \`fibo(38)\` est calcule plusieurs fois.

Complexite : O(2^n). Pour n=50, c'est 1 quadrillion d'operations.

### La version iterative
Une boucle qui maintient les deux dernieres valeurs : O(n), simple et rapide.

### La memoisation
Si tu DOIS rester recursif, **memoise** : stocke les resultats deja calcules.

\`const cache = {};\`
\`function fibo(n) {\`
\`  if (n in cache) return cache[n];\`
\`  if (n < 2) return n;\`
\`  cache[n] = fibo(n-1) + fibo(n-2);\`
\`  return cache[n];\`
\`}\`

O(2^n) devient O(n). C'est de la **programmation dynamique** (Dynamic Programming).

### Stack overflow
Chaque appel recursif consomme une place sur la pile. Pour n trop grand :
\`RangeError: Maximum call stack size exceeded\`

Solutions :
1. Passer a un iteratif
2. **Tail call optimization** (mais JS ne le supporte plus officiellement)

### Quand utiliser la recursion
- Structures recursives (arbres, JSON imbrique, fichiers)
- Algos divide-and-conquer (merge sort, quicksort)
- Backtracking (sudoku, mazes)

### Recap des concepts importants pour les entretiens
- Big-O
- Tableaux & strings (two pointers, sliding window)
- Hash maps & sets
- Recursion & DP
- Trees & graphes (BFS, DFS)
- Sorting & searching
- Stacks & queues

Ressources : LeetCode, NeetCode, AlgoExpert.

**A retenir :** Recursif = elegant mais souvent piege (exponentiel). Iteratif ou memo pour la perf. Toujours definir le cas de base.
        `,
      },
      objectives: [
        { id: "o4a", label: "Implementer fibo recursif avec cas de base" },
        { id: "o4b", label: "Implementer fibo iteratif en O(n)" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RECURSION",
      bannerIcon: "🧮",
      bannerTtl: "FONDAMENTAUX ACQUIS",
      bannerSub: "Tu es pret pour les entretiens techniques d'algorithmie.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
