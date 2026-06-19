import type { ChapterData } from "./types";

export const chapitre3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : ŒIL ORBITAL",
  title: "BASE DE DONNEES\nVISUELLE",
  subtitle: "Capture, calibre et annote les images de la station",
  totalXp: 200,
  completionBadge: "📸",
  completionBadgeLabel: "ARCHIVISTE VISUEL",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Capture une image avec <img> -->",
      narrator:
        "Ingenieur, branchons le capteur visuel. La balise <img> permet d'afficher une image, mais elle a besoin d'une source et d'une description.",
      hint: 'Utilise <img src="..." alt="...">. Une URL d\'exemple : "https://placehold.co/200x120".',
      briefing: {
        title: "Capter une image",
        content: `
### La balise <img>
La balise **<img>** affiche une image. C'est une balise **auto-fermante** : pas de </img> a la fin.

### Les attributs essentiels
- **src** : la source de l'image (URL ou fichier local).
- **alt** : un texte alternatif decrit l'image quand elle ne peut pas s'afficher.

### Exemple
\`<img src="https://placehold.co/200x120" alt="Vue de la station">\`

**Bonne pratique :** le **alt** est obligatoire. Il aide l'accessibilite et le SEO.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <img>" },
        { id: "o1b", label: "Renseigner les attributs src et alt" },
      ],
      docRefs: ["html/img"],
      missionIcon: "📷",
      missionTag: "PROTOCOLE 01",
      missionTtl: "ACTIVER LE CAPTEUR",
      bannerIcon: "🛰",
      bannerTtl: "IMAGE CAPTUREE",
      bannerSub: "Le capteur visuel transmet sa premiere image.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    <img src="https://placehold.co/200x120" alt="Vue de la station">\n    \n  </body>\n</html>',
      placeholder: "<!-- Calibre l'image avec width et height -->",
      narrator:
        "Le capteur fonctionne mais il occupe trop d'espace. Calibre-le avec une largeur et une hauteur precises.",
      hint: 'Ajoute width="..." et height="..." sur la balise <img> (ex. width="300" height="180").',
      briefing: {
        title: "Calibrer le capteur",
        content: `
### Les attributs width et height
Tu peux fixer la taille d'une image en pixels :
- **width** : la largeur.
- **height** : la hauteur.

### Exemple
\`<img src="..." alt="..." width="300" height="180">\`

### Pourquoi le faire ?
- Le navigateur **reserve la place** de l'image avant qu'elle ne charge -> moins de saccades.
- Tu controles l'apparence sans dependre de la taille du fichier.

**Astuce :** sans unite, la valeur est en pixels.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter un attribut width" },
        { id: "o2b", label: "Ajouter un attribut height" },
      ],
      docRefs: ["html/img"],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CALIBRER L'OPTIQUE",
      bannerIcon: "🎚",
      bannerTtl: "DIMENSIONS REGLEES",
      bannerSub: "L'image s'affiche aux dimensions prevues.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    <img src="https://placehold.co/200x120" alt="Vue de la station" width="300" height="180">\n    \n  </body>\n</html>',
      placeholder: "<!-- Rends l'image cliquable -->",
      narrator:
        "Les images peuvent devenir des portails. Entoure l'image d'un lien <a> pour qu'elle redirige vers la page de details.",
      hint: 'Place <img> a l\'interieur d\'un <a href="details.html">...</a>.',
      briefing: {
        title: "Image cliquable",
        content: `
### Combiner <a> et <img>
Une image peut etre **cliquable** : il suffit de la placer dans une balise **<a>**.

### Exemple
\`<a href="details.html">\`
\`  <img src="..." alt="Voir les details">\`
\`</a>\`

### Cas d'usage
- Boutons illustres.
- Galeries dont chaque vignette ouvre l'image en grand.
- Bannieres promotionnelles.

**A retenir :** <a> est un conteneur, il peut englober du texte **ou** une image.
        `,
      },
      objectives: [
        { id: "o3a", label: "Entourer l'image d'un lien <a>" },
        { id: "o3b", label: "Renseigner l'attribut href du lien" },
      ],
      docRefs: ["html/a", "html/img"],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 03",
      missionTtl: "PORTAIL VISUEL",
      bannerIcon: "🚪",
      bannerTtl: "PORTAIL ACTIF",
      bannerSub: "L'image redirige correctement quand on clique dessus.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    <a href="details.html">\n      <img src="https://placehold.co/200x120" alt="Vue de la station" width="300" height="180">\n    </a>\n    \n  </body>\n</html>',
      placeholder: "<!-- Documente l'image avec <figure> et <figcaption> -->",
      narrator:
        "Une image sans contexte reste muette. Encadre-la dans une <figure> et ajoute une legende avec <figcaption> pour la documenter.",
      hint: 'Utilise <figure>...<figcaption>Texte de legende</figcaption></figure>.',
      briefing: {
        title: "Annoter une image",
        content: `
### Les balises <figure> et <figcaption>
- **<figure>** regroupe une image (ou un schema) et son commentaire.
- **<figcaption>** contient la **legende** de la figure.

### Structure
\`<figure>\`
\`  <img src="..." alt="...">\`
\`  <figcaption>Vue de la station depuis l'orbite</figcaption>\`
\`</figure>\`

### Pourquoi c'est utile ?
- Le navigateur comprend que l'image et le texte forment un **bloc indissociable**.
- Excellent pour les articles, les rapports de mission et les schemas techniques.

**Niveau bonus :** la legende peut etre avant ou apres l'image, peu importe.
        `,
      },
      objectives: [
        { id: "o4a", label: "Encadrer l'image dans une <figure>" },
        { id: "o4b", label: "Ajouter un <figcaption> non vide" },
      ],
      docRefs: ["html/figure"],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ARCHIVER LE CLICHE",
      bannerIcon: "🏷",
      bannerTtl: "FICHE COMPLETE",
      bannerSub:
        "L'image est desormais documentee et indexable dans les archives.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
