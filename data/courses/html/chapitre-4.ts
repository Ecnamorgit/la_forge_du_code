import type { ChapterData } from "./types";

export const chapitre4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : INVENTAIRE",
  title: "ARSENAL\nTACTIQUE",
  subtitle: "Organise les listes et tableaux de la base",
  totalXp: 200,
  completionBadge: "📋",
  completionBadgeLabel: "LOGISTICIEN",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Cree une liste a puces avec <ul> -->",
      narrator:
        "Tout commence par un inventaire. Liste les modules essentiels de la base dans une liste a puces.",
      hint: 'Utilise <ul> et trois <li>, par exemple : <li>Oxygene</li><li>Energie</li><li>Communication</li>.',
      briefing: {
        title: "Les listes a puces",
        content: `
### La balise <ul>
**<ul>** signifie *unordered list* — liste **sans ordre particulier**. Le navigateur affiche un point devant chaque element.

### Chaque element : <li>
Chaque ligne de la liste est une balise **<li>** (*list item*).

### Exemple
\`<ul>\`
\`  <li>Oxygene</li>\`
\`  <li>Energie</li>\`
\`  <li>Communication</li>\`
\`</ul>\`

**A retenir :** une <ul> contient uniquement des <li>, jamais autre chose en direct.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <ul>" },
        { id: "o1b", label: "Placer au moins trois <li>" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DRESSER L'INVENTAIRE",
      bannerIcon: "✅",
      bannerTtl: "MODULES LISTES",
      bannerSub: "Les modules de la base sont identifies.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    <ul>\n      <li>Oxygene</li>\n      <li>Energie</li>\n      <li>Communication</li>\n    </ul>\n    \n  </body>\n</html>',
      placeholder: "<!-- Etablis la procedure de decollage avec <ol> -->",
      narrator:
        "Certaines actions doivent etre faites dans l'ordre. La procedure de decollage exige une liste **ordonnee** ou chaque etape compte.",
      hint: 'Utilise <ol> avec trois <li>, par exemple : <li>Pressuriser</li><li>Allumer les moteurs</li><li>Decoller</li>.',
      briefing: {
        title: "Les listes ordonnees",
        content: `
### La balise <ol>
**<ol>** signifie *ordered list* — liste **ordonnee**. Le navigateur numerote automatiquement chaque element (1, 2, 3...).

### Quand l'utiliser ?
Des qu'il y a un **ordre logique** : une recette, une procedure, un classement.

### Exemple
\`<ol>\`
\`  <li>Pressuriser la cabine</li>\`
\`  <li>Allumer les moteurs</li>\`
\`  <li>Decoller</li>\`
\`</ol>\`

**Reflexe :** si changer l'ordre casse le sens, choisis <ol>. Sinon <ul>.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une balise <ol>" },
        { id: "o2b", label: "Placer au moins trois <li>" },
      ],
      missionIcon: "🔢",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ORDRE DE MARCHE",
      bannerIcon: "🚀",
      bannerTtl: "PROCEDURE PRETE",
      bannerSub: "Les etapes de decollage sont sequencees.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    <ul>\n      <li>Oxygene</li>\n      <li>Energie</li>\n      <li>Communication</li>\n    </ul>\n    <ol>\n      <li>Pressuriser</li>\n      <li>Allumer les moteurs</li>\n      <li>Decoller</li>\n    </ol>\n    \n  </body>\n</html>',
      placeholder: "<!-- Construis un tableau simple avec <table> -->",
      narrator:
        "Place a la grille tactique. Un tableau HTML organise les donnees en lignes et colonnes — parfait pour les coordonnees d'arrivee.",
      hint: 'Une grille minimale : <table><tr><td>Ligne 1 col 1</td><td>Ligne 1 col 2</td></tr></table>. Ajoute au moins deux <tr> avec deux <td> chacun.',
      briefing: {
        title: "Les tableaux",
        content: `
### Les trois balises de base
- **<table>** : le conteneur du tableau.
- **<tr>** : *table row*, une ligne du tableau.
- **<td>** : *table data*, une cellule de donnee.

### Structure
\`<table>\`
\`  <tr>\`
\`    <td>Cible</td>\`
\`    <td>Distance</td>\`
\`  </tr>\`
\`  <tr>\`
\`    <td>Mars</td>\`
\`    <td>225 M km</td>\`
\`  </tr>\`
\`</table>\`

**Regle :** chaque <tr> contient des <td>. Le nombre de <td> par ligne doit etre coherent.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une balise <table>" },
        { id: "o3b", label: "Placer au moins deux <tr> avec des <td>" },
      ],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 03",
      missionTtl: "GRILLE DE COORDONNEES",
      bannerIcon: "📊",
      bannerTtl: "GRILLE OPERATIONNELLE",
      bannerSub: "Les donnees sont alignees, lisibles et organisees.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    <table>\n      <tr>\n        <td>Mars</td>\n        <td>225 M km</td>\n      </tr>\n      <tr>\n        <td>Lune</td>\n        <td>384 000 km</td>\n      </tr>\n    </table>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute des titres de colonnes avec <thead> et <th> -->",
      narrator:
        "Sans en-tete, la grille est aveugle. Distingue les colonnes avec <thead> et <th> pour donner du sens aux donnees.",
      hint: 'Encadre les en-tetes avec <thead><tr><th>Cible</th><th>Distance</th></tr></thead> et entoure les lignes de donnees dans <tbody>.',
      briefing: {
        title: "Tetes et corps de tableau",
        content: `
### <thead>, <tbody> et <th>
- **<thead>** : la zone des **en-tetes** de colonnes (souvent une seule ligne).
- **<tbody>** : la zone des **donnees** elles-memes.
- **<th>** : *table header*, une cellule d'en-tete (en gras par defaut, centree).

### Structure complete
\`<table>\`
\`  <thead>\`
\`    <tr><th>Cible</th><th>Distance</th></tr>\`
\`  </thead>\`
\`  <tbody>\`
\`    <tr><td>Mars</td><td>225 M km</td></tr>\`
\`    <tbody>\`
\`</table>\`

**Avantage :** les outils d'accessibilite annoncent que "Cible" est l'en-tete de la colonne, pas une donnee.
        `,
      },
      objectives: [
        { id: "o4a", label: "Encadrer les en-tetes dans un <thead>" },
        { id: "o4b", label: "Utiliser au moins deux <th>" },
      ],
      missionIcon: "🏷",
      missionTag: "PROTOCOLE 04",
      missionTtl: "BAPTISER LES COLONNES",
      bannerIcon: "🗂",
      bannerTtl: "DONNEES STRUCTUREES",
      bannerSub:
        "Le tableau distingue clairement les en-tetes et les valeurs.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
