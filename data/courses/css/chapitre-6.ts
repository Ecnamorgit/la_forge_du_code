import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : POSITIONNEMENT ORBITAL",
  title: "ANCRAGE\nORBITAL",
  subtitle: "Verrouille tes elements en relative, absolute, fixed et sticky",
  totalXp: 250,
  completionBadge: "🧲",
  completionBadgeLabel: "VERROUILLEUR ORBITAL",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 40px; }\n      .box { background: #00b8d4; color: black; padding: 20px; width: 200px; }\n      .badge { background: #ff6b2c; color: white; padding: 6px 12px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="box">\n      Module principal\n      <div class="badge">Nouveau</div>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Decale le badge avec position: relative */",
      narrator:
        "Le badge est colle au texte. Decale-le legerement vers le bas et la droite sans casser la mise en page autour avec position: relative.",
      hint: "Ajoute a .badge : position: relative; top: 10px; left: 20px;",
      briefing: {
        title: "position: relative",
        content: `
### Quatre positionnements
CSS propose 4 valeurs principales de **position** : **static** (par defaut), **relative**, **absolute**, **fixed**, et une 5eme : **sticky**.

### relative
L'element **reste dans le flux** (les autres elements gardent leur place), mais on peut le **decaler** avec **top**, **right**, **bottom**, **left**.

\`.badge {\`
\`  position: relative;\`
\`  top: 10px;\`
\`  left: 20px;\`
\`}\`

### Difference avec margin
- **margin** : pousse l'element ET tous les voisins.
- **position: relative + top/left** : decale visuellement, le voisin ne bouge pas.

### Quand l'utiliser ?
- Pour un mini-ajustement visuel.
- Surtout : pour servir de **reference** a un enfant en absolute (cf. etape suivante).

**Reflexe :** "relative seul" est rarement utile. On le pose souvent comme **parent positionne** pour les enfants absolus.
        `,
      },
      objectives: [
        { id: "o1a", label: "Definir position: relative sur .badge" },
        { id: "o1b", label: "Ajouter top et left non nuls" },
      ],
      missionIcon: "📍",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DECALAGE RELATIF",
      bannerIcon: "📍",
      bannerTtl: "POSITIONNEMENT FIN",
      bannerSub: "Le badge est decale sans casser le flux.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 40px; }\n      .card { background: #0a1322; padding: 30px; width: 300px; }\n      .ribbon { background: #00ff88; color: black; padding: 4px 12px; font-weight: bold; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="card">\n      <div class="ribbon">PROMO</div>\n      Contenu de la carte\n    </div>\n  </body>\n</html>',
      placeholder: "/* Ancre le ruban en haut a droite de .card */",
      narrator:
        "Le ruban PROMO doit se placer dans le coin haut-droit de la carte, en superposition. Utilise position: absolute en faisant de .card un parent positionne avec position: relative.",
      hint: "Ajoute a .card : position: relative; et a .ribbon : position: absolute; top: 0; right: 0;",
      briefing: {
        title: "position: absolute",
        content: `
### absolute = retire du flux
Un element **absolute** est **arrache** du flux du document. Les autres elements se comportent comme s'il n'existait pas.

### Reference de position
absolute se positionne par rapport au **plus proche ancetre positionne** (relative, absolute, fixed, sticky). S'il n'y en a aucun, c'est par rapport au viewport.

### Pattern classique
\`.parent { position: relative; }   /* point d'ancrage */\`
\`.child { position: absolute; top: 0; right: 0; }   /* enfant ancre */\`

### Cas d'usage
- Badge / ruban dans un coin de carte.
- Tooltip pres d'un element.
- Modal centree sur la fenetre.
- Icone de fermeture (X) en haut a droite d'une boite.

**Astuce :** si le parent n'a pas position: relative, l'absolute "remonte" jusqu'a trouver un ancetre positionne — souvent <body>. C'est la cause #1 des bugs "mon truc est mal place".
        `,
      },
      objectives: [
        { id: "o2a", label: "Faire de .card un parent positionne" },
        { id: "o2b", label: "Ancrer .ribbon en absolute dans un coin" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ANCRAGE ABSOLU",
      bannerIcon: "🎯",
      bannerTtl: "ENFANT VERROUILLE",
      bannerSub: "Le ruban est ancre au coin de sa carte parente.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 0; }\n      .topbar { background: #00b8d4; color: black; padding: 12px; text-align: center; }\n      .content { padding: 20px; min-height: 1500px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="topbar">Barre de mission</div>\n    <div class="content">Contenu tres long...</div>\n  </body>\n</html>',
      placeholder: "/* Bloque la topbar en haut du viewport quand on scrolle */",
      narrator:
        "La barre de mission doit rester visible meme quand l'utilisateur scrolle. Utilise position: fixed pour la verrouiller en haut du viewport.",
      hint: "Ajoute a .topbar : position: fixed; top: 0; left: 0; right: 0;",
      briefing: {
        title: "position: fixed",
        content: `
### fixed = ancre au viewport
**fixed** retire l'element du flux ET l'ancre au **viewport** (la fenetre du navigateur). Il reste visible meme quand on scrolle.

### Pattern barre fixe
\`.topbar {\`
\`  position: fixed;\`
\`  top: 0;\`
\`  left: 0;\`
\`  right: 0;\`
\`}\`

### Difference cle vs absolute
- **absolute** se cale sur un parent positionne (qui scrolle).
- **fixed** se cale sur le **viewport** (qui ne scrolle jamais).

### Cas d'usage
- Header / nav qui reste en haut.
- Bouton "Retour en haut" en bas a droite.
- Bandeau de notification persistant.
- Modal en plein ecran (avec overlay).

### Attention
- Le contenu derriere la barre fixed est cache. **Ajoute du padding-top sur <body>** equivalent a la hauteur de la barre pour ne pas masquer le debut du contenu.

**A retenir :** fixed = "epingle au navigateur".
        `,
      },
      objectives: [
        { id: "o3a", label: "Definir position: fixed sur .topbar" },
        { id: "o3b", label: "Ancrer top: 0 (et idealement left/right)" },
      ],
      missionIcon: "📌",
      missionTag: "PROTOCOLE 03",
      missionTtl: "BARRE FIXE",
      bannerIcon: "📌",
      bannerTtl: "BARRE VERROUILLEE",
      bannerSub: "La barre reste visible meme en scrollant.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Positionnement</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; margin: 0; padding: 0; }\n      .section { padding: 40px; min-height: 600px; }\n      .section-title { background: #ff6b2c; color: black; padding: 8px 16px; font-weight: bold; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="section">\n      <div class="section-title">Section A</div>\n      <p>Contenu A tres long...</p>\n    </div>\n    <div class="section">\n      <div class="section-title">Section B</div>\n      <p>Contenu B tres long...</p>\n    </div>\n  </body>\n</html>',
      placeholder: "/* Rend les titres de section sticky en haut */",
      narrator:
        "Les titres de section doivent rester visibles tant qu'on est dans leur section, puis disparaitre quand la suivante arrive. C'est le comportement sticky.",
      hint: "Ajoute a .section-title : position: sticky; top: 0;",
      briefing: {
        title: "position: sticky",
        content: `
### Le meilleur des deux mondes
**sticky** se comporte comme **relative** quand l'element est dans sa zone de scroll normal, puis se transforme en **fixed** quand il atteint sa position de seuil.

### Syntaxe
\`.section-title {\`
\`  position: sticky;\`
\`  top: 0;\`
\`}\`

### Comment ca marche ?
1. Tant que la section parente est visible dans le viewport, le titre defile normalement.
2. Quand le scroll atteint le titre, il **se colle** en haut (top: 0).
3. Quand on quitte la section, le titre **part avec elle** (contrairement a fixed qui resterait).

### Cas d'usage
- Headers de section (style iOS contacts).
- Sidebars qui suivent le scroll dans un article.
- Tableaux avec en-tete persistant.

### Piege classique
sticky **ne marche pas** si :
- Un parent a **overflow: hidden** ou **overflow: scroll** (le sticky se colle a CE parent, pas au viewport).
- L'element n'a pas de **top/bottom** defini.

**Astuce :** debug en regardant les overflows des ancetres. C'est presque toujours ca.
        `,
      },
      objectives: [
        { id: "o4a", label: "Definir position: sticky sur .section-title" },
        { id: "o4b", label: "Ajouter top: 0 (ou autre valeur d'ancrage)" },
      ],
      missionIcon: "🧷",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ANCRAGE STICKY",
      bannerIcon: "🧷",
      bannerTtl: "POSITIONNEMENT MAITRISE",
      bannerSub: "Tu maitrises relative, absolute, fixed et sticky.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
