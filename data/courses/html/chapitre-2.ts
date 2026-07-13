import type { ChapterData } from "./types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "DOCK D'ORBITE : TRANSMISSIONS",
  title: "SYSTEMES\nDE NAVIGATION",
  subtitle: "Cree des liens et navigue a l'interieur d'une meme page",
  totalXp: 220,
  completionBadge: "🛰",
  completionBadgeLabel: "OPERATEUR DE RELAIS",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a herf="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un lien externe vers https://developer.mozilla.org -->",
      spectreTrap:
        "J'ai retourné les lettres de ton `href`, Cadet. Ce lien ne mène nulle part. Répare l'attribut si tu veux ouvrir la passerelle.",
      narrator:
        "Premiere passerelle de transmission. Ouvre un canal externe vers la documentation MDN. Comme c'est un lien hors de la station, configure-le pour s'ouvrir dans un nouvel onglet.",
      hint: 'Ajoute <a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>.',
      briefing: {
        title: "Le lien externe avec target=\"_blank\"",
        content: `
*« Une station isolée est une station morte. Un lien relie les docks ; s'il sort de la station, ouvre-le dans un nouveau sas pour ne pas perdre ta session. »* — **Kira**

### La balise <a>
**<a>** signifie *anchor* (ancre). C'est l'element de passerelle qui rend un texte cliquable et connecte nos soutes.

### L'attribut href
**href** indique **ou aller**. Une URL complete pour la navigation hors-station, ou un chemin local interne.

### Exemple basique
\`<a href="https://developer.mozilla.org">Documentation MDN</a>\`

### target="_blank" : nouvel onglet
Quand le lien sort du dock d'orbite, c'est une bonne pratique de l'ouvrir **dans un nouvel onglet** pour ne pas faire perdre sa session a l'utilisateur sur la console de controle.

\`<a href="https://developer.mozilla.org" target="_blank">MDN</a>\`

### Securite : rel="noopener"
En complement de target="_blank", on ajoute souvent **rel="noopener noreferrer"** pour empecher la page externe d'acceder aux commandes de ton onglet d'origine. Les navigateurs modernes le font automatiquement, mais c'est plus propre de l'expliciter.

**Reflexe :** lien interne = meme soute. Lien externe = nouvel onglet (target="_blank").
        `,
      },
      objectives: [
        { id: "o1a", label: "Creer une balise <a> avec href" },
        { id: "o1b", label: 'Configurer target="_blank"' },
      ],
      docRefs: ["html/a"],
      missionIcon: "🌐",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CANAL EXTERNE",
      bannerIcon: "🌐",
      bannerTtl: "PASSERELLE EXTERNE OUVERTE",
      bannerSub: "Le lien s'ouvrira dans un nouvel onglet sans perdre la console du dock.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\n    \n  </body>\n</html>',
      placeholder: "<!-- Cree deux sections avec id, par ex. id=\"missions\" et id=\"contact\" -->",
      narrator:
        "Pour naviguer dans une meme soute, il faut d'abord poser des reperes. Cree deux <section> avec des id distincts : 'missions' et 'contact'. Chacune contient un <h2> et un <p>.",
      hint: '<section id="missions"><h2>Missions</h2><p>Operations en cours...</p></section>\n<section id="contact"><h2>Contact</h2><p>...</p></section>',
      briefing: {
        title: "Les reperes : id sur les sections",
        content: `
### L'attribut id
**id** est un **identifiant unique** dans tout le dock. Aucun autre element du dock ne doit porter le meme id.

### Pourquoi en avoir besoin ?
- Pour cibler un compartiment depuis un lien de passerelle (etape suivante).
- Pour cibler en CSS (\`#missions { ... }\`).
- Pour cibler en JS (\`document.getElementById('missions')\`).

### Syntaxe
\`<section id="missions">\`
\`  <h2>Missions</h2>\`
\`  <p>...</p>\`
\`</section>\`

### Regles de nommage
- Pas d'espace.
- Sensible a la casse.
- Doit etre unique sur la page.
- Convention : minuscules + tirets (\`mission-dock\`, pas \`MissionDock\`).

### Section vs Div
**<section>** est plus semantique qu'un <div> : elle annonce un **bloc thematique de la soute**, generalement avec son propre titre (h2/h3).

**Reflexe :** des qu'une zone de soute merite un id, c'est probablement une <section>.
        `,
      },
      objectives: [
        { id: "o2a", label: "Creer une <section> avec id" },
        { id: "o2b", label: "Creer une deuxieme <section> avec id different" },
      ],
      docRefs: ["html/section"],
      missionIcon: "📍",
      missionTag: "PROTOCOLE 02",
      missionTtl: "POSER LES REPERES",
      bannerIcon: "📍",
      bannerTtl: "REPERES ETABLIS",
      bannerSub: "Deux zones de la soute sont maintenant identifiables.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\n\n    <section id="missions"><h2>Missions</h2><p>Operations en cours...</p></section>\n    <section id="contact"><h2>Contact</h2><p>contact@nebula.test</p></section>\n    \n  </body>\n</html>',
      placeholder: "<!-- Ajoute deux liens internes qui pointent vers #missions et #contact -->",
      narrator:
        "Maintenant que les reperes de compartiment sont en place, cree deux liens qui sautent directement vers ces sections. Les ancres internes utilisent le caractere # suivi de l'id de la section.",
      hint: '<a href="#missions">Aller aux missions</a>\n<a href="#contact">Nous contacter</a>',
      briefing: {
        title: "Les ancres internes : href=\"#id\"",
        content: `
### Naviguer dans la meme soute
Un href qui commence par **#** ne pointe pas vers un another dock, mais vers **un id de la zone courante**.

### Syntaxe
\`<a href="#missions">Aller aux missions</a>\`

Quand l'utilisateur clique, la console de controle **fait defiler** l'affichage jusqu'au compartiment <section id="missions">.

### Cas d'usage classiques
- **Menu d'un dock long** : Accueil / Services / Tarifs / Contact qui scrollent vers chaque section.
- **"Retour au sommet"** avec un id sur le header : \`<a href="#top">Retour au sommet</a>\`.
- **Table des matieres** d'un journal de soute long.
- **FAQ** ou chaque question pointe vers sa reponse.

### Avantage par rapport a une vraie multi-page
Pas de rechargement, navigation instantanee, etat preserve.

### Astuce mobile
Le focus se positionne sur la section ciblee — utile pour les lecteurs d'ecran qui annoncent la nouvelle zone.

**A retenir :** \`href="#id"\` = navigation a l'interieur du dock d'orbite.
        `,
      },
      objectives: [
        { id: "o3a", label: 'Ajouter <a href="#missions">' },
        { id: "o3b", label: 'Ajouter <a href="#contact">' },
      ],
      docRefs: ["html/a", "html/section"],
      missionIcon: "🧭",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ANCRES INTERNES",
      bannerIcon: "🧭",
      bannerTtl: "SAUT VERIFIE",
      bannerSub: "Les liens internes scrollent vers leur cible. Essaie de cliquer dans l'apercu !",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Relais Orbital</title>\n  </head>\n  <body>\n    <h1>Relais Orbital</h1>\n    <a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>\n    <a href="#missions">Aller aux missions</a>\n    <a href="#contact">Nous contacter</a>\n\n    <section id="missions"><h2>Missions</h2><p>Operations en cours...</p></section>\n    <section id="contact"><h2>Contact</h2><p>contact@nebula.test</p></section>\n    \n  </body>\n</html>',
      placeholder: "<!-- Regroupe les liens dans une <nav> structuree -->",
      narrator:
        "Les liens de soute sont fonctionnels mais disperses. Place-les dans une <nav> juste apres le <h1> pour creer un tableau de routage propre. Les 3 liens (MDN externe, missions, contact) doivent etre dans cette nav.",
      hint: '<nav>\n  <a href="https://developer.mozilla.org" target="_blank">MDN</a>\n  <a href="#missions">Missions</a>\n  <a href="#contact">Contact</a>\n</nav>',
      briefing: {
        title: "La balise <nav>",
        content: `
### A quoi sert <nav> ?
**<nav>** declare qu'un groupe de liens forme une **zone de navigation principale**. C'est une balise **semantique** : elle donne du sens au routage de la station.

### Structure typique
\`<nav>\`
\`  <a href="#accueil">Accueil</a>\`
\`  <a href="#missions">Missions</a>\`
\`  <a href="#contact">Contact</a>\`
\`</nav>\`

### Pourquoi c'est mieux que des liens isoles ?
- **Accessibilite** : les lecteurs d'ecran proposent un raccourci \"passer au menu\" qui cible <nav>.
- **SEO** : Les robots d'indexation du web distinguent mieux les zones de navigation du contenu principal.
- **CSS** : tu peux styler tous les liens du menu avec un seul selecteur \`nav a { ... }\`.
- **Maintenance** : ton code est plus lisible.

### Multiple <nav> ?
Possible : un <nav> dans le <header> pour la nav principale, un another dans le <footer> pour les liens legaux. Mais une seule \"primary\".

### A retenir
Un <a> = un lien. Un <nav> = un groupe de liens qui sert a naviguer.

**Conseil :** des qu'il y a 2+ liens dans une meme zone qui servent a naviguer, utilise <nav>.
        `,
      },
      objectives: [
        { id: "o4a", label: "Encapsuler les liens dans une balise <nav>" },
        { id: "o4b", label: "Conserver les 3 liens (MDN + missions + contact)" },
      ],
      docRefs: ["html/nav"],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TABLEAU DE ROUTAGE",
      bannerIcon: "🚀",
      bannerTtl: "NAVIGATION COMPLETE",
      bannerSub: "Tu as construit une soute naviguable a partir d'une seule page de controle.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
