export interface StepObjective {
  id: string;
  label: string;
}

export interface ValidationResult {
  ok: boolean;
  msg: string;
  obj?: string;
  objList?: string[];
  final?: boolean;
}

export interface Step {
  startCode: string;
  placeholder: string;
  narrator: string;
  hint: string;
  briefing: {
    title: string;
    content: string;
  };
  objectives: StepObjective[];
  bannerIcon: string;
  bannerTtl: string;
  bannerSub: string;
  bannerXp: string;
  missionIcon: string;
  missionTag: string;
  missionTtl: string;
  validate: (code: string) => ValidationResult;
}

export interface ChapterData {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  totalXp: number;
  steps: Step[];
  completionBadge: string;
  completionBadgeLabel: string;
}

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
        "Ingénieur, nous commençons par les fondations. Sans un protocole d'identification et une enceinte pressurisée, la base lunaire s'effondrera.",
      hint: 'Utilise <!DOCTYPE html> puis <html></html>.',
      briefing: {
        title: "Les Fondations de l'Acier Numérique",
        content: `
### Le Signal d'Amorce : <!DOCTYPE html>
Imaginez que vous envoyez un message à un alien. Avant de parler, vous devez lui dire quelle langue vous utilisez.
**<!DOCTYPE html>** n'est pas une balise HTML, c'est une "déclaration". Elle dit au navigateur (Chrome, Firefox) : *"Attention, je vais te parler en HTML5, la version la plus moderne et puissante du langage."*

### L'Enceinte de la Base : <html>
En HTML, tout fonctionne par **emboîtement**. La balise **<html>** est la "racine". Tout ce que vous écrirez par la suite devra se trouver à l'intérieur de cette balise.
- On l'ouvre au début : \`<html>\`
- On la ferme à la fin : \`</html>\` (le slash **/** indique la fermeture).

**Concept Clé :** Une balise est comme une boîte. Si vous ouvrez une boîte, vous devez la refermer pour que son contenu reste en sécurité !
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer <!DOCTYPE html>" },
        { id: "o1b", label: "Créer l'élément racine <html>" },
      ],
      missionIcon: "/Gemini_Generated_Image_jnb7fxjnb7fxjnb7.png",
      missionTag: "PROTOCOLE 01",
      missionTtl: "AMORÇAGE SYSTÈME",
      bannerIcon: "/Gemini_Generated_Image_jnb7fxjnb7fxjnb7.png",
      bannerTtl: "FONDATIONS POSÉES",
      bannerSub: "L'enceinte est stable et reconnue par les systèmes.",
      bannerXp: "⚡ +50 XP",
      validate(code: string): ValidationResult {
        const c = code.toLowerCase().trim();
        if (!c.includes("<!doctype html>")) {
          return { ok: false, msg: "Le signal <!DOCTYPE html> est manquant à l'appel." };
        }
        if (!c.includes("<html>") || !c.includes("</html>")) {
          return { ok: false, msg: "L'enceinte <html> doit être ouverte ET fermée." };
        }
        return { ok: true, msg: "Structure de base validée.", objList: ["o1a", "o1b"] };
      },
    },
    {
      startCode: "<!DOCTYPE html>\n<html>\n\n</html>",
      placeholder: "<!-- Configure le centre de contrôle -->",
      narrator:
        "Structure confirmée. Maintenant, installons le cerveau de la base. Le <head> gère tout ce qui n'est pas visible mais vital.",
      hint: 'Place un <head> dans ton <html>, puis un <title> à l\'intérieur.',
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
      missionIcon: "🧠",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CENTRE DE CONTRÔLE",
      bannerIcon: "📡",
      bannerTtl: "CERVEAU ACTIF",
      bannerSub: "La base Séléné est désormais répertoriée.",
      bannerXp: "⚡ +50 XP",
      validate(code: string): ValidationResult {
        const lower = code.toLowerCase();
        if (!lower.includes("<head>") || !lower.includes("</head>")) {
          return { ok: false, msg: "La section <head> est manquante." };
        }
        const titleMatch = code.match(/<title>([\s\S]*?)<\/title>/i);
        if (!titleMatch || !titleMatch[1].trim()) {
          return { ok: false, msg: "Chaque mission a besoin d'un nom dans <title>." };
        }
        return { ok: true, msg: "Configuration du cerveau terminée.", objList: ["o2a", "o2b"] };
      },
    },
    {
      startCode: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Mission Séléné</title>\n  </head>\n  \n</html>",
      placeholder: "<!-- Déploie le message final -->",
      narrator:
        "L'infrastructure est prête. Il est temps d'envoyer le premier signal visuel vers la Terre. Tout ce qui est visible doit être dans le <body>.",
      hint: 'Ajoute <body> après le </head>, puis un <h1>Hello World</h1> à l\'intérieur.',
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
      bannerSub: "Le signal a atteint la Terre. Félicitations, Ingénieur !",
      bannerXp: "⚡ +50 XP",
      validate(code: string): ValidationResult {
        const lower = code.toLowerCase();
        if (!lower.includes("<body>") || !lower.includes("</body>")) {
          return { ok: false, msg: "Où est le <body> ? C'est là que tout se passe !" };
        }
        const h1Match = code.match(/<h1>([\s\S]*?)<\/h1>/i);
        if (!h1Match || !h1Match[1].toLowerCase().includes("hello world")) {
          return { ok: false, msg: "Le signal <h1>Hello World</h1> n'est pas détecté." };
        }
        return { ok: true, msg: "Mission accomplie !", objList: ["o3a", "o3b"], final: true };
      },
    },
  ],
};
