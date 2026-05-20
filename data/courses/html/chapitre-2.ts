import type { ChapterData } from "./types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : RELAIS ORBITAL",
  title: "SYSTEMES\nDE NAVIGATION",
  subtitle: "Apprenez a connecter les pages avec des liens HTML",
  totalXp: 200,
  completionBadge: "🛰",
  completionBadgeLabel: "OPERATEUR DE RELAIS",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute un premier lien dans le body -->",
      narrator:
        "Les systemes sont en ligne. Nous devons maintenant permettre a l'equipage de voyager d'un point a un autre du reseau. Un lien HTML est une passerelle.",
      hint: 'Ajoute une balise <a> avec un href, par exemple <a href="https://www.nasa.gov">Visiter la NASA</a>.',
      briefing: {
        title: "Les Portes de Transfert : les liens",
        content: `
### La balise <a>
La balise **<a>** signifie *anchor*. Elle sert a creer un lien cliquable.

### L'attribut href
Un lien n'est utile que s'il sait **ou aller**. C'est le role de **href**.
- \`<a href="https://www.nasa.gov">\`
- Le texte entre l'ouverture et la fermeture est ce que l'utilisateur clique.

### Exemple complet
\`<a href="https://www.nasa.gov">Visiter la NASA</a>\`

**Idee cle :** la balise cree la porte, l'attribut **href** indique la destination.
        `,
      },
      objectives: [
        { id: "o1a", label: "Creer une balise <a>" },
        { id: "o1b", label: 'Ajouter un attribut href a ce lien' },
      ],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIERE PASSERELLE",
      bannerIcon: "🚪",
      bannerTtl: "LIAISON ETABLIE",
      bannerSub: "Le premier couloir de navigation repond correctement.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="https://www.nasa.gov">Visiter la NASA</a>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute deux liens internes vers d'autres pages -->",
      narrator:
        "Tres bien. Nous savons pointer vers l'exterieur. Creons maintenant des routes internes pour deplacer l'equipage dans notre propre station.",
      hint: 'Ajoute deux liens comme <a href="index.html">Accueil</a> et <a href="missions.html">Missions</a>.',
      briefing: {
        title: "Les Trajets Internes",
        content: `
### Lier des pages de ton propre site
Un lien peut pointer vers un autre site, mais aussi vers une page de **ton propre projet**.

### Exemples
- \`<a href="index.html">Accueil</a>\`
- \`<a href="missions.html">Missions</a>\`

### Pourquoi c'est important ?
Un site devient utile quand l'utilisateur peut **circuler** d'une page a l'autre sans se perdre.

**Reflexe a adopter :** pense toujours au parcours de la personne qui visite la page.
        `,
      },
      objectives: [
        { id: "o2a", label: 'Ajouter un lien vers "index.html"' },
        { id: "o2b", label: 'Ajouter un lien vers "missions.html"' },
      ],
      missionIcon: "🧭",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ROUTES INTERNES",
      bannerIcon: "🗺",
      bannerTtl: "CARTE SYNCHRONISEE",
      bannerSub: "Les couloirs internes du relais sont accessibles.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="index.html">Accueil</a>\n    <a href="missions.html">Missions</a>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute un lien externe qui s'ouvre dans un nouvel onglet -->",
      narrator:
        "Nous allons maintenant ouvrir un canal externe sans quitter la station. Certains liens doivent s'ouvrir dans un nouvel onglet pour ne pas interrompre la navigation principale.",
      hint: 'Ajoute un lien vers https://developer.mozilla.org avec target="_blank".',
      briefing: {
        title: "Les Sorties Controlees",
        content: `
### target="_blank"
L'attribut **target="_blank"** demande au navigateur d'ouvrir le lien dans un **nouvel onglet**.

### Exemple
\`<a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\`

### Quand l'utiliser ?
Quand tu veux envoyer l'utilisateur vers une ressource externe sans lui faire perdre sa page actuelle.

**Niveau bonus :** retiens que **target** controle *comment* la destination s'ouvre.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter un lien externe supplementaire" },
        { id: "o3b", label: 'Configurer target="_blank"' },
      ],
      missionIcon: "🌐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "CANAL EXTERNE",
      bannerIcon: "✨",
      bannerTtl: "PORTAIL STABLE",
      bannerSub: "Le relais consulte l'exterieur sans perdre sa trajectoire.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="index.html">Accueil</a>\n    <a href="missions.html">Missions</a>\n    <a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\n    \n  </body>\n</html>',
      placeholder: "<!-- Organise les liens dans une vraie navigation -->",
      narrator:
        "Derniere etape. Nous ne voulons plus des liens disperses. Construisons un mini centre de navigation avec une balise <nav> claire et trois destinations utiles.",
      hint: 'Place trois liens dans un <nav> : Accueil, Missions, Contact.',
      briefing: {
        title: "Le Centre de Navigation",
        content: `
### La balise <nav>
Quand un groupe de liens sert a **naviguer dans le site**, on peut les rassembler dans une balise **<nav>**.

### Structure attendue
\`<nav>\`
\`  <a href="index.html">Accueil</a>\`
\`  <a href="missions.html">Missions</a>\`
\`  <a href="contact.html">Contact</a>\`
\`</nav>\`

### Pourquoi c'est mieux ?
Parce que ton code devient plus lisible, plus logique, et plus facile a maintenir.

**Objectif final :** passer de liens isoles a une vraie zone de navigation.
        `,
      },
      objectives: [
        { id: "o4a", label: "Creer une balise <nav>" },
        { id: "o4b", label: "Placer trois liens dans la navigation" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TABLEAU DE ROUTAGE",
      bannerIcon: "🚀",
      bannerTtl: "NAVIGATION COMPLETE",
      bannerSub:
        "Le relais orbital guide maintenant l'equipage entre toutes les sections.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
