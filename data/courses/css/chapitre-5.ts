import type { ChapterData } from "@/data/courses/html/types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : CARTOGRAPHIE STELLAIRE",
  title: "CARTOGRAPHIE\nGRID",
  subtitle: "Construis des grilles 2D avec CSS Grid",
  totalXp: 250,
  completionBadge: "🗺",
  completionBadgeLabel: "CARTOGRAPHE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid { background-color: #0a1322; padding: 12px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Active grid sur .grid -->",
      narrator:
        "Place la carte tactique. CSS Grid permet de créer des grilles à deux dimensions. Active-le sur le conteneur.",
      hint: "Ajoute : .grid { display: grid; }",
      briefing: {
        title: "Activer Grid",
        content: `
*« Pour une carte tactique, une seule dimension ne suffit pas. \`display: grid\` te donne lignes ET colonnes — quadrille l'espace comme une grille de défense. »* — **Kira**

### CSS Grid, c'est quoi ?
Un système de mise en page **bidimensionnel** : lignes ET colonnes en même temps.

### Activation
\`.grid {\`
\`  display: grid;\`
\`}\`

### Grid vs Flexbox
- **Flexbox** : excellent pour aligner en **une dimension** (ligne OU colonne).
- **Grid** : pense pour les **mises en page 2D** complexes (lignes ET colonnes).

### Quand utiliser Grid ?
- Tableaux de bord, dashboards.
- Galeries photos.
- Layouts de page complets (header + sidebar + content + footer).

**Par défaut :** sans plus de configuration, grid se comporte comme un display: block. Il faut définir les colonnes à l'étape suivante.
        `,
      },
      objectives: [
        { id: "o1a", label: "Activer display: grid sur .grid" },
      ],
      docRefs: ["css/grid"],
      missionIcon: "🧭",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DEPLOYER LA GRILLE",
      bannerIcon: "🗺",
      bannerTtl: "GRILLE ACTIVEE",
      bannerSub: "Le moteur de cartographie est en ligne.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid { background-color: #0a1322; padding: 12px; display: grid; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Définis trois colonnes égales -->",
      narrator:
        "Notre carte a besoin de trois colonnes égales. Définis-les avec grid-template-columns en utilisant l'unité fr.",
      hint: "Ajoute à .grid : grid-template-columns: 1fr 1fr 1fr;",
      briefing: {
        title: "Définir les colonnes",
        content: `
### grid-template-columns
Décrit le nombre **et** la taille des colonnes.

### Syntaxe
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`}\`

Cette ligne signifie : 3 colonnes égales.

### L'unité fr (fraction)
- **1fr** = une part de l'espace disponible.
- \`1fr 1fr\` = deux colonnes égales.
- \`2fr 1fr\` = la première fait 2x la taille de la deuxième.

### Variantes utiles
- \`200px 1fr\` : sidebar fixe + contenu flexible.
- \`repeat(3, 1fr)\` : raccourci pour \`1fr 1fr 1fr\`.

**À retenir :** \`fr\` est l'unité native de Grid, parfaite pour repartir l'espace.
        `,
      },
      objectives: [
        { id: "o2a", label: "Définir grid-template-columns" },
        { id: "o2b", label: "Utiliser au moins 3 colonnes" },
      ],
      missionIcon: "🟫",
      missionTag: "PROTOCOLE 02",
      missionTtl: "TRACER LES COLONNES",
      bannerIcon: "📐",
      bannerTtl: "GRILLE STRUCTURÉE",
      bannerSub: "Les colonnes sont définies — la carte prend forme.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid {\n        background-color: #0a1322;\n        padding: 12px;\n        display: grid;\n        grid-template-columns: 1fr 1fr 1fr;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Épace les cellules avec gap -->",
      narrator:
        "Les cellules sont collées. Comme en Flexbox, gap fonctionne aussi en Grid pour espacer lignes et colonnes.",
      hint: "Ajoute à .grid : gap: 12px;",
      briefing: {
        title: "gap, encore et toujours",
        content: `
### Réutilisation de gap
La même propriété **gap** fonctionne en Grid comme en Flexbox.

### Exemple simple
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`  gap: 12px;\`
\`}\`

### Différencier vertical/horizontal
- \`gap: 12px;\` -> 12px partout.
- \`gap: 16px 8px;\` -> 16px **vertical** (entre lignes), 8px **horizontal** (entre colonnes).
- Alias : \`row-gap: 16px\` et \`column-gap: 8px\`.

**À retenir :** gap remplace les vieux hacks de marges négatives pour espacer une grille.
        `,
      },
      objectives: [
        { id: "o3a", label: "Appliquer gap sur .grid" },
      ],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 03",
      missionTtl: "AÉRER LA CARTE",
      bannerIcon: "🛰",
      bannerTtl: "CELLULES SÉPARÉES",
      bannerSub: "La grille est lisible, chaque secteur est identifiable.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid {\n        background-color: #0a1322;\n        padding: 12px;\n        display: grid;\n        grid-template-columns: 1fr 1fr 1fr;\n        gap: 12px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Définis aussi la hauteur de chaque ligne -->",
      narrator:
        "Pour terminer la cartographie, fixe la hauteur des lignes avec grid-template-rows. La grille devient totalement maîtrisée.",
      hint: "Ajoute à .grid : grid-template-rows: 100px 100px;",
      briefing: {
        title: "Définir les lignes",
        content: `
### grid-template-rows
Comme grid-template-columns, mais pour les **lignes**.

### Exemple
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`  grid-template-rows: 100px 100px;\`
\`  gap: 12px;\`
\`}\`

Cette config crée une grille 3 colonnes x 2 lignes, chaque ligne faisant 100px de haut.

### Auto vs explicite
- Tu peux écrire \`grid-template-rows: auto auto;\` (le navigateur calcule la hauteur).
- \`100px 1fr\` : première ligne fixe, deuxième prend l'espace restant.

### Félicitations
Tu maîtrises maintenant les fondations de CSS : sélecteurs, box model, Flexbox et Grid. La suite (responsive, animations, Tailwind) viendra dans les cursus suivants.

**Mission finale :** la station est habillée — prête pour la suite de l'aventure.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir grid-template-rows" },
      ],
      missionIcon: "🌌",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FIXER LES LIGNES",
      bannerIcon: "🏁",
      bannerTtl: "CARTE COMPLÈTE",
      bannerSub:
        "La cartographie tactique est opérationnelle. Cursus CSS termine.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};