import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : ADAPTATION MULTI-ECRAN",
  title: "RESPONSIVE\nDESIGN",
  subtitle: "Adapte ton design pour les terminaux mobiles et les écrans de la passerelle",
  totalXp: 260,
  completionBadge: "📱",
  completionBadgeLabel: "INGENIEUR ADAPTATIF",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .container { width: 800px; background: #0a1322; padding: 20px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">Vaisseau de commande</div>\n  </body>\n</html>',
      placeholder: "/* Remplace 800px par max-width: 800px pour rester responsive */",
      narrator:
        "La largeur fixe de 800px déborde sur les écrans plus petits. Remplace width par max-width pour que le conteneur s'adapte à la demande mais ne dépasse pas 800px.",
      hint: "Sur .container : utilise max-width: 800px; width: 100%;",
      briefing: {
        title: "max-width vs width",
        content: `
*« Un écran de passerelle et un terminal de poche n'ont pas la même taille. \`max-width\` + \`width: 100%\` : ton dock s'adapte au lieu de déborder. »* — **Kira**

### Le problème de width fixe
\`.container { width: 800px; }\`
Sur un mobile de 375px, le conteneur déborde à droite. L'utilisateur doit scroller horizontalement — pire expérience web qui soit.

### La solution
\`.container { max-width: 800px; width: 100%; }\`
- **max-width** : ne dépasse PAS 800px sur grand écran.
- **width: 100%** : occupe tout l'espace disponible sur petit écran.

### Pattern centre + responsive
\`.container {\`
\`  max-width: 800px;\`
\`  width: 100%;\`
\`  margin: 0 auto;     /* centrage horizontal */\`
\`  padding: 0 16px;    /* respiration sur les bords */\`
\`  box-sizing: border-box;\`
\`}\`

### Réflexe responsive
- **Éviter width fixe**.
- Préférer **max-width** ou unités relatives (%, vw).
- Tester en redimensionnant la fenêtre.

**A retenir :** "responsive" commence avant les media queries. Ce sont les unités fluides qui font 80 % du travail.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser max-width sur .container" },
        { id: "o1b", label: "Éviter width: 800px en dur" },
      ],
      missionIcon: "📏",
      missionTag: "PROTOCOLE 01",
      missionTtl: "LARGEURS FLUIDES",
      bannerIcon: "📏",
      bannerTtl: "FLUIDITE ACTIVE",
      bannerSub: "Le conteneur s'adapte aux écrans étroits.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      h1 { font-size: 32px; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commandement</h1>\n  </body>\n</html>',
      placeholder: "/* Reduis font-size de h1 sur ecran < 600px via @media */",
      narrator:
        "32px est parfait sur desktop mais écrasant sur mobile. Utilise une media query @media (max-width: 600px) pour réduire le titre à 22px sur petit écran.",
      hint: "Ajoute : @media (max-width: 600px) { h1 { font-size: 22px; } }",
      briefing: {
        title: "Les media queries",
        content: `
### Syntaxe
\`@media (max-width: 600px) {\`
\`  h1 { font-size: 22px; }\`
\`}\`

### Comment ça marche
- Le navigateur applique le bloc **seulement si la condition est vraie**.
- **max-width: 600px** = "si la fenêtre fait moins de 600px de large".
- **min-width: 1024px** = "si la fenêtre fait au moins 1024px".

### Approche mobile-first (recommandée)
Au lieu de partir desktop puis "réduire", on part mobile puis on agrandit :

\`/* base : mobile */\`
\`h1 { font-size: 22px; }\`

\`/* tablette et plus */\`
\`@media (min-width: 768px) {\`
\`  h1 { font-size: 28px; }\`
\`}\`

\`/* desktop */\`
\`@media (min-width: 1024px) {\`
\`  h1 { font-size: 36px; }\`
\`}\`

### Breakpoints typiques
- **640px** : mobile -> tablette
- **768px** : tablette portrait
- **1024px** : tablette paysage / desktop
- **1280px** : grand desktop

**A retenir :** une bonne page n'a souvent que **2 ou 3 breakpoints**. Pas un par device.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une @media (max-width: ...)" },
        { id: "o2b", label: "Redéfinir font-size de h1 à l'intérieur" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 02",
      missionTtl: "POINTS DE RUPTURE",
      bannerIcon: "📐",
      bannerTtl: "TYPOGRAPHIE ADAPTATIVE",
      bannerSub: "Le titre se redimensionne selon l'écran.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 20px; }\n      .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }\n      .card { background: #00b8d4; color: black; padding: 20px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="card">A</div>\n      <div class="card">B</div>\n      <div class="card">C</div>\n      <div class="card">D</div>\n      <div class="card">E</div>\n      <div class="card">F</div>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Passe la grille à 1 colonne sous 640px */",
      narrator:
        "Trois colonnes en mobile, c'est illisible (chaque carte fait ~110px). Bascule la grille en une seule colonne sous 640px.",
      hint: "Ajoute : @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }",
      briefing: {
        title: "Adapter une grille",
        content: `
### Pattern responsive grid
Sur desktop : 3 colonnes. Sur mobile : 1 colonne. Une simple media query suffit.

\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: 1fr 1fr 1fr;\`
\`  gap: 12px;\`
\`}\`

\`@media (max-width: 640px) {\`
\`  .grid { grid-template-columns: 1fr; }\`
\`}\`

### Variante "auto-fit"
Pour un comportement totalement automatique sans media query :
\`.grid {\`
\`  display: grid;\`
\`  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\`
\`  gap: 12px;\`
\`}\`
Le navigateur crée autant de colonnes que possible, chaque colonne mesurant au moins 200px.

### Quand choisir quoi
- **Media queries** : contrôle fin, breakpoints précis.
- **auto-fit** : un seul layout qui marche partout.

**Astuce :** combine les deux. auto-fit pour la base, media queries pour les ajustements précis (gap, padding).
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une @media (max-width: 640px) ou similaire" },
        { id: "o3b", label: "Réduire grid-template-columns à 1fr" },
      ],
      missionIcon: "🔲",
      missionTag: "PROTOCOLE 03",
      missionTtl: "GRILLE ADAPTATIVE",
      bannerIcon: "🔲",
      bannerTtl: "DISPOSITION RECONFIGURÉE",
      bannerSub: "La grille passe de 3 à 1 colonne sur mobile.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 20px; }\n      h1 { font-size: 32px; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Titre adaptatif</h1>\n  </body>\n</html>',
      placeholder: "/* Utilise clamp() pour un font-size totalement fluide */",
      narrator:
        "Plutôt que des breakpoints brutaux, fais varier la taille du titre de manière fluide entre 22px et 48px selon la largeur de fenêtre avec clamp().",
      hint: "Remplace par : h1 { font-size: clamp(22px, 4vw, 48px); }",
      briefing: {
        title: "Unités fluides et clamp()",
        content: `
### Le problème des breakpoints
Entre les breakpoints, la taille saute (22px -> 28px d'un coup). Pas très élégant.

### clamp(min, ideal, max)
**clamp()** retourne une valeur "coincée" entre min et max, calculée selon la valeur idéale.

\`h1 { font-size: clamp(22px, 4vw, 48px); }\`

### Comment ça marche
- **22px** : taille minimale (mobile étroit).
- **4vw** : taille idéale = 4 % de la largeur de fenêtre.
- **48px** : taille maximale (grand écran).

### Sur différents écrans
- 375px de large : 4vw = 15px, donc clamp prend **22px** (le min).
- 1000px : 4vw = 40px, clamp prend **40px** (idéal).
- 2000px : 4vw = 80px, clamp prend **48px** (le max).

### Cas d'utilisation
- Tailles de texte fluides.
- Paddings/margins qui scalent avec l'écran.
- Tailles d'icônes.

### Unités de viewport
- **vw** : 1 % de la largeur de fenêtre.
- **vh** : 1 % de la hauteur.
- **vmin** / **vmax** : la plus petite/grande des deux.

**A retenir :** clamp + vw, c'est le **responsive moderne** sans media query.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser clamp() pour font-size de h1" },
        { id: "o4b", label: "Inclure une unité de viewport (vw)" },
      ],
      missionIcon: "🌊",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FLUIDITE TOTALE",
      bannerIcon: "🌊",
      bannerTtl: "TYPOGRAPHIE FLUIDE",
      bannerSub: "Le titre s'adapte continuellement sans saut visible.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};