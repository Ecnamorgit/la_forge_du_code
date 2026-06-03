import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : BLINDAGE DU CODE",
  title: "TYPESCRIPT &\nTYPAGE STATIQUE",
  subtitle: "Detecte les bugs avant meme d'executer ton code",
  totalXp: 280,
  completionBadge: "🛡",
  completionBadgeLabel: "INGENIEUR TYPES",
  steps: [
    {
      startCode:
        "// Annote ces variables avec leur type TypeScript :\n//   - pilote (string) doit valoir 'Lia'\n//   - niveau (number) doit valoir 5\n//   - actif (boolean) doit valoir true\nlet pilote = 'Lia';\nlet niveau = 5;\nlet actif = true;\n",
      placeholder: "// let pilote: string = '...'",
      narrator:
        "JavaScript est tolerant : il accepte qu'une variable change de type a tout moment. C'est une source enorme de bugs en production. TypeScript ajoute un blindage statique au code en imposant des types explicites.",
      hint: "let pilote: string = 'Lia';\nlet niveau: number = 5;\nlet actif: boolean = true;",
      briefing: {
        title: "Les types primitifs",
        content: `
### Pourquoi TypeScript ?
Imagine cette ligne JS : \`niveau + '1'\` — JS la transforme silencieusement en concatenation et tu obtiens \`'51'\` au lieu de \`6\`. En TS, le compilateur t'arrete avant meme l'execution.

### La syntaxe d'annotation
\`let nom: TYPE = valeur;\`

Les trois types primitifs principaux :
- **string** : texte (\`'Lia'\`, \`"texte"\`, backticks)
- **number** : tout nombre (entier ou flottant)
- **boolean** : \`true\` ou \`false\`

### L'inference de type
TypeScript devine souvent le type tout seul :
\`let niveau = 5;\` -> TS sait deja que c'est un \`number\`.

L'annotation explicite est utile quand :
- La variable est declaree sans valeur initiale
- Tu veux forcer un type particulier
- Tu veux documenter ton intention

### Les types speciaux
- **any** : echappe au typage (a EVITER, c'est revenir au JS pur)
- **unknown** : valeur typee mais inconnue, plus sur que any
- **null** et **undefined** : types a part entiere
- **never** : valeur qui ne peut jamais exister (fonctions qui throw)

**A retenir :** TS = JS + types statiques verifies a la compilation. Le compilateur attrape les bugs avant que ton utilisateur les voie.
        `,
      },
      objectives: [
        { id: "o1a", label: "Annoter chaque variable avec son type" },
        { id: "o1b", label: "Utiliser string, number, boolean correctement" },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIERS TYPES",
      bannerIcon: "🛡",
      bannerTtl: "BLINDAGE INSTALLE",
      bannerSub: "Tes variables sont protegees contre les changements de type.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Type la fonction calculerXp :\n//   - parametres : niveau (number), bonus (number)\n//   - retour : number\n// Elle doit retourner niveau * 10 + bonus.\nfunction calculerXp(niveau, bonus) {\n  return niveau * 10 + bonus;\n}\n",
      placeholder: "// function nom(p: type): retour { ... }",
      narrator:
        "Les fonctions sont la principale source de bugs : un parametre du mauvais type ou un retour mal compris. Annote-les pour que TypeScript verifie chaque appel.",
      hint: "function calculerXp(niveau: number, bonus: number): number {\n  return niveau * 10 + bonus;\n}",
      briefing: {
        title: "Typer les fonctions",
        content: `
### La syntaxe complete
\`function nom(param1: type1, param2: type2): typeRetour { ... }\`

\`function calculerXp(niveau: number, bonus: number): number {\`
\`  return niveau * 10 + bonus;\`
\`}\`

### Le type de retour
Souvent omis (inference), mais l'annoter explicitement est une bonne habitude :
- Documente l'intention
- Empeche les bugs subtils si la logique change
- Apparait dans l'IDE quand on survole la fonction

### Parametres optionnels et defauts
- \`function f(x: number, y?: number)\` -> y peut etre omis (type \`number | undefined\`)
- \`function f(x: number, y: number = 10)\` -> y vaut 10 par defaut

### Les fonctions flechees
Meme principe :
\`const calculer = (n: number, b: number): number => n * 10 + b;\`

### Type \`void\`
Pour une fonction qui ne retourne rien :
\`function log(msg: string): void { console.log(msg); }\`

### Le piege classique
\`function f(x): number\` -> sans typer x, TS lui assigne \`any\` (avec un warning si \`noImplicitAny\` est actif, ce qui DOIT etre le cas).

**A retenir :** Types sur tous les parametres, type de retour explicite. La signature devient un contrat verifiable.
        `,
      },
      objectives: [
        { id: "o2a", label: "Typer les deux parametres en number" },
        { id: "o2b", label: "Annoter le type de retour en number" },
      ],
      missionIcon: "⚙",
      missionTag: "PROTOCOLE 02",
      missionTtl: "FONCTIONS TYPEES",
      bannerIcon: "⚙",
      bannerTtl: "CONTRAT SIGNE",
      bannerSub: "Tes fonctions ont une signature verifiable par le compilateur.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Definis une interface Pilote avec les champs :\n//   id     : number\n//   nom    : string\n//   niveau : number\n//   actif  : boolean\n// Puis cree une constante 'lia' de type Pilote avec id=1, nom='Lia', niveau=5, actif=true.\n",
      placeholder: "// interface Pilote { ... }",
      narrator:
        "Les objets meritent leur propre structure typee. Une interface decrit la forme attendue d'un objet : ses champs, leurs types, ce qui est obligatoire. C'est le coeur du typage TypeScript.",
      hint: "interface Pilote {\n  id: number;\n  nom: string;\n  niveau: number;\n  actif: boolean;\n}\n\nconst lia: Pilote = {\n  id: 1,\n  nom: 'Lia',\n  niveau: 5,\n  actif: true,\n};",
      briefing: {
        title: "Interfaces et types d'objet",
        content: `
### Declarer une interface
\`interface Pilote {\`
\`  id: number;\`
\`  nom: string;\`
\`  niveau: number;\`
\`}\`

### Utiliser l'interface
\`const lia: Pilote = { id: 1, nom: 'Lia', niveau: 5 };\`

Si tu oublies un champ ou ajoutes un champ non declare, TS te le signale immediatement.

### Champs optionnels
Le \`?\` rend un champ facultatif :
\`interface Pilote {\`
\`  id: number;\`
\`  surnom?: string;  // optionnel\`
\`}\`

### Readonly
\`interface Vaisseau { readonly id: number; }\`
-> impossible de modifier \`vaisseau.id\` apres creation.

### Interface vs type
Deux syntaxes quasi equivalentes :
\`interface Pilote { ... }\`
\`type Pilote = { ... };\`

**Convention** : \`interface\` pour les objets et formes de classes, \`type\` pour les unions, intersections, primitives renommees. Mais beaucoup d'equipes utilisent \`type\` partout.

### Extension
\`interface Cadet extends Pilote { promotion: string; }\`
-> Cadet a tous les champs de Pilote + promotion.

**A retenir :** Une interface est un contrat sur la forme d'un objet. TS verifie a la creation ET a chaque acces.
        `,
      },
      objectives: [
        { id: "o3a", label: "Definir une interface Pilote avec tous les champs" },
        { id: "o3b", label: "Typer la constante lia avec : Pilote" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "INTERFACES",
      bannerIcon: "📐",
      bannerTtl: "STRUCTURE FIGEE",
      bannerSub: "Tes objets respectent un contrat formel.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Definis un type Statut limite a trois valeurs : 'en_vol', 'en_base', 'detruit'.\n// Cree une fonction afficher(statut: Statut) qui :\n//   - si en_vol : retourne 'En mission'\n//   - si en_base : retourne 'Au repos'\n//   - si detruit : retourne 'Perdu'\n",
      placeholder: "// type Statut = '...' | '...' | '...'",
      narrator:
        "Les types unions et litteraux sont la veritable puissance de TypeScript. Ils te permettent de restreindre une variable a une liste exacte de valeurs autorisees. Adieu les chaines magiques fragiles.",
      hint: "type Statut = 'en_vol' | 'en_base' | 'detruit';\n\nfunction afficher(statut: Statut): string {\n  if (statut === 'en_vol') return 'En mission';\n  if (statut === 'en_base') return 'Au repos';\n  return 'Perdu';\n}",
      briefing: {
        title: "Union types et literal types",
        content: `
### Le type union ( | )
Permet une variable de plusieurs types possibles :
\`let valeur: string | number;\`
-> valeur peut etre une chaine OU un nombre, mais rien d'autre.

### Les literal types
Tu peux exiger une **valeur exacte** comme type :
\`type Statut = 'en_vol' | 'en_base' | 'detruit';\`

Maintenant, \`'en_combat'\` declenche une erreur de compilation. Seules les 3 valeurs sont valides.

### Pourquoi c'est genial
1. **L'autocompletion** propose les 3 valeurs dans l'IDE
2. **Le refacto** : renommer 'en_vol' en 'en_mission' force TS a trouver TOUS les endroits a changer
3. **Le narrowing** : dans un \`if (statut === 'en_vol')\`, TS sait que statut est de ce type litteral

### Discrimination de type
\`function trier(valeur: string | number) {\`
\`  if (typeof valeur === 'string') {\`
\`    // ici, TS sait que valeur est string\`
\`    return valeur.toUpperCase();\`
\`  }\`
\`  // ici, TS sait que valeur est number\`
\`  return valeur * 2;\`
\`}\`

### Pour aller plus loin
Tu rencontreras vite :
- **Generics** \`<T>\` -> fonctions et structures reutilisables type-safe
- **Utility types** : \`Partial<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`, \`Record<K, V>\`
- **Enums** vs literal unions (literals sont preferes aujourd'hui)
- **as const** -> fige un objet en literal types profonds

**A retenir :** Union + literals = puissance et securite. Tu remplaces des conventions fragiles par des contrats verifies.
        `,
      },
      objectives: [
        { id: "o4a", label: "Definir un type union de 3 literals" },
        { id: "o4b", label: "Typer le parametre de la fonction avec ce type" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 04",
      missionTtl: "UNIONS & LITERALS",
      bannerIcon: "🛡",
      bannerTtl: "TYPES BLINDES",
      bannerSub: "Tu maitrises le typage statique. Tes futurs bugs n'auront plus aucune chance.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
