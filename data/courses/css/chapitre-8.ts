import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : ADAPTATION MULTI-ECRAN",
  title: "RESPONSIVE\nDESIGN",
  subtitle: "Adapte ta page a tous les ecrans, du mobile au cinema",
  totalXp: 260,
  completionBadge: "📱",
  completionBadgeLabel: "INGENIEUR ADAPTATIF",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .container { width: 800px; background: #0a1322; padding: 20px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="container">Vaisseau de commande</div>\n  </body>\n</html>',
      placeholder: "/* Remplace 800px par max-width: 800px pour rester responsive */",
      narrator:
        "La largeur fixe de 800px deborde sur les ecrans plus petits. Remplace width par max-width pour que le conteneur retrecisse a la demande mais ne depasse pas 800px.",
      hint: "Sur .container : utilise max-width: 800px; width: 100%;",
      briefing: {
        title: "max-width vs width",
        content: `
### Le probleme de width fixe
\`.container { width: 800px; }\`
Sur un mobile de 375px, le conteneur deborde a droite. L'utilisateur doit scroller horizontalement — pire experience web qui soit.

### La solution
\`.container { max-width: 800px; width: 100%; }\`
- **max-width** : ne depasse PAS 800px sur grand ecran.
- **width: 100%** : occupe tout l'espace disponible sur petit ecran.

### Pattern centre + responsive
\`.container {\`
\`  max-width: 800px;\`
\`  width: 100%;\`
\`  margin: 0 auto;     /* centrage horizontal */\`
\`  padding: 0 16px;    /* respiration sur les bords */\`
\`  box-sizing: border-box;\`
\`}\`

### Reflexe responsive
- **Eviter width fixe**.
- Preferer **max-width** ou unites relatives (%, vw).
- Tester en redimensionnant la fenetre.

**A retenir :** "responsive" commence avant les media queries. Ce sont les unites fluides qui font 80 % du travail.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser max-width sur .container" },
        { id: "o1b", label: "Eviter width: 800px en dur" },
      ],
      missionIcon: "📏",
      missionTag: "PROTOCOLE 01",
      missionTtl: "LARGEURS FLUIDES",
      bannerIcon: "📏",
      bannerTtl: "FLUIDITE ACTIVE",
      bannerSub: "Le conteneur s'adapte aux ecrans etroits.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      h1 { font-size: 32px; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commandement</h1>\n  </body>\n</html>',
      placeholder: "/* Reduis font-size de h1 sur ecran < 600px via @media */",
      narrator:
        "32px est parfait sur desktop mais ecrasant sur mobile. Utilise une media query @media (max-width: 600px) pour reduire le titre a 22px sur petit ecran.",
      hint: "Ajoute : @media (max-width: 600px) { h1 { font-size: 22px; } }",
      briefing: {
        title: "Les media queries",
        content: `
### Syntaxe
\`@media (max-width: 600px) {\`
\`  h1 { font-size: 22px; }\`
\`}\`

### Comment ca marche
- Le navigateur applique le bloc **seulement si la condition est vraie**.
- **max-width: 600px** = "si la fenetre fait moins de 600px de large".
- **min-width: 1024px** = "si la fenetre fait au moins 1024px".

### Approche mobile-first (recommandee)
Au lieu de partir desktop puis "reduire", on part mobile puis on agrandit :

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
- **1024px** : tablette landscape / desktop
- **1280px** : grand desktop

**A retenir :** une bonne page n'a souvent que **2 ou 3 breakpoints**. Pas un par device.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une @media (max-width: ...)" },
        { id: "o2b", label: "Redefinir font-size de h1 a l'interieur" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 02",
      missionTtl: "POINTS DE RUPTURE",
      bannerIcon: "📐",
      bannerTtl: "TYPOGRAPHIE ADAPTATIVE",
      bannerSub: "Le titre se redimensionne selon l'ecran.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 20px; }\n      .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }\n      .card { background: #00b8d4; color: black; padding: 20px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="grid">\n      <div class="card">A</div>\n      <div class="card">B</div>\n      <div class="card">C</div>\n      <div class="card">D</div>\n      <div class="card">E</div>\n      <div class="card">F</div>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Passe la grille a 1 colonne sous 640px */",
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
Le navigateur cree autant de colonnes que possible, chaque colonne mesurant au moins 200px.

### Quand choisir quoi
- **Media queries** : controle fin, breakpoints precis.
- **auto-fit** : un seul layout qui marche partout.

**Astuce :** combine les deux. auto-fit pour la base, media queries pour les ajustements precis (gap, padding).
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une @media (max-width: 640px) ou similaire" },
        { id: "o3b", label: "Reduire grid-template-columns a 1fr" },
      ],
      missionIcon: "🔲",
      missionTag: "PROTOCOLE 03",
      missionTtl: "GRILLE ADAPTATIVE",
      bannerIcon: "🔲",
      bannerTtl: "DISPOSITION RECONFIGUREE",
      bannerSub: "La grille passe de 3 a 1 colonne sur mobile.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Responsive</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 20px; }\n      h1 { font-size: 32px; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Titre adaptatif</h1>\n  </body>\n</html>',
      placeholder: "/* Utilise clamp() pour un font-size totalement fluide */",
      narrator:
        "Plutot que des breakpoints brutaux, fais varier la taille du titre de maniere fluide entre 22px et 48px selon la largeur de fenetre avec clamp().",
      hint: "Remplace par : h1 { font-size: clamp(22px, 4vw, 48px); }",
      briefing: {
        title: "Unites fluides et clamp()",
        content: `
### Le probleme des breakpoints
Entre les breakpoints, la taille saute (22px -> 28px d'un coup). Pas tres elegant.

### clamp(min, ideal, max)
**clamp()** retourne une valeur "coincee" entre min et max, calculee selon la valeur ideale.

\`h1 { font-size: clamp(22px, 4vw, 48px); }\`

### Comment ca marche
- **22px** : taille minimale (mobile etroit).
- **4vw** : taille ideale = 4 % de la largeur de fenetre.
- **48px** : taille maximale (grand ecran).

### Sur differents ecrans
- 375px de large : 4vw = 15px, donc clamp prend **22px** (le min).
- 1000px : 4vw = 40px, clamp prend **40px** (ideal).
- 2000px : 4vw = 80px, clamp prend **48px** (le max).

### Cas d'usage
- Tailles de texte fluides.
- Paddings/margins qui scalent avec l'ecran.
- Tailles d'icones.

### Unites de viewport
- **vw** : 1 % de la largeur de fenetre.
- **vh** : 1 % de la hauteur.
- **vmin** / **vmax** : la plus petite/grande des deux.

**A retenir :** clamp + vw, c'est le **responsive moderne** sans media query.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser clamp() pour font-size de h1" },
        { id: "o4b", label: "Inclure une unite de viewport (vw)" },
      ],
      missionIcon: "🌊",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FLUIDITE TOTALE",
      bannerIcon: "🌊",
      bannerTtl: "TYPOGRAPHIE FLUIDE",
      bannerSub: "Le titre s'adapte continument sans saut visible.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
