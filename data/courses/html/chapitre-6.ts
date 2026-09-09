import type { ChapterData } from "./types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "DOCK D'ORBITE : ACCESSIBILITÉ",
  title: "ACCESSIBILITÉ :\nALT ET ARIA",
  subtitle: "Structure le centre opérationnel du dock et configure l'accessibilité",
  totalXp: 200,
  completionBadge: "♿",
  completionBadgeLabel: "EXPERT EN ACCESSIBILITÉ",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <title>Station Nebula</title>\n  </head>\n  <body>\n    <h1>Station Nebula</h1>\n    <p>Bienvenue, Cadet.</p>\n  </body>\n</html>',
      placeholder: "<!-- Encadre la page avec <header>, <main> et <footer> -->",
      narrator:
        "Cadet, nous devons poser l'architecture sémantique de la console de contrôle principale. Ajoute les compartiments physiques <header>, <main> et <footer>.",
      hint: 'Place le <h1> dans un <header>, le <p> dans un <main>, et ajoute un <footer> en bas avec ton nom ou un copyright.',
      briefing: {
        title: "Les compartiments semantiques",
        content: `
*« Une console où tout se ressemble, personne ne s'y repère — surtout pas les lecteurs d'écran. Nomme tes zones : \`header\`, \`main\`, \`footer\`. La structure, c'est déjà de l'accessibilité. »* — **Kira**

### Pourquoi sémantique ?
Les balises **<div>** marchent partout mais ne disent rien. Les balises **semantiques** indiquent au navigateur, aux moteurs de recherche et aux lecteurs d'écran **a quoi sert** chaque zone.

### Les 3 compartiments incontournables
- **<header>** : tête de page. Logo, titre principal, parfois la navigation.
- **<main>** : contenu principal et unique de la page. Une seule par page.
- **<footer>** : pied de page. Copyright, mentions légales, liens secondaires.

### Exemple
\`<header><h1>Mon site</h1></header>\`
\`<main><p>Contenu...</p></main>\`
\`<footer><small>(c) 2026</small></footer>\`

**Réflexe :** ouvre toujours un <main> qui enveloppe le contenu unique. C'est lui que les lecteurs d'écran annoncent en premier.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <header>" },
        { id: "o1b", label: "Ajouter <main> et <footer>" },
      ],
      docRefs: ["html/header", "html/main", "html/footer"],
      missionIcon: "🏛",
      missionTag: "PROTOCOLE 01",
      missionTtl: "STRUCTURE DE BASE",
      bannerIcon: "🏛",
      bannerTtl: "PLAN DE STATION POSE",
      bannerSub: "Header, main et footer sont en place.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <title>Station Nebula</title>\n  </head>\n  <body>\n    <header>\n      <h1>Station Nebula</h1>\n      \n    </header>\n    <main>\n      <p>Bienvenue, Cadet.</p>\n    </main>\n    <footer><small>(c) 2026</small></footer>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute une <nav> avec au moins 3 liens dans le header -->",
      narrator:
        "Aucune station n'est complète sans routage sémantique. Ajoute une balise <nav> dans le header avec au moins trois liens pointant vers des destinations internes.",
      hint: 'Place a l\'intérieur du <header> une <nav> contenant trois balises <a href="..."> distinctes.',
      briefing: {
        title: "La balise <nav>",
        content: `
### A quoi sert <nav> ?
**<nav>** déclare qu'un groupe de liens est une **zone de navigation principale**. Les lecteurs d'écran proposent souvent un raccourci "passer au menu" — ils ciblent précisément cette balise.

### Bonne pratique
Une page peut avoir **plusieurs <nav>** (header + footer, par exemple) mais une seule "principale" — souvent celle du header.

### Exemple
\`<nav>\`
\`  <a href="/">Accueil</a>\`
\`  <a href="/missions">Missions</a>\`
\`  <a href="/contact">Contact</a>\`
\`</nav>\`

**Astuce :** on ne met pas TOUS les liens de la page dans une <nav>, seulement ceux qui forment un menu logique.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une balise <nav>" },
        { id: "o2b", label: "Placer au moins 3 liens dedans" },
      ],
      docRefs: ["html/nav"],
      missionIcon: "🧭",
      missionTag: "PROTOCOLE 02",
      missionTtl: "PASSERELLE DE NAVIGATION",
      bannerIcon: "🧭",
      bannerTtl: "ROUTES BALISEES",
      bannerSub: "La navigation principale est déclarée comme telle.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <title>Station Nebula</title>\n  </head>\n  <body>\n    <header>\n      <h1>Station Nebula</h1>\n      <nav>\n        <a href="/">Accueil</a>\n        <a href="/missions">Missions</a>\n        <a href="/contact">Contact</a>\n      </nav>\n    </header>\n    <main>\n      \n    </main>\n    <footer><small>(c) 2026</small></footer>\n  </body>\n</html>',
      placeholder: "<!-- Dans <main>, ajoute un <article> et une <section> -->",
      narrator:
        "Le compartiment principal doit être structuré pour le log de soute. Place un <article> (qui contient les informations logistiques globales) enveloppant lui-même une <section> (contenant le briefing détaillé de la mission).",
      hint: 'A l\'intérieur de <main>, ouvre <article>...</article>. A l\'intérieur, place une <section> avec un <h2>Briefing</h2> et un <p>.',
      briefing: {
        title: "Article vs Section vs Aside",
        content: `
### <article>
Un **contenu autonome** : on peut le sortir de la page et il garde son sens. Article de blog, fiche produit, post de forum, mission complétée.

### <section>
Un **regroupement thématique** à l'intérieur d'une page ou d'un article. Une section a généralement son **<h2>** ou **<h3>** d'en-tête.

### <aside>
Un **contenu connexe** mais séparable : encart, citation, "voir aussi", barre laterale.

### Hiérarchie typique
\`<main>\`
\`  <article>\`
\`    <h2>Titre de la mission</h2>\`
\`    <section>...</section>\`
\`    <section>...</section>\`
\`    <aside>Note de bas de mission</aside>\`
\`  </article>\`
\`</main>\`

**Réflexe :** si tu hesites entre <section> et <div>, utilise <section> seulement si tu y ajoutes un titre (<h2>, <h3>).
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une balise <article>" },
        { id: "o3b", label: "Inclure une <section> à l'intérieur" },
      ],
      docRefs: ["html/article", "html/section"],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "DECOUPAGE THÉMATIQUE",
      bannerIcon: "📐",
      bannerTtl: "BLOCS DELIMITES",
      bannerSub: "Le contenu principal est structure en article et sections.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <title>Station Nebula</title>\n  </head>\n  <body>\n    <header>\n      <h1>Station Nebula</h1>\n      <nav>\n        <a href="/">Accueil</a>\n        <a href="/missions">Missions</a>\n        <a href="/contact">Contact</a>\n      </nav>\n    </header>\n    <main>\n      <article>\n        <h2>Mission Lunaire</h2>\n        <section>\n          <p>Briefing en cours.</p>\n          <img src="lune.png">\n        </section>\n      </article>\n    </main>\n    <footer><small>(c) 2026</small></footer>\n  </body>\n</html>',
      placeholder: "<!-- Rends l'image accessible et marque le lien actif -->",
      narrator:
        "Dernière étape : rends la console de bord accessible pour tous les officiers. Ajoute un attribut 'alt' descriptif sur l'image du dock, et marque le lien actif de la navigation avec 'aria-current=\"page\"'.",
      hint: 'Sur le <img>, ajoute alt="Surface lunaire vue depuis l\'orbite". Sur le premier <a href="/">, ajoute aria-current="page".',
      briefing: {
        title: "Accessibilité : alt et ARIA",
        content: `
### L'attribut alt
**alt** décrit l'image pour les lecteurs d'écran. **Toujours present** sur un <img>.
- **Image porteuse de sens** : decris ce qu'elle montre.
- **Image décorative pure** : alt="" (chaîne vide) — le lecteur d'écran l'ignorera.

### ARIA en 30 secondes
**ARIA** (Accessible Rich Internet Applications) ajoute des attributs invisibles aux yeux mais visibles aux lecteurs d'écran.

### aria-current
Marque l'élément actif d'un groupe. Le plus courant : indiquer la page courante dans une navigation.

\`<a href="/" aria-current="page">Accueil</a>\`

### Pourquoi cela compte ?
Un site accessible n'est pas un site "pour handicapes" : c'est un site **mieux concu pour tout le monde**. Les robots de Google sont aussi des "non-voyants" — ils s'appuient sur ces memes attributs.

**Réflexe :** chaque image porteuse de sens merite son alt, chaque élément interactif merite son étiquette.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter l'attribut alt à l'image" },
        { id: "o4b", label: 'Marquer le lien actif avec aria-current="page"' },
      ],
      docRefs: ["html/aria", "html/img"],
      missionIcon: "♿",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ACCESSIBILITÉ UNIVERSELLE",
      bannerIcon: "♿",
      bannerTtl: "STATION UNIVERSELLEMENT ACCESSIBLE",
      bannerSub: "Tous les cadets peuvent naviguer, y compris ceux qui utilisent un lecteur d'écran.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};
