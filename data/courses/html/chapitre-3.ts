import type { ChapterData } from "./types";

export const chapitre3: ChapterData = {
  slug: "chapitre-3",
  tag: "DOCK D'ORBITE : CAMÉRAS",
  title: "RÉSEAU DE CAPTEURS",
  subtitle: "Capture, calibre et annote les images de la soute",
  totalXp: 200,
  completionBadge: "📸",
  completionBadgeLabel: "ARCHIVISTE VISUEL",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Capture une image avec <img> -->",
      narrator:
        "Cadet, branchons le premier capteur visuel de notre dock d'amarrage. La balise <img> permet d'afficher le flux vidéo en direct, mais elle a besoin d'indiquer sa source et d'une description alternative en cas de perte de signal.",
      hint: 'Utilise <img src="..." alt="...">. Une URL d\'exemple : "https://placehold.co/200x120".',
      briefing: {
        title: "Capter une image",
        content: `
*« Un capteur sans légende ne sert à rien dans le noir. Renseigne toujours le \`alt\` : c'est ce que « voient » les officiers privés d'écran. »* — **Kira**

### La balise <img>
La balise **<img>** affiche une image sur la console de contrôle. C'est une balise **auto-fermante** : pas besoin de balise fermante </img>.

### Les attributs essentiels
- **src** : la source de l'image (URL ou fichier local de la soute).
- **alt** : description textuelle alternative obligatoire pour l'accessibilité.

### Exemple
\`<img src="https://placehold.co/200x120" alt="Sas de chargement principal">\`

**Bonne pratique :** Renseigne toujours le **alt**. Cela permet aux officiers malvoyants d'interpreter le flux.
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
      bannerSub: "Le capteur visuel transmet sa première image.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Oeil Orbital</title>\n  </head>\n  <body>\n    <h1>Galerie de la station</h1>\n    <img src="https://placehold.co/200x120" alt="Vue de la station">\n    \n  </body>\n</html>',
      placeholder: "<!-- Calibre l'image avec width et height -->",
      narrator:
        "Le capteur fonctionne, mais il prend trop de place sur l'écran. Calibre-le avec une largeur et une hauteur précises pour l'intégrer au tableau de bord.",
      hint: 'Ajoute width="..." et height="..." sur la balise <img> (ex. width="300" height="180").',
      briefing: {
        title: "Calibrer le capteur",
        content: `
### Les attributs width et height
Tu peux fixer les dimensions de la zone d'affichage :
- **width** : largeur en pixels.
- **height** : hauteur en pixels.

### Exemple
\`<img src="..." alt="..." width="300" height="180">\`

### Pourquoi le faire ?
- Le navigateur **reserve l'espace physique** avant le chargement complet de l'image.
- Cela évite les saccades visuelles à l'écran lors du défilement des données.

**Astuce :** Pas besoin de spécifier "px", le système comprend qu'il s'agit de pixels.
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
        "Les images peuvent servir de raccourcis tactiles. Enveloppe le capteur <img> dans un lien <a> pour qu'un clic redirige vers la console de détails du secteur.",
      hint: 'Place <img> a l\'intérieur d\'un <a href="details.html">...</a>.',
      briefing: {
        title: "Image cliquable",
        content: `
### Combiner <a> et <img>
Une image peut servir d'ancre de navigation. Il suffit de la placer à l'intérieur d'une balise **<a>**.

### Exemple
\`<a href="details.html">\`
\`  <img src="..." alt="Détails du module" />\`
\`</a>\`

**À retenir :** La balise <a> est un conteneur générique, elle accepte du texte, mais aussi d'autres éléments comme les images.
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
        "Une image sans explication technique est inutile pour l'équipage. Encadre le bloc de capture dans une <figure> et ajoute une légende explicative avec <figcaption>.",
      hint: 'Utilise <figure>...<figcaption>Texte de légende</figcaption></figure>.',
      briefing: {
        title: "Annoter une image",
        content: `
### Les balises <figure> et <figcaption>
- **<figure>** : regroupe une illustration (photo du dock, schéma électrique) et sa description.
- **<figcaption>** : définit la **légende** de l'illustration.

### Structure
\`<figure>\`
\`  <img src="..." alt="..." />\`
\`  <figcaption>Fig 1. Entrée du hangar de maintenance</figcaption>\`
\`</figure>\`
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
      bannerSub: "L'image est désormais documentee et indexable dans les archives du dock.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
