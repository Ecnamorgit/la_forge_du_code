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
        "Chaque module de la station occupe une place precise. Donne des dimensions a notre .module pour reserver son espace.",
      hint: "Ajoute : .module { width: 200px; height: 100px; }",
      briefing: {
        title: "Largeur et hauteur",
        content: `
### Les proprietes width et height
- **width** : la largeur de l'element.
- **height** : la hauteur de l'element.

### Exemple
\`.module {\`
\`  width: 200px;\`
\`  height: 100px;\`
\`}\`

### Quelques unites
- **px** : pixels (mesure fixe).
- **%** : pourcentage du parent (\`width: 50%\`).
- **rem** : relatif a la taille de base (1rem = 16px par defaut).

### Le modele de boite
Chaque element HTML est une **boite** rectangulaire. Width et height definissent la zone de **contenu** de cette boite.

**Note :** sans width/height, le navigateur calcule lui-meme l'espace selon le contenu.
        `,
      },
      objectives: [
        { id: "o1a", label: "Definir une width" },
        { id: "o1b", label: "Definir une height" },
      ],
      missionIcon: "📏",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CALIBRER LE MODULE",
      bannerIcon: "📐",
      bannerTtl: "DIMENSIONS FIXEES",
      bannerSub: "Le module occupe l'espace prevu sur la coque.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute du padding pour aerer le texte -->",
      narrator:
        "Le contenu colle aux bords du module. Ajoute du padding pour creer un espace de respiration interieur.",
      hint: "Ajoute : .module { padding: 20px; }",
      briefing: {
        title: "Le padding : espace interieur",
        content: `
### Definition
Le **padding** est l'espace **entre le contenu et le bord** de la boite. Imagine la marge interieure d'un tableau autour d'une photo.

### Exemple
\`.module {\`
\`  padding: 20px;\`
\`}\`

### Plusieurs valeurs
- \`padding: 20px;\` -> 20px partout.
- \`padding: 10px 20px;\` -> 10px haut/bas, 20px gauche/droite.
- \`padding: 10px 20px 5px 15px;\` -> haut, droite, bas, gauche (sens horaire).

### Proprietes detaillees
\`padding-top\`, \`padding-right\`, \`padding-bottom\`, \`padding-left\`.

**Attention :** le padding s'ajoute aux dimensions par defaut, ce qui rend la boite plus grande. On verra comment regler ca a l'etape suivante.
        `,
      },
      objectives: [
        { id: "o2a", label: "Appliquer du padding sur .module" },
      ],
      missionIcon: "🧱",
      missionTag: "PROTOCOLE 02",
      missionTtl: "AERER LE MODULE",
      bannerIcon: "🫧",
      bannerTtl: "ESPACE INTERIEUR",
      bannerSub: "Le contenu respire a l'interieur du module.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n        padding: 20px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n    <div class="module">Module Bravo</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute du margin pour separer les modules -->",
      narrator:
        "Les deux modules sont colles. Ajoute du margin pour creer un espace **exterieur** entre eux.",
      hint: "Ajoute : .module { margin: 10px; }",
      briefing: {
        title: "Le margin : espace exterieur",
        content: `
### Definition
Le **margin** est l'espace **autour de la boite**, qui la separe des autres elements.

### Padding vs Margin
- **padding** : espace **a l'interieur** de la boite (entre contenu et bord).
- **margin** : espace **a l'exterieur** de la boite (entre boite et voisins).

### Exemple
\`.module {\`
\`  margin: 10px;\`
\`}\`

### Syntaxe identique au padding
- \`margin: 10px;\` partout.
- \`margin: 10px 20px;\` haut/bas, gauche/droite.
- \`margin: 10px auto;\` centrer horizontalement (auto = a gauche et a droite egales).

**Astuce centrale :** \`margin: 0 auto;\` est l'astuce historique pour centrer une boite de largeur fixe.
        `,
      },
      objectives: [
        { id: "o3a", label: "Appliquer du margin sur .module" },
      ],
      missionIcon: "↔",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SEPARER LES MODULES",
      bannerIcon: "🛰",
      bannerTtl: "ESPACEMENT REUSSI",
      bannerSub: "Les modules ne se touchent plus.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Modules</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .module {\n        background-color: cyan;\n        color: black;\n        width: 200px;\n        height: 100px;\n        padding: 20px;\n        margin: 10px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="module">Module Alpha</div>\n    <div class="module">Module Bravo</div>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une bordure visible autour de .module -->",
      narrator:
        "Pour delimiter clairement chaque module, ajoute une bordure visible avec border.",
      hint: "Ajoute : .module { border: 2px solid orange; }",
      briefing: {
        title: "La bordure : delimiter la boite",
        content: `
### La propriete border (raccourcie)
Trois valeurs sur une seule ligne :
\`border: epaisseur style couleur;\`

### Exemple
\`.module {\`
\`  border: 2px solid orange;\`
\`}\`

### Les styles disponibles
- **solid** : trait plein.
- **dashed** : pointille.
- **dotted** : points.
- **double** : double trait.
- **none** : aucune bordure.

### Box model complet
De l'interieur vers l'exterieur :
1. **content** (width x height)
2. **padding**
3. **border**
4. **margin**

**A retenir :** \`box-sizing: border-box;\` (a explorer plus tard) inclut le padding et la border dans la width. Sans, ils s'ajoutent.
        `,
      },
      objectives: [
        { id: "o4a", label: "Appliquer une border sur .module" },
        { id: "o4b", label: "Choisir un style (solid, dashed...) et une couleur" },
      ],
      missionIcon: "🟧",
      missionTag: "PROTOCOLE 04",
      missionTtl: "DELIMITER LE PERIMETRE",
      bannerIcon: "🔲",
      bannerTtl: "MODULE COMPLET",
      bannerSub:
        "Chaque module est calibre, espace et identifiable.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
