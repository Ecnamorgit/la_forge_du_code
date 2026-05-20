import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ECRAN D'ACCUEIL",
  title: "INSTALLATION\nDU SYSTEME GRAPHIQUE",
  subtitle: "Connecte le CSS au HTML et anime tes premieres couleurs",
  totalXp: 200,
  completionBadge: "🎨",
  completionBadgeLabel: "INITIATEUR GRAPHIQUE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    \n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une balise <style> dans le <head> -->",
      narrator:
        "Pour appliquer du style, il nous faut une zone dediee. La balise <style> sert exactement a ca : c'est notre console graphique embarquee.",
      hint: 'Ajoute <style></style> a l\'interieur du <head>, sous le <title>.',
      briefing: {
        title: "Brancher le CSS au HTML",
        content: `
### Le CSS, c'est quoi ?
**CSS** signifie *Cascading Style Sheets* — feuilles de style en cascade. Il sert a **decorer** le HTML : couleurs, polices, tailles, dispositions.

### Trois facons d'integrer du CSS
1. **Dans un fichier externe** (le plus pro, pour plus tard).
2. **Dans une balise <style>** placee dans le <head> (ce qu'on va faire maintenant).
3. **Directement sur un element** via l'attribut style="...".

### La balise <style>
\`<style>\`
\`  /* tes regles CSS ici */\`
\`</style>\`

**A retenir :** dans ce cursus, on ecrira nos regles a l'interieur d'une balise <style> dans le <head>.
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
      bannerSub: "La zone de style est branchee au document.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Donne une couleur au <h1> -->",
      narrator:
        "Premier signal visuel : illuminons le titre. On selectionne le <h1>, puis on lui applique la propriete color.",
      hint: 'Ecris dans le <style> : h1 { color: cyan; }',
      briefing: {
        title: "Premier selecteur",
        content: `
### Anatomie d'une regle CSS
\`selecteur { propriete: valeur; }\`

- **selecteur** : *quel* element on cible (ici h1).
- **propriete** : *quelle* caracteristique on modifie (ici color).
- **valeur** : la valeur appliquee (ici cyan).
- Le **point-virgule** ; termine chaque ligne.

### Exemple
\`h1 {\`
\`  color: cyan;\`
\`}\`

### Quelques noms de couleur valides
- **red**, **blue**, **green**, **cyan**, **orange**, **white**, **black**...
- Plus tard, on utilisera des codes hex (#00f0ff) et rgb(...).

**Reflexe :** chaque accolade ouverte { doit etre fermee }.
        `,
      },
      objectives: [
        { id: "o2a", label: "Cibler le <h1> avec un selecteur" },
        { id: "o2b", label: "Appliquer la propriete color" },
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
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      h1 {\n        color: cyan;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Donne une couleur de fond au body -->",
      narrator:
        "Le titre brille, mais le fond reste blanc. Plonge la page dans l'espace en changeant la couleur de fond du <body>.",
      hint: "Ajoute dans le <style> : body { background-color: black; }",
      briefing: {
        title: "La couleur de fond",
        content: `
### La propriete background-color
Elle definit la **couleur de fond** d'un element.

### Exemple
\`body {\`
\`  background-color: black;\`
\`}\`

### Difference avec color
- **color** : la couleur du **texte**.
- **background-color** : la couleur du **fond**.

**Astuce :** appliquee sur <body>, la couleur recouvre toute la page.
        `,
      },
      objectives: [
        { id: "o3a", label: "Cibler le <body>" },
        { id: "o3b", label: "Appliquer la propriete background-color" },
      ],
      missionIcon: "🌑",
      missionTag: "PROTOCOLE 03",
      missionTtl: "FOND SPATIAL",
      bannerIcon: "🌌",
      bannerTtl: "AMBIANCE PRETE",
      bannerSub: "Le decor de la mission est en place.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console graphique</title>\n    <style>\n      body {\n        background-color: black;\n      }\n      h1 {\n        color: cyan;\n      }\n      \n    </style>\n  </head>\n  <body>\n    <h1>Centre de commande</h1>\n    <p>Bienvenue, cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Agrandis le texte avec font-size -->",
      narrator:
        "Le message est lisible mais trop petit. Augmente la taille du paragraphe avec font-size pour qu'il atteigne le centre de controle.",
      hint: "Ajoute dans le <style> : p { font-size: 20px; }",
      briefing: {
        title: "La taille du texte",
        content: `
### La propriete font-size
Elle controle la **taille de la police**. La valeur s'exprime souvent en pixels (px).

### Exemple
\`p {\`
\`  font-size: 20px;\`
\`}\`

### Quelques reperes
- **12px** : petit (notes, mentions).
- **16px** : standard (taille par defaut).
- **20-24px** : confortable a lire.
- **40px+** : titre tres visible.

**Bonus :** d'autres unites existent (rem, em, %). On y reviendra.
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
