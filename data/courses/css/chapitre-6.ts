import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : POSITIONNEMENT ORBITAL",
  title: "ANCRAGE\nORBITAL",
  subtitle: "Verrouille tes éléments en relative, absolute, fixed et sticky",
  totalXp: 250,
  completionBadge: "🧲",
  completionBadgeLabel: "VERROUILLEUR ORBITAL",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 40px; }\n      .box { background: #00b8d4; color: black; padding: 20px; width: 200px; }\n      .badge { background: #ff6b2c; color: white; padding: 6px 12px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="box">\n      Module principal\n      <div class="badge">Nouveau</div>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Déplace le badge avec position: relative */",
      narrator:
        "Le badge est collé au texte. Déplace-le légèrement vers le bas et la droite sans casser la mise en page autour en utilisant position: relative.",
      hint: "Ajoute à .badge : position: relative; top: 10px; left: 20px;",
      briefing: {
        title: "position: relative",
        content: `
*« Parfois il faut décaler un module sans bousculer ses voisins. \`position: relative\` le déplace en gardant sa place dans le flux — chirurgie, pas démolition. »* — **Kira**

### Quatre positionnements
CSS propose 4 valeurs principales de **position** : **static** (par défaut), **relative**, **absolute**, **fixed**, et une 5ème : **sticky**.

### relative
L'élément **reste dans le flux** (les autres éléments gardent leur place), mais on peut le **déplacer** avec **top**, **right**, **bottom**, **left**.

\`.badge {\`
\`  position: relative;\`
\`  top: 10px;\`
\`  left: 20px;\`
\`}\`

### Différence avec margin
- **margin** : pousse l'élément ET tous les voisins.
- **position: relative + top/left** : déplace visuellement, le voisin ne bouge pas.

### Quand l'utiliser ?
- Pour un mini-ajustement visuel.
- Surtout : pour servir de **référence** à un enfant en absolute (cf. étape suivante).

**Réflexe :** "relative seul" est rarement utile. On le pose souvent comme **parent positionné** pour les enfants absolus.
        `,
      },
      objectives: [
        { id: "o1a", label: "Définir position: relative sur .badge" },
        { id: "o1b", label: "Ajouter top et left non nuls" },
      ],
      docRefs: ["css/position"],
      missionIcon: "📍",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DÉPLACEMENT RELATIF",
      bannerIcon: "📍",
      bannerTtl: "POSITIONNEMENT FINI",
      bannerSub: "Le badge est déplacé sans casser le flux.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 40px; }\n      .card { background: #0a1322; padding: 30px; width: 300px; }\n      .ribbon { background: #00ff88; color: black; padding: 4px 12px; font-weight: bold; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="card">\n      <div class="ribbon">PROMO</div>\n      Contenu de la carte\n    </div>\n  </body>\n</html>',
      placeholder: "/* Ancre le ruban en haut à droite de .card */",
      narrator:
        "Le ruban PROMO doit se placer dans le coin haut-droit de la carte, en superposition. Utilise position: absolute en faisant de .card un parent positionné avec position: relative.",
      hint: "Ajoute à .card : position: relative; et à .ribbon : position: absolute; top: 0; right: 0;",
      briefing: {
        title: "position: absolute",
        content: `
### absolute = retire du flux
Un élément **absolu** est **arraché** du flux du document. Les autres éléments se comportent comme s'il n'existait pas.

### Référence de position
absolu se positionne par rapport au **plus proche ancêtre positionné** (relative, absolute, fixed, sticky). S'il n'y en a aucun, c'est par rapport au viewport.

### Pattern classique
\`.parent { position: relative; }   /* point d'ancrage */\`
\`.child { position: absolute; top: 0; right: 0; }   /* enfant ancré */\`

### Cas d'utilisation
- Badge / ruban dans un coin de carte.
- Tooltip près d'un élément.
- Modal centrée sur la fenêtre.
- Icône de fermeture (X) en haut à droite d'une boîte.

**Astuce :** si le parent n'a pas position: relative, l'absolu "remonte" jusqu'à trouver un ancêtre positionné — souvent <body>. C'est la cause #1 des bugs "mon truc est mal placé".
        `,
      },
      objectives: [
        { id: "o2a", label: "Faire de .card un parent positionné" },
        { id: "o2b", label: "Ancrer .ribbon en absolute dans un coin" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ANCRAGE ABSOLU",
      bannerIcon: "🎯",
      bannerTtl: "ENFANT VERROUILÉ",
      bannerSub: "Le ruban est ancré au coin de sa carte parente.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 0; }\n      .topbar { background: #00b8d4; color: black; padding: 12px; text-align: center; }\n      .content { padding: 20px; min-height: 1500px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="topbar">Barre de mission</div>\n    <div class="content">Contenu très long...</div>\n  </body>\n</html>',
      placeholder: "/* Fixe la topbar en haut du viewport quand on scroll */",
      narrator:
        "La barre de mission doit rester visible même quand l'utilisateur scrolle. Utilise position: fixed pour la fixer en haut du viewport.",
      hint: "Ajoute à .topbar : position: fixed; top: 0; left: 0; right: 0;",
      briefing: {
        title: "position: fixed",
        content: `
### fixed = ancré au viewport
**fixed** retire l'élément du flux ET l'ancre au **viewport** (la fenêtre du navigateur). Il reste visible même quand on scrolle.

### Pattern barre fixe
\`.topbar {\`
\`  position: fixed;\`
\`  top: 0;\`
\`  left: 0;\`
\`  right: 0;\`
\`}\`

### Différence clé vs absolute
- **absolute** se cale sur un parent positionné (qui scrolle).
- **fixed** se cale sur le **viewport** (qui ne scrolle jamais).

### Cas d'utilisation
- Header / nav qui reste en haut.
- Bouton "Retour en haut" en bas à droite.
- Bandeau de notification persistant.
- Modal en plein écran (avec overlay).

### Attention
- Le contenu derrière la barre fixed est caché. **Ajoute du padding-top sur <body>** équivalent à la hauteur de la barre pour ne pas masquer le début du contenu.

**À retenir :** fixed = "épingle au navigateur".
        `,
      },
      objectives: [
        { id: "o3a", label: "Définir position: fixed sur .topbar" },
        { id: "o3b", label: "Ancrer top: 0 (et idéalement left/right)" },
      ],
      missionIcon: "📌",
      missionTag: "PROTOCOLE 03",
      missionTtl: "BARRE FIXE",
      bannerIcon: "📌",
      bannerTtl: "BARRE VERROUILÉE",
      bannerSub: "La barre reste visible même en scrolant.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 0; }\n      .section { padding: 40px; min-height: 600px; }\n      .section-title { background: #ff6b2c; color: black; padding: 8px 16px; font-weight: bold; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="section">\n      <div class="section-title">Section A</div>\n      <p>Contenu A très long...</p>\n    </div>\n    <div class="section">\n      <div class="section-title">Section B</div>\n      <p>Contenu B très long...</p>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Rend les titres de section sticky en haut */",
      narrator:
        "Les titres de section doivent rester visibles tant qu'on est dans leur section, puis disparaître quand la suivante arrive. C'est le comportement sticky.",
      hint: "Ajoute à .section-title : position: sticky; top: 0;",
      briefing: {
        title: "position: sticky",
        content: `
### Le meilleur des deux mondes
**sticky** se comporte comme **relative** quand l'élément est dans sa zone de scroll normal, puis se transforme en **fixed** quand il atteint sa position de seuil.

### Syntaxe
\`.section-title {\`
\`  position: sticky;\`
\`  top: 0;\`
\`}\`

### Comment ça marche ?
1. Tant que la section parente est visible dans le viewport, le titre défile normalement.
2. Quand le scroll atteint le titre, il **se colle** en haut (top: 0).
3. Quand on quitte la section, le titre **part avec elle** (contrairement à fixed qui resterait).

### Cas d'utilisation
- Headers de section (style iOS contacts).
- Sidebars qui suivent le scroll dans un article.
- Tableaux avec en-tête persistant.

### Piège classique
sticky **ne marche pas** si :
- Un parent a **overflow: hidden** ou **overflow: scroll** (le sticky se colle à CE parent, pas au viewport).
- L'élément n'a pas de **top/bottom** défini.

**Astuce :** debug en regardant les overflows des ancêtres. C'est presque toujours ça.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir position: sticky sur .section-title" },
        { id: "o4b", label: "Ajouter top: 0 (ou autre valeur d'ancrage)" },
      ],
      missionIcon: "🧷",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ANCRAGE STICKY",
      bannerIcon: "🧷",
      bannerTtl: "POSITIONNEMENT MASTRISE",
      bannerSub: "Tu maîtrises relative, absolute, fixed et sticky.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};