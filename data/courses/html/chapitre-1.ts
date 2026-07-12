import type { ChapterData } from "./types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : SÉLÉNÉ",
  title: "ÉTABLISSEMENT\nDE LA BASE LUNAIRE",
  subtitle: "Construisez les fondations de l'exploration spatiale",
  totalXp: 150,
  completionBadge: "🌕",
  completionBadgeLabel: "INGÉNIEUR SÉLÉNÉ",
  steps: [
    {
      startCode: "",
      placeholder: "<!-- Écris ton code ici -->",
      narrator:
        "Cadet, nous commençons par les fondations. Sans un protocole d'identification et une enceinte pressurisée, la base lunaire s'effondrera.",
      hint: 'Utilise &lt;!DOCTYPE html&gt; puis &lt;html&gt;&lt;/html&gt;.',
      briefing: {
        title: "Les Fondations de l'Acier Numérique",
        content: `
### Le Signal d'Amorce : [[doc:html/doctype|<!DOCTYPE html>]]
Imaginez que vous envoyez un message à un alien. Avant de parler, vous devez lui dire quelle langue vous utilisez.
**<!DOCTYPE html>** n'est pas une balise HTML, c'est une "déclaration". Elle dit au navigateur (Chrome, Firefox) : *"Attention, je vais te parler en HTML5, la version la plus moderne et puissante du langage."*

### L'Enceinte de la Base : <html>
En HTML, tout fonctionne par **emboîtement**. La balise [[doc:html/html-element|<html>]] est la "racine". Tout ce que vous écrirez par la suite devra se trouver à l'intérieur de cette balise.
- On l'ouvre au début : \`<html>\`
- On la ferme à la fin : \`</html>\` (le slash **/** indique la fermeture).

**Concept Clé :** Une balise est comme une boîte. Si vous ouvrez une boîte, vous devez la refermer pour que son contenu reste en sécurité !
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer <!DOCTYPE html>" },
        { id: "o1b", label: "Créer l'élément racine <html>" },
      ],
      docRefs: ["html/doctype", "html/html-element"],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "AMORÇAGE SYSTÈME",
      bannerIcon: "🌕",
      bannerTtl: "FONDATIONS POSÉES",
      bannerSub: "L'enceinte est stable et reconnue par les systèmes.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode: "<!DOCTYPE html>\n<html>\n\n</html>",
      placeholder: "<!-- Configure le centre de contrôle -->",
      narrator:
        "Structure confirmée. Maintenant, installons le cerveau de la base. Le <head> gère tout ce qui n'est pas visible mais vital.",
      hint: 'Place un &lt;head&gt; dans ton &lt;html&gt;, puis un &lt;title&gt; à l\'intérieur.',
      briefing: {
        title: "Le Centre de Contrôle Invisible",
        content: `
### La Section <head>
Si le HTML était un humain, le **<head>** serait ses pensées. Vous ne voyez pas les pensées de quelqu'un en le regardant, mais elles dirigent tout.
Dans le **<head>**, on place les **métadonnées** :
- Le titre de la page (celui qui s'affiche sur l'onglet du navigateur).
- Les réglages de langue.
- Les liens vers les styles (les vêtements du site).

### L'Identifiant Unique : <title>
La balise **<title>** est cruciale. Elle donne un nom officiel à votre document. C'est ce titre que les moteurs de recherche (comme Google) affichent en premier.

**Règle d'or :** Le <head> se place toujours au début du <html>, avant le <body>.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter la section <head>" },
        { id: "o2b", label: "Définir un <title>" },
      ],
      docRefs: ["html/head"],
      missionIcon: "🧠",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CENTRE DE CONTRÔLE",
      bannerIcon: "📡",
      bannerTtl: "CERVEAU ACTIF",
      bannerSub: "La base Séléné est désormais répertoriée.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Mission Séléné</title>\n  </head>\n  \n</html>",
      placeholder: "<!-- Déploie le message final -->",
      narrator:
        "L'infrastructure est prête. Il est temps d'envoyer le premier signal visuel vers la Terre. Tout ce qui est visible doit être dans le <body>.",
      hint: 'Ajoute &lt;body&gt; après le &lt;/head&gt;, puis un &lt;h1&gt;Hello World&lt;/h1&gt; à l\'intérieur.',
      briefing: {
        title: "La Zone de Vie et le Signal Alpha",
        content: `
### La Zone de Déploiement : <body>
Le **<body>** est le cœur de votre page. Tout ce que vous mettez ici sera **visible** par l'utilisateur : images, textes, boutons, vidéos. C'est ici que l'aventure commence vraiment.

### La Tourelle de Communication : <h1>
En HTML, on hiérarchise les titres de **<h1>** (le plus important) à **<h6>** (le moins important).
- **<h1>** est le titre principal. Il ne doit y en avoir qu'un seul par page (comme il n'y a qu'un seul commandant par base).

### "Hello World"
C'est une tradition ancestrale chez les codeurs. Écrire "Hello World" est la preuve que votre système est vivant et capable de communiquer avec l'extérieur.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ouvrir la zone <body>" },
        { id: "o3b", label: "Émettre un <h1>Hello World</h1>" },
      ],
      missionIcon: "🚀",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SIGNAL DE VIE",
      bannerIcon: "🌍",
      bannerTtl: "SYSTÈME OPÉRATIONNEL",
      bannerSub: "Le signal a atteint la Terre. Félicitations, Cadet !",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
