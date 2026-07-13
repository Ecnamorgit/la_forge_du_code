import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : INSTALLATION GRAPHIQUE",
  title: "INSTALLATION\nDU SYSTÈME GRAPHIQUE",
  subtitle: "Configure le dock avec CSS et anime ses premières lignes de code",
  totalXp: 200,
  completionBadge: "🎨",
  completionBadgeLabel: "INITIATEUR GRAPHIQUE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    \n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, Cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une balise <style> dans le <head> -->",
      narrator:
        "Pour appliquer du style à notre dock, nous devons créer une zone dédiée. La balise <style> est la solution : c'est notre console graphique embarquée.",
      hint: 'Ajoute <style></style> à l\'intérieur du <head>, sous le <title>.',
      briefing: {
        title: "Brancher le CSS au HTML",
        content: `
*« La structure tient, maintenant on l'habille. Le \`<style>\` dans le \`<head>\`, c'est ta console graphique — tout le décor de la station passe par là. »* — **Kira**

### Le CSS, c'est quoi ?
**CSS** signifie *Cascading Style Sheets* — feuilles de style en cascade. Il sert à **décorer** notre dock : couleurs, polices, tailles, dispositions.

### Trois façons d'intégrer du CSS
1. **Dans un fichier externe** (le plus pro, pour plus tard).
2. **Dans une balise <style>** placée dans le <head> (ce qu'on va faire maintenant).
3. **Directement sur un élément** via l'attribut style="...".

### La balise <style>
\`<style>\`
\`  /* tes règles CSS ici */\`
\`</style>\`

**À retenir :** dans ce cursus, nous écrirons nos règles à l'intérieur d'une balise <style> dans le <head>.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <style> dans <head>" },
        { id: "o1b", label: "Fermer la balise </style>" },
      ],
      missionIcon: "🖌",
      missionTag: "PROTOCOLE 01",
      missionTtl: "BRANCHER LA CONSOLE",
      bannerIcon: "🎨",
      bannerTtl: "CONSOLE EN LIGNE",
      bannerSub: "La zone de style est branchée au document.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, Cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Donne une couleur au <h1> -->",
      narrator:
        "Premier signal visuel : illuminons le titre du dock. Sélectionnons le <h1>, puis appliquons la propriété color.",
      hint: 'Écris dans le <style> : h1 { color: cyan; }',
      briefing: {
        title: "Premier sélecteur",
        content: `
### Anatomie d'une règle CSS
\`selecteur { propriétés : valeurs ; }\`

- **selecteur** : *quel* élément on cible (ici h1).
- **propriété** : *quelle* caractéristique on modifie (ici color).
- **valeur** : la valeur appliquée (ici cyan).
- Le **point-virgule** ; termine chaque ligne.

### Exemple
\`h1 {\`
\`  color: cyan;\`
\`}\`

### Quelques noms de couleur valides
- **red**, **blue**, **green**, **cyan**, **orange**, **white**, **black**...
- Plus tard, on utilisera des codes hex (#00f0ff) et rgb(...).

**Réflexe :** chaque accolade ouverte { doit être fermée }.
        `,
      },
      objectives: [
        { id: "o2a", label: "Cibler le <h1> avec un sélecteur" },
        { id: "o2b", label: "Appliquer la propriété color" },
      ],
      missionIcon: "🟢",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ALLUMER LE TITRE",
      bannerIcon: "💡",
      bannerTtl: "SIGNAL VISIBLE",
      bannerSub: "Le titre brille desormais aux couleurs de la flotte.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      h1 {\n        color: cyan;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, Cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Donne une couleur de fond au body -->",
      narrator:
        "Le titre brille, mais le fond reste blanc. Plongeons la page dans l'espace en changeant la couleur de fond du <body>.",
      hint: "Ajoute dans le <style> : body { background-color: black; }",
      briefing: {
        title: "La couleur de fond",
        content: `
### La propriété background-color
Elle définit la **couleur de fond** d'un élément.

### Exemple
\`body {\`
\`  background-color: black;\`
\`}\`

### Différence avec color
- **color** : la couleur du **texte**.
- **background-color** : la couleur du **fond**.

**Astuce :** appliquée sur <body>, la couleur recouvre toute la page.
        `,
      },
      objectives: [
        { id: "o3a", label: "Cibler le <body>" },
        { id: "o3b", label: "Appliquer la propriété background-color" },
      ],
      missionIcon: "🌑",
      missionTag: "PROTOCOLE 03",
      missionTtl: "FOND SPATIAL",
      bannerIcon: "🌌",
      bannerTtl: "AMBIANCE PRÊTE",
      bannerSub: "Le décor de la mission est en place.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      body {\n        background-color: black;\n      }\n      h1 {\n        color: cyan;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, Cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Agrandis le texte avec font-size -->",
      narrator:
        "Le message est lisible mais trop petit. Augmentons la taille du paragraphe avec font-size pour qu'il atteigne le centre de contrôle.",
      hint: "Ajoute dans le <style> : p { font-size: 20px; }",
      briefing: {
        title: "La taille du texte",
        content: `
### La propriété font-size
Elle contrôlle la **taille de la police**. La valeur s'exprime souvent en pixels (px).

### Exemple
\`p {\`
\`  font-size: 20px;\`
\`}\`

### Quelques repères
- **12px** : petit (notes, mentions).
- **16px** : standard (taille par défaut).
- **20-24px** : confortable à lire.
- **40px+** : titre très visible.

**Bonus :** d'autres unités existent (rem, em, %). On y reviendra.
        `,
      },
      objectives: [
        { id: "o4a", label: "Cibler le <p>" },
        { id: "o4b", label: "Appliquer une font-size en px" },
      ],
      missionIcon: "🔠",
      missionTag: "PROTOCOLE 04",
      missionTtl: "AMPLIFIER LE SIGNAL",
      bannerIcon: "📢",
      bannerTtl: "MESSAGE CLAIR",
      bannerSub: "Le texte est maintenant lisible depuis la passerelle.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};