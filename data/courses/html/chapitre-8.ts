import type { ChapterData } from "./types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "DOCK D'ORBITE : ALARME",
  title: "LA BALISE <PICTURE>",
  subtitle: "Configure les flux de communication audio et vidéo du dock",
  totalXp: 180,
  completionBadge: "🚨",
  completionBadgeLabel: "OFFICIER DES TRANSMISSIONS",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Signal d\'Urgence</title>\n  </head>\n  <body>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute une balise <video> avec controles -->",
      narrator:
        "Cadet, connectons le retour visuel de surveillance de la soute. Intègre un flux <video> muni de son interface de lecture, ciblant '/vidéos/emergency-dock.mp4'.",
      hint: 'Utilise <video src="/videos/emergency-dock.mp4" controls></video>.',
      briefing: {
        title: "L'intégration vidéo : <video> et controls",
        content: `
*« Un flux de surveillance sans commandes, c'est une image morte. Donne à ton \`<video>\` ses \`controls\` — l'opérateur doit garder la main. »* — **Kira**

### La balise <video>
Elle permet de lire nativement un flux vidéo de surveillance sans plugin tiers sur la soute du dock.

### L'attribut controls
**controls** affiche l'interface standard de lecture : bouton play/pause, barre de progression de la surveillance, volume et plein écran. Sans cet attribut, la vidéo apparaît comme une image fixe.

\`<video src="/videos/emergency-dock.mp4" controls></video>\`
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <video>" },
        { id: "o1b", label: "Activer l'attribut controls" },
      ],
      docRefs: ["html/video"],
      missionIcon: "🎬",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DIFFUSION VIDÉO",
      bannerIcon: "🎬",
      bannerTtl: "FLUX VIDÉO ACTIF",
      bannerSub: "L'équipage peut lire les briefings vidéo.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <title>Centre de diffusion</title>\n  </head>\n  <body>\n    <h1>Centre de diffusion</h1>\n    <video src="briefing.mp4" controls width="480"></video>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute une balise <audio> avec controles -->",
      narrator:
        "Certains messages ne sont qu'audio : transmissions radio, alertes vocales. Ajoute une balise <audio> avec controles.",
      hint: 'Ajoute <audio src="alerte.mp3" controls></audio>.',
      briefing: {
        title: "La balise <audio>",
        content: `
### Différence avec <video>
**<audio>** suit exactement les memes attributs que **<video>**, mais sans dimensions visuelles. C'est juste une barre de contrôle.

### Attributs clés
- **src** : chemin du fichier audio
- **controls** : barre play/pause/volume
- **autoplay** + **muted** : même règle que vidéo (autoplay impossible si non muted)
- **loop** : reboucle

### Format conseille
**MP3** ou **AAC** pour la compatibilité, **OGG/Opus** pour la qualité. Plusieurs <source> si tu veux les deux.

### Exemple
\`<audio controls>\`
\`  <source src="alerte.ogg" type="audio/ogg">\`
\`  <source src="alerte.mp3" type="audio/mpeg">\`
\`</audio>\`

**Astuce :** un audio sans controls est invisible. Si tu veux du son d'ambiance discret, utilise autoplay + loop + muted (mais l'utilisateur doit consentir).
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une balise <audio>" },
        { id: "o2b", label: "Activer l'attribut controls" },
      ],
      docRefs: ["html/audio"],
      missionIcon: "🔊",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CANAL AUDIO",
      bannerIcon: "🔊",
      bannerTtl: "TRANSMISSION RADIO OUVERTE",
      bannerSub: "Les alertes audio sont diffusees.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <title>Centre de diffusion</title>\n  </head>\n  <body>\n    <h1>Centre de diffusion</h1>\n    <video src="briefing.mp4" controls width="480"></video>\n    <audio src="alerte.mp3" controls></audio>\n    \n  </body>\n</html>',
      placeholder: "<!-- Utilise srcset pour des images adaptees a la resolution -->",
      narrator:
        "La même image affichée sur un écran 5K et sur un mobile gaspille soit la bande passante, soit la qualité. Utilise l'attribut srcset pour proposer plusieurs versions, le navigateur choisira.",
      hint: 'Sur un <img src="lune.jpg" alt="..." srcset="lune-small.jpg 480w, lune-large.jpg 1200w" sizes="(max-width: 600px) 480px, 1200px">.',
      briefing: {
        title: "Images responsive : srcset + sizes",
        content: `
### Le problème
Une image 4000x3000 px sert magnifiquement un écran retina, mais sur un mobile 4G elle coute 2 Mo de telechargement pour rien.

### La solution : srcset
**srcset** propose plusieurs versions de la même image, avec leur **largeur réelle** :

\`<img src="lune.jpg"\`
\`     alt="Surface lunaire"\`
\`     srcset="lune-small.jpg 480w,\`
\`             lune-large.jpg 1200w"\`
\`     sizes="(max-width: 600px) 480px, 1200px">\`

### Comment ca marche ?
- **srcset** : liste **fichier + largeur réelle** (480w = "ce fichier fait 480 px de large").
- **sizes** : indique au navigateur la **largeur d'affichage** prévue selon le contexte (media query).
- Le navigateur calcule et **choisit le fichier le plus adapte**.

### Résultat
- Sur mobile 600 px : télécharge lune-small.jpg
- Sur desktop 1200 px : télécharge lune-large.jpg
- **Tout le monde voit la même image, mais à la bonne résolution.**

**Astuce :** garde toujours **src** en fallback pour les vieux navigateurs.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser l'attribut srcset sur <img>" },
        { id: "o3b", label: "Définir l'attribut sizes" },
      ],
      docRefs: ["html/picture", "html/img"],
      missionIcon: "🖼",
      missionTag: "PROTOCOLE 03",
      missionTtl: "IMAGES ADAPTATIVES",
      bannerIcon: "🖼",
      bannerTtl: "BANDE PASSANTE OPTIMISEE",
      bannerSub: "Chaque écran reçoit la bonne résolution.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <title>Centre de diffusion</title>\n  </head>\n  <body>\n    <h1>Centre de diffusion</h1>\n    <video src="briefing.mp4" controls width="480"></video>\n    <audio src="alerte.mp3" controls></audio>\n    <img src="lune.jpg" alt="Surface lunaire" srcset="lune-small.jpg 480w, lune-large.jpg 1200w" sizes="(max-width: 600px) 480px, 1200px">\n    \n  </body>\n</html>',
      placeholder: "<!-- Utilise <picture> avec deux <source> pour servir webp puis fallback jpg -->",
      narrator:
        "Encore mieux que srcset : la balise <picture> permet de servir des formats différents (WebP moderne pour les navigateurs qui le supportent, JPG en fallback). Encapsule deux <source> et un <img> de secours.",
      hint: 'Ajoute <picture><source srcset="lune.webp" type="image/webp"><source srcset="lune.jpg" type="image/jpeg"><img src="lune.jpg" alt="Lune"></picture>.',
      briefing: {
        title: "La balise <picture>",
        content: `
### Pourquoi <picture> ?
**srcset** fait varier la **résolution**. **<picture>** fait varier le **format** ou le **media** (impression vs écran, orientation, etc.).

### Cas typique : WebP avec fallback JPG
**WebP** est 25 a 30 % plus leger que JPG, supporte par tous les navigateurs modernes mais pas IE11.

\`<picture>\`
\`  <source srcset="lune.webp" type="image/webp">\`
\`  <source srcset="lune.jpg" type="image/jpeg">\`
\`  <img src="lune.jpg" alt="Surface lunaire">\`
\`</picture>\`

### Comment ca marche ?
Le navigateur **lire les sources dans l'ordre** et prend la **première qu'il sait afficher**. Chrome lit la 1ere (webp OK), Safari ancien saute à la 2eme (jpg).

### Le <img> final
**Obligatoire** dans <picture>. Sert de fallback ultime ET porte l'attribut **alt** pour l'accessibilité.

**À retenir :** <picture> est l'outil definitif pour combiner formats modernes (WebP, AVIF) avec retro-compatibilité.
        `,
      },
      objectives: [
        { id: "o4a", label: "Encapsuler avec une balise <picture>" },
        { id: "o4b", label: "Avoir au moins 2 <source> + un <img> fallback" },
      ],
      docRefs: ["html/picture"],
      missionIcon: "🎞",
      missionTag: "PROTOCOLE 04",
      missionTtl: "MULTI-FORMAT",
      bannerIcon: "🎞",
      bannerTtl: "DIFFUSION OPTIMALE",
      bannerSub: "Tous les navigateurs recoivent le format optimal qu'ils savent lire.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};
