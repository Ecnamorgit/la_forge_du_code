import type { ChapterData } from "@/data/courses/html/types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : CHROMATIQUE",
  title: "PALETTE\nTACTIQUE",
  subtitle: "Maîtrise les sélecteurs et les formats de couleur",
  totalXp: 200,
  completionBadge: "🌈",
  completionBadgeLabel: "OPÉRATEUR PALETTE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Palette tactique</title>\n    <style>\n      body { background-color: #03060d; color: white; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Statut equipage</h1>\n    <p class="alert">Alerte : pression instable</p>\n    <p>Tous les autres systemes sont nominaux.</p>\n  </body>\n</html>',
      placeholder: "<!-- Cible le paragraphe avec class=\"alert\" -->",
      narrator:
        "Tous les paragraphes ne se valent pas. Cible uniquement celui qui porte la classe alert pour l'alerter visuellement.",
      hint: "Dans le <style>, ajoute : .alert { color: red; }",
      briefing: {
        title: "Le sélecteur de classe",
        content: `
*« Tirer sur tout ce qui bouge, c'est bon pour les amateurs. Une \`class\`, un point, et tu ne cibles que ce que tu veux — précision avant puissance. »* — **Kira**

### Sélectionner par classe
Un même élément peut porter une **class** (étiquette) ajoutee dans le HTML : \`<p class="alert">\`.

### En CSS, on cible une classe avec le **point**
\`.alert {\`
\`  color: red;\`
\`}\`

### Pourquoi utiliser des classes ?
- Cibler **un sous-ensemble** d'éléments (pas tous les <p>).
- Reutiliser le même style sur plusieurs éléments.
- Garder le HTML neutre et le style modifiable.

**À retenir :** \`.alert\` cible **tout élément** ayant \`class="alert"\`, peu importe son type (p, div, span...).
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser un sélecteur de classe (.alert)" },
        { id: "o1b", label: "Appliquer une propriété color" },
      ],
      docRefs: ["css/selecteurs"],
      missionIcon: "🏷",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CIBLAGE PRÉCIS",
      bannerIcon: "🎯",
      bannerTtl: "CLASSE ACTIVE",
      bannerSub: "Seul le paragraphe d'alerte change de couleur.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Palette tactique</title>\n    <style>\n      body { background-color: #03060d; color: white; }\n      .alert { color: red; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Statut equipage</h1>\n    <p class="alert">Alerte : pression instable</p>\n    <p id="status">Code mission : NEBULA-7</p>\n  </body>\n</html>',
      placeholder: "<!-- Cible l'element ayant id=\"status\" -->",
      narrator:
        "Un identifiant unique permet de cibler un seul élément précisément. Le paragraphe id=\"status\" doit afficher une couleur cyan signature.",
      hint: "Dans le <style>, ajoute : #status { color: cyan; }",
      briefing: {
        title: "Le sélecteur d'id",
        content: `
### Sélectionner par id
Un **id** est un identifiant **unique** dans la page : \`<p id="status">\`.

### En CSS, on cible un id avec le **diese**
\`#status {\`
\`  color: cyan;\`
\`}\`

### Différence class vs id
- **class** : peut être portee par plusieurs éléments -> en CSS avec **.**
- **id** : un seul élément par page -> en CSS avec **#**

**Bonnes pratiques :**
- Utilise plutôt les **classes** pour les styles reutilisables.
- Reserve les **id** aux éléments vraiment uniques.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser un sélecteur d'id (#status)" },
        { id: "o2b", label: "Appliquer une propriété color" },
      ],
      missionIcon: "🆔",
      missionTag: "PROTOCOLE 02",
      missionTtl: "SIGNAL UNIQUE",
      bannerIcon: "🔆",
      bannerTtl: "IDENTIFIANT ACTIF",
      bannerSub: "Le statut de mission ressort en cyan signature.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Palette tactique</title>\n    <style>\n      body { background-color: #03060d; color: white; }\n      .alert { color: red; }\n      #status { color: cyan; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Statut equipage</h1>\n    <p class="alert">Alerte : pression instable</p>\n    <p id="status">Code mission : NEBULA-7</p>\n  </body>\n</html>',
      placeholder: "<!-- Utilise une couleur hex ou rgb sur le <h1> -->",
      narrator:
        "Les noms de couleur sont pratiques mais limites. Passe au format hex ou rgb pour personnaliser précisément la teinte du titre.",
      hint: "Dans le <style>, ajoute : h1 { color: #ff6b2c; } ou h1 { color: rgb(255, 107, 44); }",
      briefing: {
        title: "Formats de couleur",
        content: `
### Trois formats principaux
1. **Nom de couleur** : cyan, red, white...
2. **Hexadecimal** : commence par # suivi de 6 caractères.
   - \`#ff0000\` = rouge
   - \`#00f0ff\` = cyan
   - \`#ffffff\` = blanc
3. **RGB** : trois nombres entre 0 et 255.
   - \`rgb(255, 0, 0)\` = rouge
   - \`rgb(0, 240, 255)\` = cyan

### Decoder le hex
Chaque paire represente une composante (rouge, vert, bleu) en base 16.
- \`#FF6B2C\` -> RGB(255, 107, 44) -> orange tactique.

**Astuce :** outils en ligne (color picker) pour trouver le code exact d'une couleur.
        `,
      },
      objectives: [
        { id: "o3a", label: "Cibler le <h1>" },
        { id: "o3b", label: "Utiliser un code hex (#xxxxxx) ou rgb(...)" },
      ],
      missionIcon: "🎨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TEINTE PRÉCISE",
      bannerIcon: "🟧",
      bannerTtl: "COULEUR CALIBREE",
      bannerSub: "Le titre adopte la couleur exacte de la flotte.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Palette tactique</title>\n    <style>\n      body { background-color: #03060d; color: white; }\n      h1 { color: #ff6b2c; }\n      .alert { color: red; }\n      #status { color: cyan; }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Statut equipage</h1>\n    <p class="alert">Alerte : pression instable</p>\n    <p id="status">Code mission : NEBULA-7</p>\n  </body>\n</html>',
      placeholder: "<!-- Centre le h1 et mets l'alerte en gras -->",
      narrator:
        "Finition typographique. Centre le titre principal et donne du poids visuel à l'alerte avec font-weight.",
      hint: "Ajoute h1 { text-align: center; } et .alert { font-weight: bold; }.",
      briefing: {
        title: "Mise en forme du texte",
        content: `
### text-align
Aligne le texte horizontalement : **left** (par défaut), **center**, **right**, **justify**.
\`h1 { text-align: center; }\`

### font-weight
Contrôle l'**epaisseur** de la police : **normal**, **bold**, ou un nombre (100-900).
\`.alert { font-weight: bold; }\`

### text-décoration (bonus)
Souligne, barre ou enleve la décoration : **underline**, **line-through**, **none**.
\`a { text-decoration: none; }\`

**Réflexe :** pour les liens, on enleve souvent le soulignement avec **text-décoration: none**.
        `,
      },
      objectives: [
        { id: "o4a", label: "Centrer le <h1> (text-align)" },
        { id: "o4b", label: "Mettre .alert en gras (font-weight)" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TYPOGRAPHIE TACTIQUE",
      bannerIcon: "🖋",
      bannerTtl: "STYLE COMPLET",
      bannerSub:
        "La hiérarchie visuelle de la console est maintenant claire.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};