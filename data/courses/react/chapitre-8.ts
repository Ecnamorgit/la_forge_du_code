import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : RESEAU DE COMMANDEMENT",
  title: "CONTEXTE &\nuseReducer",
  subtitle: "Diffuse l'etat a toute la station sans le passer de main en main",
  totalXp: 280,
  completionBadge: "📡",
  completionBadgeLabel: "COORDINATEUR DE FLOTTE",
  steps: [
    {
      startCode:
        "// L'amiral doit etre lisible partout dans la station, sans le passer\n// en prop a chaque etage. Cree un contexte ContexteFlotte et diffuse\n// une valeur depuis App.\nfunction Pont() {\n  return <div>Pont de commandement</div>;\n}\n\nfunction App() {\n  return <Pont />;\n}\n",
      placeholder: "// const ContexteFlotte = createContext(null);",
      narrator:
        "Cadet, faire descendre une donnee etage par etage devient vite intenable : chaque composant intermediaire doit la transporter sans jamais s'en servir. Un contexte ouvre un canal direct entre le sommet de ton arbre et n'importe quel descendant. Ouvre ce canal.",
      hint: "const ContexteFlotte = createContext(null);\n\nfunction Pont() {\n  return <div>Pont de commandement</div>;\n}\n\nfunction App() {\n  return (\n    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>\n      <Pont />\n    </ContexteFlotte.Provider>\n  );\n}",
      briefing: {
        title: "Creer et diffuser un contexte",
        content: `
### Le probleme : le prop drilling
Une donnee au sommet, un composant qui en a besoin cinq etages plus bas. Sans contexte, les quatre composants intermediaires doivent la recevoir et la retransmettre, sans jamais l'utiliser.

C'est fragile : ajouter un etage oblige a modifier toute la chaine.

### Deux pieces
\`const ContexteFlotte = createContext(null);\`

L'argument est la **valeur par defaut** : ce que recoit un composant qui lit le contexte sans qu'aucun Provider ne l'englobe. \`null\` est un choix courant, qui fait echouer bruyamment plutot que silencieusement.

\`<ContexteFlotte.Provider value={...}>\`
\`  {children}\`
\`</ContexteFlotte.Provider>\`

Le Provider definit la valeur pour **tout son sous-arbre**.

### Ou declarer le contexte
En dehors de tout composant, au niveau du module. S'il etait declare dans un composant, chaque rendu en creerait un nouveau et les consommateurs perdraient le fil.

### Ce qu'un contexte n'est pas
Ce n'est pas un gestionnaire d'etat. Il ne stocke rien et ne re-rend rien tout seul : il **transporte** une valeur. L'etat, c'est toujours \`useState\` ou \`useReducer\` qui le tient — le contexte se contente de le diffuser.

### Le piege classique
Passer un objet litteral en \`value\` dans un composant qui se re-rend souvent : \`value={{ amiral }}\` cree un nouvel objet a chaque rendu, donc tous les consommateurs se re-rendent. Pour un cas reel, on memorise cette valeur.

**A retenir :** createContext au niveau du module, Provider autour du sous-arbre. Le contexte transporte, il ne stocke pas.
        `,
      },
      objectives: [
        { id: "o1a", label: "Creer le contexte avec createContext" },
        { id: "o1b", label: "Englober l'arbre dans un Provider avec une value" },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CANAL OUVERT",
      bannerIcon: "📡",
      bannerTtl: "DIFFUSION ACTIVE",
      bannerSub: "Ta valeur est disponible dans tout le sous-arbre.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Le canal est ouvert mais personne n'ecoute. Console est un\n// descendant profond de App : fais-lui lire l'amiral dans le contexte,\n// sans aucune prop.\nconst ContexteFlotte = createContext(null);\n\nfunction Console() {\n  return <div>Amiral : ???</div>;\n}\n\nfunction Pont() {\n  return <Console />;\n}\n",
      placeholder: "// const { amiral } = useContext(ContexteFlotte);",
      narrator:
        "Le canal est ouvert, mais aucun recepteur n'est branche. useContext accroche un composant au Provider le plus proche au-dessus de lui, quelle que soit la distance. Branche ta console — et remarque que Pont n'a rien a transporter.",
      hint: "const ContexteFlotte = createContext(null);\n\nfunction Console() {\n  const { amiral } = useContext(ContexteFlotte);\n  return <div>Amiral : {amiral}</div>;\n}\n\nfunction Pont() {\n  return <Console />;\n}\n\nfunction App() {\n  return (\n    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>\n      <Pont />\n    </ContexteFlotte.Provider>\n  );\n}",
      briefing: {
        title: "Consommer avec useContext",
        content: `
### Un seul appel
\`const valeur = useContext(ContexteFlotte);\`

On passe **l'objet contexte**, pas une chaine de caracteres. React remonte l'arbre et prend la \`value\` du premier Provider trouve.

### Ce que Pont devient
Rien a faire. Pont ne recoit aucune prop et n'en transmet aucune. C'est tout l'interet : les etages intermediaires redeviennent ignorants de ce qui les traverse.

### Destructurer directement
\`const { amiral } = useContext(ContexteFlotte);\`

Pratique, mais attention : si aucun Provider n'englobe le composant, \`useContext\` renvoie la valeur par defaut — \`null\` ici — et la destructuration plante. C'est justement le comportement voulu : une erreur franche vaut mieux qu'un \`undefined\` qui se propage.

### Le hook d'acces
Dans un vrai projet, on emballe l'acces dans un hook personnalise qui verifie la presence du Provider :

\`function useFlotte() {\`
\`  const ctx = useContext(ContexteFlotte);\`
\`  if (!ctx) throw new Error('useFlotte hors Provider');\`
\`  return ctx;\`
\`}\`

Tu sais deja faire ca — c'etait le chapitre precedent.

### Qui se re-rend
Tous les consommateurs d'un contexte se re-rendent quand sa \`value\` change. Un contexte trop large qui change souvent devient donc un cout : on les decoupe par nature de donnee.

**A retenir :** useContext(LeContexte) dans le consommateur, rien a changer dans les etages intermediaires.
        `,
      },
      objectives: [
        { id: "o2a", label: "Lire le contexte avec useContext" },
        { id: "o2b", label: "Afficher la valeur sans passer de prop" },
      ],
      missionIcon: "🎧",
      missionTag: "PROTOCOLE 02",
      missionTtl: "RECEPTEUR BRANCHE",
      bannerIcon: "🎧",
      bannerTtl: "SIGNAL RECU",
      bannerSub: "Ton composant profond lit la valeur sans intermediaire.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le niveau d'alerte monte et descend. Avec useState, la logique se\n// disperse dans les handlers. Ecris un reducteur qui gere les actions\n// 'monter' et 'descendre', puis branche-le avec useReducer.\nfunction Alerte() {\n  return <div>Niveau : ???</div>;\n}\n",
      placeholder: "// const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });",
      narrator:
        "Quand plusieurs actions modifient le meme etat selon des regles precises, useState eparpille ces regles dans autant de handlers. useReducer les rassemble en un seul endroit : une fonction qui prend l'etat et une action, et renvoie le nouvel etat. Les composants n'envoient plus que des intentions.",
      hint: "function reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    case 'descendre':\n      return { niveau: etat.niveau - 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Alerte() {\n  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });\n  return (\n    <div>\n      Niveau : {etat.niveau}\n      <button onClick={() => dispatch({ type: 'monter' })}>Monter</button>\n      <button onClick={() => dispatch({ type: 'descendre' })}>Descendre</button>\n    </div>\n  );\n}",
      briefing: {
        title: "useReducer : centraliser les transitions",
        content: `
### La signature
\`const [etat, dispatch] = useReducer(reducteur, etatInitial);\`

Deux sorties, comme \`useState\` — mais au lieu d'un setter, un \`dispatch\` qui envoie des **actions**.

### Le reducteur
Une fonction pure : meme etat plus meme action donnent toujours le meme resultat. Aucun fetch, aucun \`Math.random\`, aucune mutation.

\`function reducteur(etat, action) {\`
\`  switch (action.type) {\`
\`    case 'monter': return { niveau: etat.niveau + 1 };\`
\`    case 'descendre': return { niveau: etat.niveau - 1 };\`
\`    default: return etat;\`
\`  }\`
\`}\`

### Le cas default compte
Sans lui, une action inconnue renvoie \`undefined\` et ton etat disparait. Retourner \`etat\` inchange est le comportement sur.

### Retourner un nouvel objet, jamais muter
\`etat.niveau++; return etat;\` -> React ne voit aucun changement de reference, rien ne se re-rend.
\`return { niveau: etat.niveau + 1 };\` -> nouvelle reference, re-rendu.

C'est la meme regle d'immutabilite que pour les objets d'etat au chapitre 6.

### Quand preferer useReducer a useState
- plusieurs champs qui evoluent ensemble
- des transitions avec des regles (on ne descend pas sous zero)
- la meme logique declenchee depuis plusieurs endroits

Pour un booleen isole, \`useState\` reste plus lisible.

### Les actions portent une charge
\`dispatch({ type: 'definir', valeur: 3 })\` puis \`case 'definir': return { niveau: action.valeur };\`

**A retenir :** un reducteur pur rassemble toutes les transitions. Le composant envoie des intentions, pas des valeurs calculees.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ecrire un reducteur gerant deux actions" },
        { id: "o3b", label: "Brancher useReducer et envoyer une action" },
      ],
      missionIcon: "🎚",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TRANSITIONS CENTRALISEES",
      bannerIcon: "🎚",
      bannerTtl: "REDUCTEUR EN LIGNE",
      bannerSub: "Toutes tes regles de transition vivent au meme endroit.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Derniere manoeuvre : rends le niveau d'alerte pilotable depuis\n// n'importe ou. Diffuse etat ET dispatch dans le contexte, puis\n// fais agir Console sans lui passer une seule prop.\nconst ContexteAlerte = createContext(null);\n\nfunction reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Console() {\n  return <button>Monter l'alerte</button>;\n}\n",
      placeholder: "// value={{ etat, dispatch }}",
      narrator:
        "Voici la combinaison qui fait tenir les vraies applications : le reducteur tient l'etat et ses regles, le contexte le diffuse. N'importe quel descendant peut alors lire l'etat et declencher une transition, sans qu'aucun etage intermediaire ne transporte quoi que ce soit. Termine la manoeuvre, Cadet.",
      hint: "const ContexteAlerte = createContext(null);\n\nfunction reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Console() {\n  const { etat, dispatch } = useContext(ContexteAlerte);\n  return (\n    <button onClick={() => dispatch({ type: 'monter' })}>\n      Alerte {etat.niveau}\n    </button>\n  );\n}\n\nfunction App() {\n  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });\n  return (\n    <ContexteAlerte.Provider value={{ etat, dispatch }}>\n      <Console />\n    </ContexteAlerte.Provider>\n  );\n}",
      briefing: {
        title: "Contexte plus reducteur",
        content: `
### Le patron
L'etat vit dans un \`useReducer\` au sommet. On diffuse les deux sorties :

\`const [etat, dispatch] = useReducer(reducteur, initial);\`
\`<Contexte.Provider value={{ etat, dispatch }}>\`

N'importe quel descendant lit l'etat **et** declenche des transitions.

### Pourquoi dispatch est precieux ici
\`dispatch\` a une **identite stable** : React garantit que la fonction ne change pas entre les rendus. La diffuser ne provoque donc aucun re-rendu supplementaire, contrairement a un handler recree a chaque passage.

### Decouper en deux contextes
Dans une vraie application, on separe souvent :

\`<ContexteEtat.Provider value={etat}>\`
\`  <ContexteDispatch.Provider value={dispatch}>\`

Ainsi un composant qui ne fait qu'emettre des actions ne se re-rend pas quand l'etat change. C'est l'optimisation classique de ce patron.

### La limite a connaitre
Ce couple couvre enormement de besoins, et suffit a la majorite des applications. Il ne gere pas la mise en cache de donnees serveur ni la synchronisation reseau — c'est le domaine de bibliotheques dediees, que tu aborderas quand tu en auras vraiment besoin.

### Ce que tu sais faire maintenant
Composants et props, etat local, effets et nettoyage, navigation, listes, formulaires controles, hooks personnalises, et desormais etat partage. C'est le socle complet d'une interface React reelle.

**A retenir :** useReducer tient l'etat et ses regles, le contexte le diffuse. dispatch est stable, sa diffusion ne coute rien.
        `,
      },
      objectives: [
        { id: "o4a", label: "Diffuser etat et dispatch dans la value du Provider" },
        { id: "o4b", label: "Lire le contexte et envoyer une action depuis Console" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RESEAU COMPLET",
      bannerIcon: "📡",
      bannerTtl: "CURSUS REACT ACHEVE",
      bannerSub: "Toute la station lit et pilote le meme etat. Le socle React est complet, Cadet.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
