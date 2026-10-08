import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : TRAITEMENT DE DONNÉES",
  title: "MÉTHODES\nMODERNES",
  subtitle: "Manipule des tableaux avec map, filter, reduce et find",
  totalXp: 260,
  completionBadge: "🧮",
  completionBadgeLabel: "ANALYSTE DE DONNÉES",
  steps: [
    {
      startCode:
        "const xp = [50, 120, 80, 200, 30];\n// Cree un tableau xpDouble qui contient chaque XP multiplie par 2, et affiche-le.\n",
      placeholder: "// Utilise map pour transformer chaque element",
      narrator:
        "Tu dois doubler les points d'expérience (XP) de tous les cadets pour une opération spéciale. Utilise la méthode map() pour transformer le tableau xp en xpDouble, puis affiche-le.",
      hint: "const xpDouble = xp.map((n) => n * 2);\nconsole.log(xpDouble);",
      briefing: {
        title: "Array.map()",
        content: `
*« Traiter mille cadets un par un ? Tu n'as pas le temps. \`map\` transforme toute une colonne d'un seul ordre — sans jamais toucher à l'original. »* — **Kira**

### Le problème
Tu as un tableau, tu veux **un nouveau tableau de même taille** où chaque élément est transformé.

### Avec une boucle classique
\`const xpDouble = [];\`
\`for (let i = 0; i < xp.length; i++) {\`
\`  xpDouble.push(xp[i] * 2);\`
\`}\`

### Avec map()
\`const xpDouble = xp.map((n) => n * 2);\`

**Une seule ligne**, plus lisible, plus déclaratif.

### Comment ça marche ?
**map(callback)** appelle callback pour chaque élément et **retourne un nouveau tableau** avec les valeurs retournées. Le tableau original n'est PAS modifié.

### Exemple plus parlant
\`const noms = ["luna", "io", "mars"];\`
\`const enMaj = noms.map((n) => n.toUpperCase());\`
\`// ["LUNA", "IO", "MARS"]\`

**À retenir :** map = "transformation". Il garde **toujours le même nombre d'éléments**.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser .map() sur le tableau" },
        { id: "o1b", label: "Afficher le nouveau tableau" },
      ],
      docRefs: ["js/array-methods"],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 01",
      missionTtl: "TRANSFORMATION",
      bannerIcon: "🔁",
      bannerTtl: "DONNÉES TRANSFORMÉES",
      bannerSub: "Chaque XP a été doublé dans un nouveau tableau.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "const equipage = [\n  { nom: 'Luna', niveau: 8 },\n  { nom: 'Io', niveau: 3 },\n  { nom: 'Mars', niveau: 12 },\n  { nom: 'Phobos', niveau: 5 },\n];\n// Cree un tableau elites qui ne contient que les membres de niveau >= 5, et affiche-le.\n",
      placeholder: "// Utilise filter pour ne garder que les niveaux >= 5",
      narrator:
        "On veut isoler les membres d'élite (niveau ≥ 5). Utilise filter() pour créer un sous-tableau, puis affiche-le.",
      hint: "const elites = equipage.filter((m) => m.niveau >= 5);\nconsole.log(elites);",
      briefing: {
        title: "Array.filter()",
        content: `
### Quand l'utiliser
Quand tu veux **garder seulement** certains éléments d'un tableau, selon une condition.

### Syntaxe
\`const elites = equipage.filter((m) => m.niveau >= 5);\`

**Deux arguments** :
1. **Le callback** : reçoit chaque élément et retourne un booléen indiquant si l'élément doit être inclus.
2. **Retour** : un nouveau tableau contenant uniquement les éléments pour lesquels le callback a retourné true.

### Exemple plus parlant
\`const equipage = [\n  { nom: 'Luna', niveau: 8 },\n  { nom: 'Io', niveau: 3 },\n  { nom: 'Mars', niveau: 12 },\n  { nom: 'Phobos', niveau: 5 }\n];\`
\`const elites = equipage.filter((m) => m.niveau >= 5);\`
\`// [{ nom: 'Luna', niveau: 8 }, { nom: 'Mars', niveau: 12 }, { nom: 'Phobos', niveau: 5 }]\`

**À retenir :** filter = "sélection". Il permet de filtrer les éléments selon une condition.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .filter() sur le tableau" },
        { id: "o2b", label: "Afficher le sous-tableau d'élites" },
      ],
      missionIcon: " sàng",
      missionTag: "PROTOCOLE 02",
      missionTtl: "SÉLECTION",
      bannerIcon: " sàng",
      bannerTtl: "ÉLITES IDENTIFIÉES",
      bannerSub: "Les membres d'élite ont été filtrés selon leur niveau.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "const cargo = [\n  { id: 'CARGO-01', poids: 200 },\n  { id: 'CARGO-02', poids: 300 },\n  { id: 'CARGO-03', poids: 500 }\n];\n// Calcule le poids total des cargaisons et affiche-le.\n",
      placeholder: "// Utilise reduce pour calculer la somme des poids",
      narrator:
        "Le capitaine veut connaître le poids total des cargaisons. Utilise reduce() pour additionner les poids de chaque cargaison, puis affiche le résultat.",
      hint: "const totalPoids = cargo.reduce((sum, item) => sum + item.poids, 0);\nconsole.log(totalPoids);",
      briefing: {
        title: "Array.reduce()",
        content: `
### A quoi sert reduce ?
Retourne **une seule valeur** calculée à partir des éléments d'un tableau. Utile pour effectuer des opérations cumulatives comme la somme, le produit ou l'agrégation.

### Syntaxe
\`const totalPoids = cargo.reduce((sum, item) => sum + item.poids, 0);\`

**Deux arguments** :
1. **Le callback** : reçoit un accumulateur (la valeur courante) et chaque élément du tableau, retourne la nouvelle valeur de l'accumulateur.
2. **La valeur initiale** : ici 0 (le total commence à zéro).

### Étape par étape
- Iteration 1 : sum = 0, item = CARGO-01 (200). Retour : 200.
- Iteration 2 : sum = 200, item = CARGO-02 (300). Retour : 500.
- Iteration 3 : sum = 500, item = CARGO-03 (500). Retour : 1000.
- Final : 1000.

### Autres exemples
\`// Trouver le max\`
\`const maxPoids = cargaisons.reduce((m, c) => Math.max(m, c.poids), 0);\`

\`// Compter les occurrences par type\`
\`const compteType = cargaisons.reduce((acc, c) => {\`
\`  acc[c.type] = (acc[c.type] || 0) + 1;\`
\`  return acc;\`
\`}, {});\`

### Quand utiliser reduce vs map/filter ?
- **map** : tableau -> tableau de même taille.
- **filter** : tableau -> sous-tableau.
- **reduce** : tableau -> **une seule valeur** (nombre, objet, string).

**À retenir :** reduce est le plus puissant et le plus difficile à maîtriser. Quand tu sais l'écrire, tu sais penser fonctionnel.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser .reduce() sur le tableau" },
        { id: "o3b", label: "Afficher 1000 (somme des poids)" },
      ],
      missionIcon: "📊",
      missionTag: "PROTOCOLE 03",
      missionTtl: "AGRÉGATION",
      bannerIcon: "📊",
      bannerTtl: "TOTAL CALCULÉ",
      bannerSub: "reduce a additionné tous les poids en une seule valeur.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "const vaisseaux = [\n  { id: 'VAIS-01', etat: 'op' },\n  { id: 'VAIS-02', etat: 'maintenance' },\n  { id: 'VAIS-03', etat: 'op' }\n];\n// Trouve le premier vaisseau en maintenance et affiche son id.\n",
      placeholder: "// Utilise find pour trouver le premier en maintenance",
      narrator:
        "Le commandant veut savoir quel vaisseau est en maintenance. Utilise find() pour trouver le premier élément qui correspond, et affiche son id.",
      hint: "const vaisseau = vaisseaux.find((v) => v.etat === 'maintenance');\nconsole.log(vaisseau.id);",
      briefing: {
        title: "Array.find()",
        content: `
### A quoi sert find ?
Retourne **le premier élément** qui satisfait une condition. **Pas un tableau**, juste l'élément (ou undefined).

### Différence avec filter
- **filter** : retourne TOUS les éléments qui matchent (tableau).
- **find** : retourne LE PREMIER (objet ou undefined).

### Exemple
\`const vaisseau = vaisseaux.find((v) => v.etat === 'maintenance');\`
\`// { id: 'VAIS-02', etat: 'maintenance' }\`

### Si rien ne matche
\`const vaisseau = vaisseaux.find((v) => v.id === 'XXX');\`
\`// undefined\`

**Réflexe :** vérifie toujours que le résultat n'est pas undefined avant d'accéder à ses propriétés.

\`if (vaisseau) console.log(vaisseau.id);\`

### findIndex
Variante qui retourne **l'index** au lieu de l'élément :
\`const i = vaisseaux.findIndex((v) => v.etat === 'maintenance');\`
\`// 1\`

### Méthodes voisines
- **some(callback)** : retourne true si AU MOINS UN élément matche.
- **every(callback)** : retourne true si TOUS les éléments matchent.

**À retenir :** find = "donne-moi le premier qui...". Le plus simple et utile au quotidien.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser .find() sur le tableau" },
        { id: "o4b", label: "Afficher 'VAIS-02'" },
      ],
      missionIcon: "🔎",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RECHERCHE CIBLÉE",
      bannerIcon: "🔎",
      bannerTtl: "VAISSEAU LOCALISÉ",
      bannerSub: "find a renvoyé le premier élément correspondant.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};