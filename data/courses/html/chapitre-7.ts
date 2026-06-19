import type { ChapterData } from "./types";

export const chapitre7: ChapterData = {
  slug: "chapitre-7",
  tag: "MISSION : TRANSPONDEUR ORBITAL",
  title: "META\nDONNEES",
  subtitle: "Programme le signal d'identification de ta page",
  totalXp: 220,
  completionBadge: "📡",
  completionBadgeLabel: "INGENIEUR DE SIGNAUX",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Mission Lunaire</title>\n  </head>\n  <body>\n    <h1>Mission Lunaire</h1>\n  </body>\n</html>',
      placeholder: "<!-- Configure lang sur <html> et ajoute <meta charset> et viewport -->",
      narrator:
        "Avant que les capteurs externes (navigateurs, robots, lecteurs) puissent comprendre ta page, il leur faut son signal d'identification. Configure la langue, l'encodage et le viewport.",
      hint: 'Mets <html lang="fr">, ajoute <meta charset="UTF-8"> en tete du <head>, et <meta name="viewport" content="width=device-width, initial-scale=1">.',
      briefing: {
        title: "Les meta de base",
        content: `
### lang
**<html lang="fr">** indique la langue principale du document. Les moteurs de recherche et lecteurs d'ecran l'utilisent. Sans cela, un lecteur d'ecran lirait du francais avec une voix anglaise.

### <meta charset="UTF-8">
Definit l'encodage des caracteres. **UTF-8** couvre tous les alphabets du monde (accents, emojis, ideogrammes). A placer **en premier** dans <head>.

### <meta name="viewport">
Cruciale pour le **responsive**. Sans elle, les navigateurs mobiles affichent la page comme un desktop reduit (illisible). Avec :
\`<meta name="viewport" content="width=device-width, initial-scale=1">\`
... la page s'adapte a la largeur de l'ecran.

**Reflexe :** ces 3 declarations sont obligatoires sur 100 % des pages modernes. Aucune exception.
        `,
      },
      objectives: [
        { id: "o1a", label: 'Definir lang="fr" sur <html>' },
        { id: "o1b", label: "Ajouter charset UTF-8 et viewport" },
      ],
      docRefs: ["html/meta"],
      missionIcon: "🔣",
      missionTag: "PROTOCOLE 01",
      missionTtl: "SIGNAUX FONDAMENTAUX",
      bannerIcon: "🔣",
      bannerTtl: "ENCODAGE STABILISE",
      bannerSub: "Langue, charset et viewport sont declares.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Mission Lunaire</title>\n  </head>\n  <body>\n    <h1>Mission Lunaire</h1>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une <meta name=\"description\"> claire et concise -->",
      narrator:
        "C'est cette description que les moteurs de recherche affichent sous le titre de ta page dans leurs resultats. Soigne-la : entre 120 et 160 caracteres, claire, accrocheuse.",
      hint: 'Ajoute <meta name="description" content="Decouvre la mission lunaire de Nebula Command : objectifs, equipage et calendrier."> dans <head>.',
      briefing: {
        title: "La meta description",
        content: `
### A quoi ca sert ?
La balise **<meta name="description">** ne s'affiche pas sur la page elle-meme. C'est le **resume** que les moteurs de recherche affichent dans leurs resultats (sous le titre, en gris).

### Bonne longueur
**120 a 160 caracteres**. Au-dela, Google coupe.

### Ecriture
- **Une phrase claire**, qui resume vraiment le contenu.
- **Mots-cles** importants en debut.
- **Pas de "Bienvenue sur..."** — c'est du texte mort pour Google.

### Exemple
\`<meta name="description" content="Tutoriel HTML interactif : maitrise les balises essentielles en 5 chapitres gamifies.">\`

**Astuce :** une description bien ecrite augmente le taux de clic depuis Google de 20 a 30 % selon les etudes.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une <meta name=\"description\">" },
        { id: "o2b", label: "Mettre un contenu non vide d'au moins 30 caracteres" },
      ],
      docRefs: ["html/meta"],
      missionIcon: "📝",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DESCRIPTION D'IDENTITE",
      bannerIcon: "📝",
      bannerTtl: "RESUME EMIS",
      bannerSub: "Les moteurs de recherche savent de quoi parle la page.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta name="description" content="Decouvre la mission lunaire de Nebula Command : objectifs, equipage et calendrier.">\n    <title>Mission Lunaire</title>\n  </head>\n  <body>\n    <h1>Mission Lunaire</h1>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute les balises Open Graph pour le partage social -->",
      narrator:
        "Quand un cadet partage ta page sur les reseaux sociaux, c'est une carte d'identite enrichie qui s'affiche. Configure les balises Open Graph pour qu'elle soit belle.",
      hint: 'Ajoute trois <meta property="og:title" content="...">, <meta property="og:description" content="..."> et <meta property="og:image" content="https://nebula.test/preview.png">.',
      briefing: {
        title: "Open Graph : la carte de visite sociale",
        content: `
### Le standard Open Graph (OG)
Cree par Facebook, adopte par tout le monde (LinkedIn, Twitter, WhatsApp, Slack...). Defini par des balises **<meta property="og:..."**> dans le <head>.

### Les 3 balises critiques
- **og:title** — titre dans la preview (peut differer de <title>)
- **og:description** — texte de la preview (peut differer de la meta description)
- **og:image** — image de previsualisation (URL absolue, 1200x630 px ideal)

### Exemple
\`<meta property="og:title" content="Mission Lunaire — Nebula Command">\`
\`<meta property="og:description" content="Rejoins l'equipage du protocole 09.">\`
\`<meta property="og:image" content="https://exemple.com/mission.png">\`

### Pourquoi c'est important ?
Une page sans Open Graph apparait dans WhatsApp/Slack comme un lien nu, sans image, sans accroche. Avec OG, c'est une carte visuelle qui appelle au clic.

**Astuce :** teste tes balises sur **opengraph.xyz** ou **metatags.io**.
        `,
      },
      objectives: [
        { id: "o3a", label: 'Ajouter <meta property="og:title">' },
        { id: "o3b", label: 'Ajouter og:description et og:image' },
      ],
      docRefs: ["html/open-graph"],
      missionIcon: "🔖",
      missionTag: "PROTOCOLE 03",
      missionTtl: "CARTE DE VISITE SOCIALE",
      bannerIcon: "🔖",
      bannerTtl: "PREVIEW DEPLOYEE",
      bannerSub: "Le partage social affiche maintenant titre, texte et image.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta name="description" content="Decouvre la mission lunaire de Nebula Command.">\n    <meta property="og:title" content="Mission Lunaire">\n    <meta property="og:description" content="Rejoins l\'equipage du protocole 09.">\n    <meta property="og:image" content="https://nebula.test/preview.png">\n    <title>Mission Lunaire</title>\n  </head>\n  <body>\n    <h1>Mission Lunaire</h1>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un favicon avec <link rel=\"icon\"> -->",
      narrator:
        "Derniere finition : la petite icone qui apparait dans l'onglet du navigateur. Ajoute un favicon.",
      hint: 'Ajoute <link rel="icon" href="/favicon.ico"> ou <link rel="icon" type="image/png" href="/favicon.png"> dans le <head>.',
      briefing: {
        title: "Le favicon",
        content: `
### Qu'est-ce qu'un favicon ?
La petite **icone** affichee dans l'onglet du navigateur, les favoris, l'historique. C'est l'identite minimale de ta page.

### Formats acceptes
- **favicon.ico** — historique, supporte partout (incluant les vieux navigateurs).
- **favicon.png** — plus moderne, transparence supportee. 32x32 ou 64x64 px recommandes.
- **favicon.svg** — vectoriel, s'adapte a tous les ecrans. Pas supporte par IE.

### Declaration
\`<link rel="icon" href="/favicon.ico">\`

### Bonne pratique multi-format
Tu peux declarer plusieurs <link> : le navigateur choisira celui qu'il prefere.
\`<link rel="icon" type="image/svg+xml" href="/icon.svg">\`
\`<link rel="icon" type="image/png" href="/icon.png">\`

**Astuce :** sans declaration, le navigateur cherche automatiquement /favicon.ico. C'est pratique mais explicite c'est plus propre.
        `,
      },
      objectives: [
        { id: "o4a", label: 'Ajouter <link rel="icon" href="...">' },
        { id: "o4b", label: "Le href pointe vers un fichier image" },
      ],
      docRefs: ["html/link"],
      missionIcon: "🪪",
      missionTag: "PROTOCOLE 04",
      missionTtl: "INSIGNE D'ONGLET",
      bannerIcon: "🪪",
      bannerTtl: "TRANSPONDEUR COMPLET",
      bannerSub: "La page a maintenant identite, encodage, description, preview sociale et favicon.",
      bannerXp: "⚡ +55 XP",
    },
  ],
};
