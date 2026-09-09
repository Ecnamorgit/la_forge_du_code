import type { ChapterData } from "./types";

export const chapitre4: ChapterData = {
  slug: "chapitre-4",
  tag: "DOCK D'ORBITE : INVENTAIRE",
  title: "TÊTES ET CORPS\nDE TABLEAU",
  subtitle: "Organise les listes et les grilles de chargement du dock",
  totalXp: 200,
  completionBadge: "📋",
  completionBadgeLabel: "LOGISTICIEN DE DOCK",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Cree une liste a puces avec <ul> -->",
      narrator:
        "Tout commence par un inventaire de la soute. Liste les modules essentiels du dock dans une liste à puces.",
      hint: 'Utilise <ul> et trois <li>, par exemple : <li>Oxygène</li><li>Energie</li><li>Communication</li>.',
      briefing: {
        title: "Les listes a puces",
        content: `
*« Un inventaire, ça se tient en ordre. Une puce par module, et rien d'autre qu'un \`<li>\` dans un \`<ul>\`. »* — **Kira**

### La balise <ul>
**<ul>** signifie *unordered list* — liste **sans ordre particulier**. La console affiche une puce devant chaque compartiment.

### Chaque élément : <li>
Chaque ligne est declarée avec la balise **<li>** (*list item*).

### Exemple
\`<ul>\`
\`  <li>Oxygene</li>\`
\`  <li>Energie</li>\`
\`  <li>Communication</li>\`
\`</ul>\`

**À retenir :** Une balise <ul> ne doit contenir que des <li>.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <ul>" },
        { id: "o1b", label: "Placer au moins trois <li>" },
      ],
      docRefs: ["html/ul"],
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
        "Certaines manoeuvres exigent un ordre strict. La procédure de décollage de la navette du dock doit s'afficher sous forme de liste ordonnée.",
      hint: 'Utilise <ol> avec trois <li>, par exemple : <li>Pressuriser</li><li>Allumer les moteurs</li><li>Décoller</li>.',
      briefing: {
        title: "Les listes ordonnees",
        content: `
### La balise <ol>
**<ol>** signifie *ordered list* — liste **ordonnée**. Le système numérote automatiquement les étapes de 1 à N.

### Quand l'utiliser ?
Pour toute suite logique obligatoire : protocoles de sécurité, checklists, ou procédures d'urgence.

### Exemple
\`<ol>\`
\`  <li>Pressuriser la soute</li>\`
\`  <li>Allumer les réacteurs</li>\`
\`  <li>Ouvrir le sas principal</li>\`
\`</ol>\`
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une balise <ol>" },
        { id: "o2b", label: "Placer au moins trois <li>" },
      ],
      docRefs: ["html/ol"],
      missionIcon: "🔢",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ORDRE DE MARCHE",
      bannerIcon: "🚀",
      bannerTtl: "PROCÉDURE PRÊTE",
      bannerSub: "Les étapes de décollage sont sequencees.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    <ul>\n      <li>Oxygene</li>\n      <li>Energie</li>\n      <li>Communication</li>\n    </ul>\n    <ol>\n      <li>Pressuriser</li>\n      <li>Allumer les moteurs</li>\n      <li>Decoller</li>\n    </ol>\n    \n  </body>\n</html>',
      placeholder: "<!-- Construis un tableau simple avec <table> -->",
      narrator:
        "Créons une grille de répartition pour les cargaisons. Un tableau HTML organise la liste des conteneurs, leurs coordonnées d'amarrage et leurs masses.",
      hint: 'Une grille minimale : <table><tr><td>Ligne 1 col 1</td><td>Ligne 1 col 2</td></tr></table>. Ajoute au moins deux <tr> avec deux <td> chacun.',
      briefing: {
        title: "Les tableaux",
        content: `
### Structure logistique
- **<table>** : structure globale du tableau.
- **<tr>** : *table row*, ligne de chargement.
- **<td>** : *table data*, cellule de données.

### Exemple
\`<table>\`
\`  <tr>\`
\`    <td>Conteneur A1</td>\`
\`    <td>Masse 12t</td>\`
\`  </tr>\`
\`</table>\`
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une balise <table>" },
        { id: "o3b", label: "Placer au moins deux <tr> avec des <td>" },
      ],
      docRefs: ["html/table"],
      missionIcon: "🧮",
      missionTag: "PROTOCOLE 03",
      missionTtl: "GRILLE DE COORDONNÉES",
      bannerIcon: "📊",
      bannerTtl: "GRILLE OPÉRATIONNELLE",
      bannerSub: "Les données sont alignees, lisibles et organisees.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Arsenal</title>\n  </head>\n  <body>\n    <h1>Inventaire de la base</h1>\n    <ul>\n      <li>Oxygene</li>\n      <li>Energie</li>\n      <li>Communication</li>\n    </ul>\n    <ol>\n      <li>Pressuriser</li>\n      <li>Allumer les moteurs</li>\n      <li>Decoller</li>\n    </ol>\n    <table>\n      <tr>\n        <td>Mars</td>\n        <td>225 M km</td>\n      </tr>\n      <tr>\n        <td>Lune</td>\n        <td>384 000 km</td>\n      </tr>\n    </table>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute des titres de colonnes avec <thead> et <th> -->",
      narrator:
        "Sans labels, les colonnes de notre manifeste de soute sont illisibles. Distingue l'en-tête du tableau avec <thead> et définis les titres de colonnes avec <th>.",
      hint: 'Encapsule les en-têtes avec <thead><tr><th>Cible</th><th>Distance</th></tr></thead> et entoure les lignes de données dans <tbody>.',
      briefing: {
        title: "Têtes et corps de tableau",
        content: `
### Organiser la grille
- **<thead>** : regroupe les en-têtes de colonnes.
- **<tbody>** : contient le corps des données.
- **<th>** : *table header*, une cellule d'en-tête (en gras par défaut, centrée).

### Exemple
\`<table>\`
\`  <thead>\`
\`    <tr><th>Destination</th><th>Hangar</th></tr>\`
\`  </thead>\`
\`  <tbody>\`
\`    <tr><td>Navette Alpha</td><td>Secteur 4</td></tr>\`
\`  </tbody>\`
\`</table>\`
        `,
      },
      objectives: [
        { id: "o4a", label: "Encadrer les en-têtes dans un <thead>" },
        { id: "o4b", label: "Utiliser au moins deux <th>" },
      ],
      docRefs: ["html/thead"],
      missionIcon: "🏷",
      missionTag: "PROTOCOLE 04",
      missionTtl: "BAPTISER LES COLONNES",
      bannerIcon: "🗂",
      bannerTtl: "DONNÉES STRUCTURÉES",
      bannerSub: "Le tableau distingue clairement les en-têtes et les valeurs.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
