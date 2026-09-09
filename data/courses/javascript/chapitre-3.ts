import type { ChapterData } from "@/data/courses/html/types";

export const chapitre3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : MODULES DE COMMANDE",
  title: "FONCTIONS\nMODULAIRES",
  subtitle: "Encapsule la logique dans des fonctions reutilisables",
  totalXp: 220,
  completionBadge: "⚙",
  completionBadgeLabel: "INGÉNIEUR FONCTIONNEL",
  steps: [
    {
      startCode:
        '// Declare une fonction greet(name) qui retourne "Bonjour, <name>"\n// puis appelle-la et affiche le resultat\n',
      placeholder: "// function greet(name) { return ... }",
      narrator:
        "Une fonction est un module réutilisable. Cree **greet** qui prend un nom et retourne un message d'accueil.",
      hint:
        'function greet(name) {\\n  return `Bonjour, ${name}`;\\n}\\nconsole.log(greet("Cadet"));',
      briefing: {
        title: "Déclarer et appeler une fonction",
        content: `
*« Un bon ingénieur n'écrit jamais deux fois la même manœuvre. Encapsule-la dans une fonction, nomme-la clairement, et réutilise. »* — **Kira**

### Syntaxe
\`function greet(name) {\`
\`  return \\\`Bonjour, \${name}\\\`;\`
\`}\`

### Vocabulaire
- **name** : un **parametre** — comme une variable que la fonction reçoit.
- **return** : la **valeur retournee** par la fonction.
- L'appel se fait avec des parenthèses : \`greet("Cadet")\`.

### Combinaison classique
\`console.log(greet("Cadet")); // -> "Bonjour, Cadet"\`

### À retenir
- Une fonction sans **return** retourne **undefined**.
- On peut appeler la même fonction plusieurs fois avec des arguments différents.

**Mission :** déclare greet et logue **greet("Cadet")** (peu importe le mot ensuite, du moment qu'il y a "Cadet").
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer une fonction nommée greet" },
        { id: "o1b", label: 'Afficher le résultat pour name = "Cadet"' },
      ],
      docRefs: ["js/fonctions"],
      missionIcon: "🧩",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIÈRE FONCTION",
      bannerIcon: "🔧",
      bannerTtl: "MODULE OPÉRATIONNEL",
      bannerSub: "La fonction est réutilisable a volonte.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        "// Declare addXp(current, gain) qui retourne current + gain, et logue addXp(120, 50)\n",
      placeholder: "// function addXp(current, gain) { ... }",
      narrator:
        "Les fonctions peuvent accepter plusieurs paramètres. Implémente un calcul d'XP.",
      hint:
        "function addXp(current, gain) { return current + gain; }\\nconsole.log(addXp(120, 50));",
      briefing: {
        title: "Plusieurs paramètres",
        content: `
### Syntaxe
\`function addXp(current, gain) {\`
\`  return current + gain;\`
\`}\`

### Appel
\`addXp(120, 50); // 170\`

### Ordre des arguments
L'ordre compte : le premier argument va dans le premier parametre, etc.

### Bonnes pratiques
- Noms de paramètres courts et explicites.
- Une fonction = une responsabilite. Si elle fait trop, découpe-la.

**Mission :** la console doit afficher **170**.
        `,
      },
      objectives: [
        { id: "o2a", label: "Déclarer une fonction à deux paramètres" },
        { id: "o2b", label: "Afficher 170 (résultat de addXp(120, 50))" },
      ],
      missionIcon: "➕",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ARGUMENTS MULTIPLES",
      bannerIcon: "🎯",
      bannerTtl: "CALCUL FIABLE",
      bannerSub: "La fonction accepte deux entrees et renvoie leur somme.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        "// Reecris une fonction double(x) en arrow function (=>) et logue double(7)\n",
      placeholder: "// const double = (x) => ...",
      narrator:
        "Forme alternative et plus concise : la **fonction fléchée**. Reecris une simple opération.",
      hint: "const double = (x) => x * 2;\\nconsole.log(double(7));",
      briefing: {
        title: "Arrow functions",
        content: `
### Syntaxe courte
\`const double = (x) => x * 2;\`

### Équivalent verbeux
\`function double(x) {\`
\`  return x * 2;\`
\`}\`

### Variantes
- **Un seul parametre, pas de parenthèses** : \`const f = x => x * 2;\`
- **Plusieurs lignes, accolades + return** : \`const f = (x) => { const y = x + 1; return y * 2; };\`
- **Plusieurs paramètres** : \`const sum = (a, b) => a + b;\`

### Quand l'utiliser ?
- Pour des fonctions courtes (callbacks, map, filter...).
- Pour déclarer des helpers locaux dans une autre fonction.

**Mission :** affiche \`14\` (résultat de double(7)).
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser une arrow function (=>)" },
        { id: "o3b", label: "Afficher 14" },
      ],
      missionIcon: "🏹",
      missionTag: "PROTOCOLE 03",
      missionTtl: "FORME COMPACTE",
      bannerIcon: "⚡",
      bannerTtl: "SYNTHAXE MAÎTRISÉE",
      bannerSub: "Tu connais les deux façons de déclarer une fonction.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        "// Cree status(level) qui retourne :\n// - 'Cadet' si level < 5\n// - 'Pilote' si level < 10\n// - 'Capitaine' sinon\n// Affiche status(7)\n",
      placeholder: "// function status(level) { ... }",
      narrator:
        "Combine fonction et conditions. Le rang doit dependre du niveau passe en parametre.",
      hint:
        "function status(level) { if (level < 5) return 'Cadet'; if (level < 10) return 'Pilote'; return 'Capitaine'; }\\nconsole.log(status(7));",
      briefing: {
        title: "Combiner if et return",
        content: `
### Astuce : return interrompt
Des qu'une fonction execute un **return**, la suite n'est plus exécutée.
Pas besoin de **else** :

\`function status(level) {\`
\`  if (level < 5) return "Cadet";\`
\`  if (level < 10) return "Pilote";\`
\`  return "Capitaine";\`
\`}\`

### Pourquoi c'est utile ?
- Code plus plat (moins de niveaux d'imbrication).
- Plus facile a lire pour les "guard clauses" (cas particuliers en premier).

**Mission :** logue \`Pilote\` (résultat de status(7)).
        `,
      },
      objectives: [
        { id: "o4a", label: "Combiner if et return dans une fonction" },
        { id: "o4b", label: 'Afficher "Pilote" pour level = 7' },
      ],
      missionIcon: "🏷",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RANG DYNAMIQUE",
      bannerIcon: "🎖",
      bannerTtl: "GRADE ATTRIBUE",
      bannerSub: "La fonction adapte sa réponse selon le niveau.",
      bannerXp: "⚡ +55 XP",
    },
  ],
};