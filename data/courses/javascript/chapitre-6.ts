import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : TRAITEMENT DE DONNEES",
  title: "METHODES\nMODERNES",
  subtitle: "Manipule des tableaux avec map, filter, reduce et find",
  totalXp: 260,
  completionBadge: "🧮",
  completionBadgeLabel: "ANALYSTE DE DONNEES",
  steps: [
    {
      startCode:
        "const xp = [50, 120, 80, 200, 30];\n// Cree un tableau xpDouble qui contient chaque XP multiplie par 2, et affiche-le.\n",
      placeholder: "// Utilise map pour transformer chaque element",
      narrator:
        "Tu dois doubler les XP de tous les cadets pour une operation speciale. Utilise la methode map() pour transformer le tableau xp en xpDouble, puis affiche-le.",
      hint: "const xpDouble = xp.map((n) => n * 2);\nconsole.log(xpDouble);",
      briefing: {
        title: "Array.map()",
        content: `
### Le probleme
Tu as un tableau, tu veux **un nouveau tableau de meme taille** ou chaque element est transforme.

### Avec une boucle classique
\`const xpDouble = [];\`
\`for (let i = 0; i < xp.length; i++) {\`
\`  xpDouble.push(xp[i] * 2);\`
\`}\`

### Avec map()
\`const xpDouble = xp.map((n) => n * 2);\`

**Une seule ligne**, plus lisible, plus declaratif.

### Comment ca marche ?
**map(callback)** appelle callback pour chaque element et **retourne un nouveau tableau** avec les valeurs retournees. Le tableau original n'est PAS modifie.

### Exemple plus parlant
\`const noms = ["luna", "io", "mars"];\`
\`const enMaj = noms.map((n) => n.toUpperCase());\`
\`// ["LUNA", "IO", "MARS"]\`

**A retenir :** map = "transformation". Il garde **toujours le meme nombre d'elements**.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser .map() sur le tableau" },
        { id: "o1b", label: "Afficher le nouveau tableau" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 01",
      missionTtl: "TRANSFORMATION",
      bannerIcon: "🔁",
      bannerTtl: "DONNEES TRANSFORMEES",
      bannerSub: "Chaque XP a ete double dans un nouveau tableau.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "const equipage = [\n  { nom: 'Luna', niveau: 8 },\n  { nom: 'Io', niveau: 3 },\n  { nom: 'Mars', niveau: 12 },\n  { nom: 'Phobos', niveau: 5 },\n];\n// Cree un tableau elites qui ne contient que les membres de niveau >= 5, et affiche-le.\n",
      placeholder: "// Utilise filter pour ne garder que les niveaux >= 5",
      narrator:
        "On veut isoler les membres d'elite (niveau >= 5). Utilise filter() pour creer un sous-tableau, puis affiche-le.",
      hint: "const elites = equipage.filter((m) => m.niveau >= 5);\nconsole.log(elites);",
      briefing: {
        title: "Array.filter()",
        content: `
### Quand l'utiliser
Quand tu veux **garder seulement** certains elements d'un tableau, selon une condition.

### Syntaxe
\`const elites = equipage.filter((m) => m.niveau >= 5);\`

Le callback retourne **true** (on garde) ou **false** (on jette).

### Difference avec map
- **map** : transforme, taille identique.
- **filter** : selectionne, taille **inferieure ou egale**.

### Combiner les deux (tres frequent)
\`const nomsElites = equipage\`
\`  .filter((m) => m.niveau >= 5)\`
\`  .map((m) => m.nom);\`
\`// ["Luna", "Mars", "Phobos"]\`

D'abord on filtre, puis on transforme. C'est un **pipeline**.

### Cas d'usage
- Filtrer des produits par stock > 0.
- Garder les messages non lus.
- Afficher uniquement les contacts en ligne.

**A retenir :** filter ne change jamais les elements, il en garde juste un sous-ensemble.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser .filter() sur le tableau" },
        { id: "o2b", label: "La condition cible niveau >= 5" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "SELECTION CONDITIONNELLE",
      bannerIcon: "🎯",
      bannerTtl: "ELITES IDENTIFIEES",
      bannerSub: "Le sous-tableau contient uniquement les membres qualifies.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "const cargo = [\n  { nom: 'Eau', masse: 120 },\n  { nom: 'Oxygene', masse: 80 },\n  { nom: 'Vivres', masse: 200 },\n];\n// Calcule la masse totale du cargo avec reduce, et affiche-la.\n",
      placeholder: "// Utilise reduce pour additionner masse",
      narrator:
        "Avant le decollage, calcule la masse totale du cargo. Utilise reduce() pour additionner toutes les masses.",
      hint: "const total = cargo.reduce((sum, item) => sum + item.masse, 0);\nconsole.log(total);",
      briefing: {
        title: "Array.reduce()",
        content: `
### A quoi sert reduce ?
**Reduire un tableau a une seule valeur** : somme, moyenne, max, min, regroupement, etc.

### Syntaxe
\`const total = cargo.reduce((sum, item) => sum + item.masse, 0);\`

**Deux arguments** :
1. **Le callback** : recoit l'accumulateur et l'element courant, retourne le nouveau accumulateur.
2. **La valeur initiale** : ici 0 (le total commence a zero).

### Etape par etape
- Iteration 1 : sum = 0, item = Eau (120). Retour : 120.
- Iteration 2 : sum = 120, item = Oxygene (80). Retour : 200.
- Iteration 3 : sum = 200, item = Vivres (200). Retour : 400.
- Final : 400.

### Autres exemples
\`// Trouver le max\`
\`const max = nbs.reduce((m, n) => Math.max(m, n), -Infinity);\`

\`// Compter les occurrences\`
\`const compte = mots.reduce((acc, m) => {\`
\`  acc[m] = (acc[m] || 0) + 1;\`
\`  return acc;\`
\`}, {});\`

### Quand utiliser reduce vs map/filter ?
- **map** : tableau -> tableau de meme taille.
- **filter** : tableau -> sous-tableau.
- **reduce** : tableau -> **une seule valeur** (nombre, objet, string).

**A retenir :** reduce est le plus puissant et le plus difficile a maitriser. Quand tu sais l'ecrire, tu sais penser fonctionnel.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser .reduce() sur le tableau" },
        { id: "o3b", label: "Afficher 400 (somme des masses)" },
      ],
      missionIcon: "📊",
      missionTag: "PROTOCOLE 03",
      missionTtl: "AGREGATION",
      bannerIcon: "📊",
      bannerTtl: "TOTAL CALCULE",
      bannerSub: "reduce a additionne toutes les masses en une seule valeur.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "const ships = [\n  { id: 'NEB-01', etat: 'op' },\n  { id: 'NEB-02', etat: 'maintenance' },\n  { id: 'NEB-03', etat: 'op' },\n];\n// Trouve le premier vaisseau en maintenance et affiche son id.\n",
      placeholder: "// Utilise find pour trouver le premier en maintenance",
      narrator:
        "Le commandant veut savoir quel vaisseau est en maintenance. Utilise find() pour trouver le premier element qui correspond, et affiche son id.",
      hint: "const ship = ships.find((s) => s.etat === 'maintenance');\nconsole.log(ship.id);",
      briefing: {
        title: "Array.find()",
        content: `
### A quoi sert find ?
Retourne **le premier element** qui satisfait une condition. **Pas un tableau**, juste l'element (ou undefined).

### Difference avec filter
- **filter** : retourne TOUS les elements qui matchent (tableau).
- **find** : retourne LE PREMIER (objet ou undefined).

### Exemple
\`const ship = ships.find((s) => s.etat === 'maintenance');\`
\`// { id: 'NEB-02', etat: 'maintenance' }\`

### Si rien ne matche
\`const ship = ships.find((s) => s.id === 'XXX');\`
\`// undefined\`

**Reflexe :** verifie toujours que le resultat n'est pas undefined avant d'acceder a ses proprietes.

\`if (ship) console.log(ship.id);\`

### findIndex
Variante qui retourne **l'index** au lieu de l'element :
\`const i = ships.findIndex((s) => s.etat === 'maintenance');\`
\`// 1\`

### Methodes voisines
- **some(callback)** : retourne true si AU MOINS UN element matche.
- **every(callback)** : retourne true si TOUS les elements matchent.

**A retenir :** find = "donne-moi le premier qui...". Le plus simple et utile au quotidien.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser .find() sur le tableau" },
        { id: "o4b", label: "Afficher 'NEB-02'" },
      ],
      missionIcon: "🔎",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RECHERCHE CIBLEE",
      bannerIcon: "🔎",
      bannerTtl: "VAISSEAU LOCALISE",
      bannerSub: "find a renvoye le premier element correspondant.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};
