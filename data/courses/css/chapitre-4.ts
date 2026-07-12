import type { ChapterData } from "@/data/courses/html/types";

export const chapitre4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : FORMATION DE VOL",
  title: "ASSEMBLAGE\nEN FORMATION",
  subtitle: "Aligne les modules avec Flexbox",
  totalXp: 250,
  completionBadge: "🛸",
  completionBadgeLabel: "PILOTE DE FORMATION",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Flexbox</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .item { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; }\n      .container { background-color: #0a1322; padding: 12px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="item">Vaisseau 1</div>\n      <div class="item">Vaisseau 2</div>\n      <div class="item">Vaisseau 3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Active flexbox sur .container -->",
      narrator:
        "Les vaisseaux sont empiles verticalement par défaut. Activez Flexbox sur le conteneur pour les aligner côte à côte, en formation.",
      hint: "Ajoutez : .container { display: flex; }",
      briefing: {
        title: "Activer Flexbox",
        content: `
*« Des vaisseaux empilés en pagaille ne décollent pas. \`display: flex\` sur le hangar, et l'escadrille s'aligne. Tu commandes le parent, il range les enfants. »* — **Kira**

### Flexbox, c'est quoi ?
Un système pour **disposer** plusieurs éléments en ligne ou en colonne avec un contrôle précis de l'alignement et de l'espacement.

### L'activation
\`.container {\`
\`  display: flex;\`
\`}\`

### Effet immédiat
Les **enfants directs** du conteneur (.item) deviennent des **flex items** et s'alignent **horizontalement** par défaut.

### Vocabulaire
- **flex container** : l'élément avec display: flex.
- **flex item** : ses enfants directs.
- **axe principal** : sens dans lequel les items s'alignent (par défaut horizontal).

**Réflexe :** Flexbox se déclare sur le **parent**, mais affecte ses **enfants**.
        `,
      },
      objectives: [
        { id: "o1a", label: "Activer display: flex sur .container" },
      ],
      missionIcon: "🛬",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DEPLOIEMENT EN LIGNE",
      bannerIcon: "🟦",
      bannerTtl: "FORMATION HORIZONTALE",
      bannerSub: "Les trois vaisseaux sont alignés sur la même ligne.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Flexbox</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .item { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; }\n      .container { background-color: #0a1322; padding: 12px; display: flex; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="item">Vaisseau 1</div>\n      <div class="item">Vaisseau 2</div>\n      <div class="item">Vaisseau 3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Repartis les items avec justify-content -->",
      narrator:
        "Les vaisseaux sont en ligne mais collés à gauche. Utilisez justify-content pour les distribuer le long de l'axe principal.",
      hint: "Ajoutez à .container : justify-content: space-between; (ou center, space-around...)",
      briefing: {
        title: "Distribuer sur l'axe principal",
        content: `
### justify-content
Répartit les items le long de l'**axe principal** (horizontal par défaut).

### Valeurs courantes
- **flex-start** : tout à gauche (défaut).
- **center** : centre l'ensemble.
- **flex-end** : tout à droite.
- **space-between** : extrémités collées aux bords, espace égal entre.
- **space-around** : espace égal autour de chaque item.
- **space-evenly** : même espace partout, y compris aux extrémités.

### Exemple
\`.container {\`
\`  display: flex;\`
\`  justify-content: space-between;\`
\`}\`

**Astuce :** \`justify-content\` contrôle l'**axe principal**. L'axe perpendiculaire se gère avec **align-items** (étape suivante).
        `,
      },
      objectives: [
        { id: "o2a", label: "Appliquer justify-content sur .container" },
      ],
      missionIcon: "📏",
      missionTag: "PROTOCOLE 02",
      missionTtl: "REPARTIR LA FLOTTE",
      bannerIcon: "⚖",
      bannerTtl: "FORMATION EQUILIBRÉE",
      bannerSub: "Les vaisseaux sont espacés selon le plan tactique.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Flexbox</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .item { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; }\n      .container {\n        background-color: #0a1322;\n        padding: 12px;\n        display: flex;\n        justify-content: space-between;\n        height: 200px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="item">Petit</div>\n      <div class="item">Vaisseau moyen</div>\n      <div class="item">Module XL plus grand</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Aligne verticalement avec align-items -->",
      narrator:
        "Les modules ont des hauteurs différentes. Utilisez align-items pour les centrer verticalement dans la formation.",
      hint: "Ajoutez à .container : align-items: center;",
      briefing: {
        title: "Aligner sur l'axe perpendiculaire",
        content: `
### align-items
Aligne les items sur l'**axe perpendiculaire** à l'axe principal (vertical par défaut).

### Valeurs courantes
- **stretch** : étire les items pour qu'ils remplissent la hauteur (défaut).
- **flex-start** : aligne en haut.
- **center** : centre verticalement.
- **flex-end** : aligne en bas.
- **baseline** : aligne sur la base typographique.

### Exemple
\`.container {\`
\`  display: flex;\`
\`  align-items: center;\`
\`}\`

### Combo magique
**justify-content: center + align-items: center** = centrage parfait au milieu du conteneur.

**Réflexe :** *justify* = principal, *align* = perpendiculaire.
        `,
      },
      objectives: [
        { id: "o3a", label: "Appliquer align-items sur .container" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ALIGNEMENT VERTICAL",
      bannerIcon: "🪐",
      bannerTtl: "FORMATION CENTRÉE",
      bannerSub:
        "La flotte est centrée, peu importe la taille des vaisseaux.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Flexbox</title>\n    <style>\n      body { background-color: #03060d; color: white; font-family: sans-serif; }\n      .item { background-color: cyan; color: black; padding: 16px; border: 2px solid #003a4a; }\n      .container {\n        background-color: #0a1322;\n        padding: 12px;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        height: 200px;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="item">Vaisseau 1</div>\n      <div class="item">Vaisseau 2</div>\n      <div class="item">Vaisseau 3</div>\n    </div>\n  </body>\n</html>',
      placeholder: "<!-- Espace régulièrement les items avec gap -->",
      narrator:
        "Centrés, mais collés entre eux. Insérez du gap pour créer un espacement régulier entre chaque vaisseau, sans toucher au padding.",
      hint: "Ajoutez à .container : gap: 16px;",
      briefing: {
        title: "Espacer avec gap",
        content: `
### La propriété gap
Crée un **espace uniforme** entre les items d'un flex container (ou grid container).

### Exemple
\`.container {\`
\`  display: flex;\`
\`  gap: 16px;\`
\`}\`

### Avantages
- Une seule ligne pour tout espacer.
- Pas besoin d'utiliser margin sur chaque enfant.
- Marche aussi en CSS Grid.

### Variantes
- \`gap: 16px;\` -> même espace partout.
- \`gap: 10px 20px;\` -> 10px en vertical, 20px en horizontal (utile en grid).

**À retenir :** \`gap\` est moderne, simple et la façon recommandée d'espacer les enfants flex/grid.
        `,
      },
      objectives: [
        { id: "o4a", label: "Appliquer gap sur .container" },
      ],
      missionIcon: "↔",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ESPACER LA FORMATION",
      bannerIcon: "✨",
      bannerTtl: "FLOTTE PARFAITE",
      bannerSub:
        "La formation est centrée, espacée et lisible — prêt à partir en mission.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};