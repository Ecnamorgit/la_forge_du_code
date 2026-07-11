import type { ChapterData } from "@/data/courses/html/types";

export const chapitre3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : MODULES PRESSURISES",
  title: "MODULES\n& DIMENSIONS",
  subtitle: "Comprends le modele de boite (box model)",
  totalXp: 200,
  completionBadge: "📦",
  completionBadgeLabel: "INGENIEUR MODULAIRE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module { background-color: cyan; color: black; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n  </body>\n</html>',
      placeholder: "<!-- Donne une largeur et une hauteur a .module -->",
      narrator:
        "Chaque module de la station occupe une place précise. Donne des dimensions à notre .module pour réserver son espace.",
      hint: "Ajoute : .module { width: 200px; height: 100px; }",
      briefing: {
        title: "Largeur et hauteur",
        content: `
### Les propriétés width et height
- **width** : la largeur de l'élément.
- **height** : la hauteur de l'élément.

### Exemple
\`.module {\`
\`  width: 200px;\`
\`  height: 100px;\`
\`}\`

### Quelques unités
- **px** : pixels (mesure fixe).
- **%** : pourcentage du parent (\`width: 50%\`).
- **rem** : relatif à la taille de base (1rem = 16px par défaut).

### Le modèle de boîte
Chaque élément HTML est une **boîte** rectangulaire. Width et height définissent la zone de **contenu** de cette boîte.

**Note :** sans width/height, le navigateur calcule lui-même l'espace selon le contenu.
        `,
      },
      objectives: [
        { id: "o1a", label: "Définir une width" },
        { id: "o1b", label: "Définir une height" },
      ],
      missionIcon: "📏",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CALIBRER LE MODULE",
      bannerIcon: "📐",
      bannerTtl: "DIMENSIONS FIXÉES",
      bannerSub: "Le module occupe l'espace prévu sur la coque.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute du padding pour aérer le texte -->",
      narrator:
        "Le contenu colle aux bords du module. Ajoute du padding pour créer un espace de respiration intérieur.",
      hint: "Ajoute : .module { padding: 20px; }",
      briefing: {
        title: "Le padding : espace intérieur",
        content: `
### Définition
Le **padding** est l'espace **entre le contenu et le bord** de la boîte. Imagine la marge interne d'un tableau autour d'une photo.

### Exemple
\`.module {\`
\`  padding: 20px;\`
\`}\`

### Plusieurs valeurs
- \`padding: 20px;\` -> 20px partout.
- \`padding: 10px 20px;\` -> 10px haut/bas, 20px gauche/droite.
- \`padding: 10px 20px 5px 15px;\` -> haut, droite, bas, gauche (sens horaire).

### Propriétés détaillées
\`padding-top\`, \`padding-right\`, \`padding-bottom\`, \`padding-left\`.

**Attention :** le padding s'ajoute aux dimensions par défaut, ce qui rend la boîte plus grande. On verra comment régler ça à l'étape suivante.
        `,
      },
      objectives: [
        { id: "o2a", label: "Appliquer du padding sur .module" },
      ],
      missionIcon: "🧱",
      missionTag: "PROTOCOLE 02",
      missionTtl: "AÉRER LE MODULE",
      bannerIcon: "🫧",
      bannerTtl: "ESPACE INTÉRIEUR",
      bannerSub: "Le contenu respire à l'intérieur du module.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n        padding: 20px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n    <div class="module">Module Bravo</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute du margin pour séparer les modules -->",
      narrator:
        "Les deux modules sont collés. Ajoute du margin pour créer un espace **extérieur** entre eux.",
      hint: "Ajoute : .module { margin: 10px; }",
      briefing: {
        title: "Le margin : espace extérieur",
        content: `
### Définition
Le **margin** est l'espace **autour de la boîte**, qui la sépare des autres éléments.

### Padding vs Margin
- **padding** : espace **à l'intérieur** de la boîte (entre contenu et bord).
- **margin** : espace **à l'extérieur** de la boîte (entre boîte et voisins).

### Exemple
\`.module {\`
\`  margin: 10px;\`
\`}\`

### Syntaxe identique au padding
- \`margin: 10px;\` partout.
- \`margin: 10px 20px;\` haut/bas, gauche/droite.
- \`margin: 10px auto;\` centrer horizontalement (auto = à gauche et à droite égaux).

**Astuce centrale :** \`margin: 0 auto;\` est l'astuce historique pour centrer une boîte de largeur fixe.
        `,
      },
      objectives: [
        { id: "o3a", label: "Appliquer du margin sur .module" },
      ],
      missionIcon: "↔",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SÉPARER LES MODULES",
      bannerIcon: "🛰",
      bannerTtl: "ESPACEMENT RÉUSSI",
      bannerSub: "Les modules ne se touchent plus.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n        padding: 20px;\n        margin: 10px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n    <div class="module">Module Bravo</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une bordure visible autour de .module -->",
      narrator:
        "Pour délimiter clairement chaque module, ajoute une bordure visible avec border.",
      hint: "Ajoute : .module { border: 2px solid orange; }",
      briefing: {
        title: "La bordure : délimiter la boîte",
        content: `
### La propriété border (raccourcie)
Trois valeurs sur une seule ligne :
\`border: épaisseur style couleur;\`

### Exemple
\`.module {\`
\`  border: 2px solid orange;\`
\`}\`

### Les styles disponibles
- **solid** : trait plein.
- **dashed** : pointillé.
- **dotted** : points.
- **double** : double trait.
- **none** : aucune bordure.

### Box model complet
De l'intérieur vers l'extérieur :
1. **content** (width x height)
2. **padding**
3. **border**
4. **margin**

**À retenir :** \`box-sizing: border-box;\` (à explorer plus tard) inclut le padding et la border dans la width. Sans, ils s'ajoutent.
        `,
      },
      objectives: [
        { id: "o4a", label: "Appliquer une bordure sur .module" },
        { id: "o4b", label: "Choisir un style (solid, dashed...) et une couleur" },
      ],
      missionIcon: "🟧",
      missionTag: "PROTOCOLE 04",
      missionTtl: "DÉLIMITER LE PERIMÈTRE",
      bannerIcon: "🔲",
      bannerTtl: "MODULE COMPLET",
      bannerSub:
        "Chaque module est calibré, espaçé et identifiable.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};