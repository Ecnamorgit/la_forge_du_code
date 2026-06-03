import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ARCHITECTURE REACT",
  title: "REACT &\nCOMPOSANTS",
  subtitle: "Decouvre la bibliotheque qui revolutionne le Front-End",
  totalXp: 280,
  completionBadge: "⚛",
  completionBadgeLabel: "ARCHITECTE UI",
  steps: [
    {
      startCode:
        "// Declare une fonction Radar() qui retourne <div>Scan en cours</div>.\n// N'oublie pas le return.\n",
      placeholder: "// function Radar() { ... }",
      narrator:
        "Bienvenue dans l'ere moderne, cadet. React permet de creer des blocs d'interface reutilisables appeles 'composants'. Cree ton premier composant fonctionnel 'Radar' qui retourne un div avec le texte 'Scan en cours'.",
      hint: "function Radar() {\n  return <div>Scan en cours</div>;\n}",
      briefing: {
        title: "Le Composant React",
        content: `
### Qu'est-ce qu'un composant ?
En React, une interface utilisateur est decoupee en petits morceaux independants. Un composant n'est rien d'autre qu'une **fonction JavaScript** qui retourne de l'interface (du JSX).

### Le JSX
C'est cette syntaxe etrange qui ressemble a du HTML directement ecrit dans le JavaScript :
\`function Bouton() {\`
\`  return <button>Clique-moi</button>;\`
\`}\`

### Regles d'or
1. Le nom de la fonction DOIT commencer par une **majuscule** (ex: \`Radar\`, pas \`radar\`).
2. Un composant doit retourner un seul element racine (on peut l'englober dans un \`<div>\` ou un fragment \`<>\`).
        `,
      },
      objectives: [
        { id: "o1a", label: "Declarer une fonction Radar avec une majuscule" },
        { id: "o1b", label: "Retourner <div>Scan en cours</div> en JSX" },
      ],
      missionIcon: "⚛",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER COMPOSANT",
      bannerIcon: "⚛",
      bannerTtl: "COMPOSANT INITIALISE",
      bannerSub: "Tu viens d'ecrire ton premier bloc React.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Modifie le composant pour accepter un parametre 'props'.\n// Affiche 'Cible : ' suivi de props.cible dans le div.\nfunction Radar() {\n  return <div>Scan en cours</div>;\n}\n",
      placeholder: "// function Radar(props) { ... }",
      narrator:
        "Un composant fige ne sert pas a grand chose. Modifie ton Radar pour qu'il accepte un parametre 'props' et affiche dynamiquement la 'cible' qu'on lui transmettra.",
      hint: "function Radar(props) {\n  return <div>Cible : {props.cible}</div>;\n}",
      briefing: {
        title: "Les Props (Proprietes)",
        content: `
### Passer des donnees
Les \`props\` sont le moyen d'envoyer des informations a un composant depuis l'exterieur. C'est l'equivalent des parametres pour une fonction classique.

### Comment lire une prop ?
React passe TOUTES les proprietes dans un seul objet, generalement appele \`props\`.
Pour afficher une donnee Javascript dans du JSX, on utilise des **accolades { }**.

\`function Salutation(props) {\`
\`  return <h1>Bonjour, {props.nom} !</h1>;\`
\`}\`

### Astuce : la destructuration
Plutot que d'ecrire \`props.cible\`, les developpeurs React destructurent souvent directement l'objet dans la definition :
\`function Radar({ cible }) {\`
\`  return <div>{cible}</div>;\`
\`}\`
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter l'objet props en parametre" },
        { id: "o2b", label: "Afficher la valeur avec les accolades {props.cible}" },
      ],
      missionIcon: "📨",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DONNEES DYNAMIQUES",
      bannerIcon: "📨",
      bannerTtl: "PROPS REÇUES",
      bannerSub: "Le composant est desormais parametrable de l'exterieur.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Utilise les accolades et une condition ternaire pour afficher un <span>ALERTE</span>\n// si props.menace est true.\nfunction Radar(props) {\n  return <div>Cible : {props.cible}</div>;\n}\n",
      placeholder: "// {props.menace ? <span>...</span> : null}",
      narrator:
        "Le radar doit reagir visuellement. S'il detecte une menace, il doit afficher une alerte. Utilise le rendu conditionnel en JSX pour accomplir cela.",
      hint: "function Radar(props) {\n  return <div>Cible : {props.cible} {props.menace && <span>ALERTE</span>}</div>;\n}",
      briefing: {
        title: "Le Rendu Conditionnel",
        content: `
### La logique dans le JSX
On ne peut pas utiliser l'instruction \`if\` classique directement a l'interieur du JSX. On utilise donc des expressions JavaScript grâce aux accolades \`{ }\`.

### L'operateur ternaire ( ? : )
C'est la technique la plus courante pour faire un "if / else" visuel :
\`<div>\`
\`  {props.enLigne ? <span>Connecte</span> : <span>Hors ligne</span>}\`
\`</div>\`

### L'operateur logique ET ( && )
Si tu n'as pas de "else" (rien a afficher si la condition est fausse), tu peux utiliser \`&&\`.
\`<div>\`
\`  {props.menace && <span>ALERTE</span>}\`
\`</div>\`
Si \`props.menace\` est vrai, le span s'affiche. Sinon, React l'ignore completement.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser une condition dans le JSX (ternaire ou &&)" },
        { id: "o3b", label: "Afficher le <span>ALERTE</span> si menace est true" },
      ],
      missionIcon: "🚨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "RENDU CONDITIONNEL",
      bannerIcon: "🚨",
      bannerTtl: "LOGIQUE INTEGREE",
      bannerSub: "L'interface s'adapte desormais a l'etat des donnees.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "function Radar({cible, menace}) {\n  return <div>{cible} {menace && '(!)'}</div>;\n}\n\n// Cree un composant TableauDeBord.\n// Il doit retourner un <div> contenant deux <Radar />.\n// L'un avec cible='Lune', l'autre avec cible='Mars' et menace={true}.\n",
      placeholder: "// function TableauDeBord() { return <div><Radar ... /></div>; }",
      narrator:
        "L'assemblage final ! Cree un composant parent 'TableauDeBord' qui va utiliser ton composant Radar plusieurs fois avec des donnees differentes. C'est la force absolue de React.",
      hint: "function TableauDeBord() {\n  return (\n    <div>\n      <Radar cible='Lune' />\n      <Radar cible='Mars' menace={true} />\n    </div>\n  );\n}",
      briefing: {
        title: "La Composition",
        content: `
### Imbriquer des composants
Un composant peut retourner d'autres composants ! C'est exactement comme utiliser des balises HTML.

\`function App() {\`
\`  return (\`
\`    <main>\`
\`      <Bouton texte="Valider" />\`
\`      <Bouton texte="Annuler" />\`
\`    </main>\`
\`  );\`
\`}\`

### Passer des Props dans le JSX
Quand tu utilises ton composant (\`<Radar />\`), c'est la que tu lui envoies ses variables (props).
- Pour une String : \`cible="Lune"\` (les guillemets suffisent)
- Pour un Booleen/Nombre/Variable : \`menace={true}\` (les accolades sont obligatoires pour executer du JavaScript).

**A retenir :** Une application React entiere n'est finalement qu'un grand arbre de composants imbriques les uns dans les autres !
        `,
      },
      objectives: [
        { id: "o4a", label: "Creer le composant TableauDeBord" },
        { id: "o4b", label: "Retourner deux composants <Radar /> avec les bonnes props" },
      ],
      missionIcon: "🧩",
      missionTag: "PROTOCOLE 04",
      missionTtl: "COMPOSITION",
      bannerIcon: "🛸",
      bannerTtl: "TABLEAU OPERATIONNEL",
      bannerSub: "Tu as compris l'essence de React : l'assemblage de composants.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
