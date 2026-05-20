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
        "Place a la carte tactique. CSS Grid permet de creer des grilles a deux dimensions. Active-le sur le conteneur.",
      hint: "Ajoute : .grid { display: grid; }",
      briefing: {
        title: "Activer Grid",
        content: `
### CSS Grid, c'est quoi ?
Un systeme de mise en page **bidimensionnel** : lignes ET colonnes en meme temps.

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

**Par defaut :** sans plus de configuration, grid se comporte comme un display: block. Il faut definir les colonnes a l'etape suivante.
        `,
      },
      objectives: [
        { id: "o1a", label: "Activer display: grid sur .grid" },
      ],
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
      placeholder: "<!-- Definis trois colonnes egales -->",
      narrator:
        "Notre carte a besoin de trois colonnes egales. Definis-les avec grid-template-columns en utilisant l'unite fr.",
      hint: "Ajoute a .grid : grid-template-columns: 1fr 1fr 1fr;",
      briefing: {
        title: "Definir les colonnes",
        content: `
### grid-template-columns
Decrit le nombre **et** la taille des colonnes.

### Syntaxe
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`}\`

Cette ligne signifie : 3 colonnes egales.

### L'unite fr (fraction)
- **1fr** = une part de l'espace disponible.
- \`1fr 1fr\` = deux colonnes egales.
- \`2fr 1fr\` = la premiere fait 2x la taille de la deuxieme.

### Variantes utiles
- \`200px 1fr\` : sidebar fixe + contenu flexible.
- \`repeat(3, 1fr)\` : raccourci pour \`1fr 1fr 1fr\`.

**A retenir :** \`fr\` est l'unite native de Grid, parfaite pour repartir l'espace.
        `,
      },
      objectives: [
        { id: "o2a", label: "Definir grid-template-columns" },
        { id: "o2b", label: "Utiliser au moins 3 colonnes" },
      ],
      missionIcon: "🟫",
      missionTag: "PROTOCOLE 02",
      missionTtl: "TRACER LES COLONNES",
      bannerIcon: "📐",
      bannerTtl: "GRILLE STRUCTUREE",
      bannerSub: "Les colonnes sont definies — la carte prend forme.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid {\n        background-color: #0a1322;\n        padding: 12px;\n        display: grid;\n        grid-template-columns: 1fr 1fr 1fr;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Espace les cellules avec gap -->",
      narrator:
        "Les cellules sont collees. Comme en Flexbox, gap fonctionne aussi en Grid pour espacer lignes et colonnes.",
      hint: "Ajoute a .grid : gap: 12px;",
      briefing: {
        title: "gap, encore et toujours",
        content: `
### Reutilisation de gap
La meme propriete **gap** fonctionne en Grid comme en Flexbox.

### Exemple simple
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`  gap: 12px;\`
\`}\`

### Differencier vertical/horizontal
- \`gap: 12px;\` -> 12px partout.
- \`gap: 16px 8px;\` -> 16px **vertical** (entre lignes), 8px **horizontal** (entre colonnes).
- Aliases : \`row-gap: 16px\` et \`column-gap: 8px\`.

**A retenir :** gap remplace les vieux hacks de marges negatives pour espacer une grille.
        `,
      },
      objectives: [
        { id: "o3a", label: "Appliquer gap sur .grid" },
      ],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 03",
      missionTtl: "AERER LA CARTE",
      bannerIcon: "🛰",
      bannerTtl: "CELLULES SEPAREES",
      bannerSub: "La grille est lisible, chaque secteur est identifiable.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Grid</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .cell { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; text-align: center; }\n      .grid {\n        background-color: #0a1322;\n        padding: 12px;\n        display: grid;\n        grid-template-columns: 1fr 1fr 1fr;\n        gap: 12px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="cell">A1</div>\n      <div class="cell">A2</div>\n      <div class="cell">A3</div>\n      <div class="cell">B1</div>\n      <div class="cell">B2</div>\n      <div class="cell">B3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Definis aussi la hauteur de chaque ligne -->",
      narrator:
        "Pour terminer la cartographie, fixe la hauteur des lignes avec grid-template-rows. La grille devient totalement maitrisee.",
      hint: "Ajoute a .grid : grid-template-rows: 100px 100px;",
      briefing: {
        title: "Definir les lignes",
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

Cette config cree une grille 3 colonnes x 2 lignes, chaque ligne faisant 100px de haut.

### Auto vs explicite
- Tu peux ecrire \`grid-template-rows: auto auto;\` (le navigateur calcule la hauteur).
- \`100px 1fr\` : premiere ligne fixe, deuxieme prend l'espace restant.

### Felicitations
Tu maitrises maintenant les fondations de CSS : selecteurs, box model, Flexbox et Grid. La suite (responsive, animations, Tailwind) viendra dans les cursus suivants.

**Mission finale :** la station est habillee — pret pour la suite de l'aventure.
        `,
      },
      objectives: [
        { id: "o4a", label: "Definir grid-template-rows" },
      ],
      missionIcon: "🌌",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FIXER LES LIGNES",
      bannerIcon: "🏁",
      bannerTtl: "CARTE COMPLETE",
      bannerSub:
        "La cartographie tactique est operationnelle. Cursus CSS termine.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
