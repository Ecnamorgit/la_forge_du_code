import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : RÉSEAU DE COMMANDEMENT",
  title: "CONTEXTE &\nuseReducer",
  subtitle: "Diffuse l'état à toute la station sans le passer de main en main",
  totalXp: 280,
  completionBadge: "📡",
  completionBadgeLabel: "COORDINATEUR DE FLOTTE",
  steps: [
    {
      startCode:
        "// L'amiral doit etre lisible partout dans la station, sans le passer\n// en prop a chaque etage. Cree un contexte ContexteFlotte et diffuse\n// une valeur depuis App.\nfunction Pont() {\n  return <div>Pont de commandement</div>;\n}\n\nfunction App() {\n  return <Pont />;\n}\n",
      placeholder: "// const ContexteFlotte = createContext(null);",
      previewMount: "App",
      narrator:
        "Cadet, faire descendre une donnée etage par etage devient vite intenable : chaque composant intermédiaire doit la transporter sans jamais s'en servir. Un contexte ouvre un canal direct entre le sommet de ton arbre et n'importe quel descendant. Ouvre ce canal.",
      hint: "const ContexteFlotte = createContext(null);\n\nfunction Pont() {\n  return <div>Pont de commandement</div>;\n}\n\nfunction App() {\n  return (\n    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>\n      <Pont />\n    </ContexteFlotte.Provider>\n  );\n}",
      briefing: {
        title: "Créer et diffuser un contexte",
        content: `
### Le problème : le prop drilling
Une donnée au sommet, un composant qui en a besoin cinq etages plus bas. Sans contexte, les quatre composants intermediaires doivent la recevoir et la retransmettre, sans jamais l'utiliser.

C'est fragile : ajouter un etage oblige à modifier toute la chaîne.

### Deux pieces
\`const ContexteFlotte = createContext(null);\`

L'argument est la **valeur par défaut** : ce que reçoit un composant qui lit le contexte sans qu'aucun Provider ne l'englobe. \`null\` est un choix courant, qui fait echouer bruyamment plutôt que silencieusement.

\`<ContexteFlotte.Provider value={...}>\`
\`  {children}\`
\`</ContexteFlotte.Provider>\`

Le Provider définit la valeur pour **tout son sous-arbre**.

### Ou déclarer le contexte
En dehors de tout composant, au niveau du module. S'il était déclare dans un composant, chaque rendu en créerait un nouveau et les consommateurs perdraient le fil.

### Ce qu'un contexte n'est pas
Ce n'est pas un gestionnaire d'état. Il ne stocke rien et ne re-rend rien tout seul : il **transporte** une valeur. L'état, c'est toujours \`useState\` ou \`useReducer\` qui le tient — le contexte se contente de le diffuser.

### Le piège classique
Passer un objet litteral en \`value\` dans un composant qui se re-rend souvent : \`value={{ amiral }}\` cree un nouvel objet à chaque rendu, donc tous les consommateurs se re-rendent. Pour un cas réel, on memorise cette valeur.

**À retenir :** createContext au niveau du module, Provider autour du sous-arbre. Le contexte transporte, il ne stocke pas.
        `,
      },
      objectives: [
        { id: "o1a", label: "Créer le contexte avec createContext" },
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
      previewMount: "App",
      narrator:
        "Le canal est ouvert, mais aucun recepteur n'est branche. useContext accroche un composant au Provider le plus proche au-dessus de lui, quelle que soit la distance. Branche ta console — et remarque que Pont n'a rien à transporter.",
      hint: "const ContexteFlotte = createContext(null);\n\nfunction Console() {\n  const { amiral } = useContext(ContexteFlotte);\n  return <div>Amiral : {amiral}</div>;\n}\n\nfunction Pont() {\n  return <Console />;\n}\n\nfunction App() {\n  return (\n    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>\n      <Pont />\n    </ContexteFlotte.Provider>\n  );\n}",
      briefing: {
        title: "Consommer avec useContext",
        content: `
### Un seul appel
\`const valeur = useContext(ContexteFlotte);\`

On passe **l'objet contexte**, pas une chaîne de caractères. React remonte l'arbre et prend la \`value\` du premier Provider trouve.

### Ce que Pont devient
Rien a faire. Pont ne reçoit aucune prop et n'en transmet aucune. C'est tout l'interet : les etages intermediaires redeviennent ignorants de ce qui les traverse.

### Destructurer directement
\`const { amiral } = useContext(ContexteFlotte);\`

Pratique, mais attention : si aucun Provider n'englobe le composant, \`useContext\` renvoie la valeur par défaut — \`null\` ici — et la destructuration plante. C'est justement le comportement voulu : une erreur franche vaut mieux qu'un \`undefined\` qui se propage.

### Le hook d'accès
Dans un vrai projet, on emballe l'accès dans un hook personnalise qui vérifie la présence du Provider :

\`function useFlotte() {\`
\`  const ctx = useContext(ContexteFlotte);\`
\`  if (!ctx) throw new Error('useFlotte hors Provider');\`
\`  return ctx;\`
\`}\`

Tu sais déjà faire ca — c'était le chapitre precedent.

### Qui se re-rend
Tous les consommateurs d'un contexte se re-rendent quand sa \`value\` change. Un contexte trop large qui change souvent devient donc un coût : on les découpe par nature de donnée.

**À retenir :** useContext(LeContexte) dans le consommateur, rien à changer dans les etages intermediaires.
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
      bannerTtl: "SIGNAL REÇU",
      bannerSub: "Ton composant profond lit la valeur sans intermédiaire.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le niveau d'alerte monte et descend. Avec useState, la logique se\n// disperse dans les handlers. Ecris un reducteur qui gere les actions\n// 'monter' et 'descendre', puis branche-le avec useReducer.\nfunction Alerte() {\n  return <div>Niveau : ???</div>;\n}\n",
      placeholder: "// const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });",
      previewMount: "Alerte",
      narrator:
        "Cadet, quand plusieurs actions modifient le même état selon des règles précises, useState eparpille tes règles en autant de handlers. useReducer les rassemble au même endroit : une fonction qui prend l'état et une action, et renvoie le nouvel état. Fais que tes composants n'envoient que des intentions.",
      hint: "function reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    case 'descendre':\n      return { niveau: etat.niveau - 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Alerte() {\n  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });\n  return (\n    <div>\n      Niveau : {etat.niveau}\n      <button onClick={() => dispatch({ type: 'monter' })}>Monter</button>\n      <button onClick={() => dispatch({ type: 'descendre' })}>Descendre</button>\n    </div>\n  );\n}",
      briefing: {
        title: "useReducer : centraliser les transitions",
        content: `
### La signature
\`const [etat, dispatch] = useReducer(reducteur, etatInitial);\`

Deux sorties, comme \`useState\` — mais au lieu d'un setter, un \`dispatch\` qui envoie des **actions**.

### Le reducteur
Une fonction pure : même état plus même action donnent toujours le même résultat. Aucun fetch, aucun \`Math.random\`, aucune mutation.

\`function reducteur(etat, action) {\`
\`  switch (action.type) {\`
\`    case 'monter': return { niveau: etat.niveau + 1 };\`
\`    case 'descendre': return { niveau: etat.niveau - 1 };\`
\`    default: return etat;\`
\`  }\`
\`}\`

### Le cas default compte
Sans lui, une action inconnue renvoie \`undefined\` et ton état disparait. Retourner \`etat\` inchange est le comportement sur.

### Retourner un nouvel objet, jamais muter
\`etat.niveau++; return etat;\` -> React ne voit aucun changement de référence, rien ne se re-rend.
\`return { niveau: etat.niveau + 1 };\` -> nouvelle référence, re-rendu.

C'est la même règle d'immutabilite que pour les objets d'état au chapitre 6.

### Quand préférer useReducer a useState
- plusieurs champs qui evoluent ensemble
- des transitions avec des règles (on ne descend pas sous zéro)
- la même logique declenchee depuis plusieurs endroits

Pour un booléen isole, \`useState\` reste plus lisible.

### Les actions portent une charge
\`dispatch({ type: 'definir', valeur: 3 })\` puis \`case 'definir': return { niveau: action.valeur };\`

**À retenir :** un reducteur pur rassemble toutes les transitions. Le composant envoie des intentions, pas des valeurs calculees.
        `,
      },
      objectives: [
        { id: "o3a", label: "Écrire un reducteur gerant deux actions" },
        { id: "o3b", label: "Brancher useReducer et envoyer une action" },
      ],
      missionIcon: "🎚",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TRANSITIONS CENTRALISEES",
      bannerIcon: "🎚",
      bannerTtl: "REDUCTEUR EN LIGNE",
      bannerSub: "Toutes tes règles de transition vivent au même endroit.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Derniere manoeuvre : rends le niveau d'alerte pilotable depuis\n// n'importe ou. Diffuse etat ET dispatch dans le contexte, puis\n// fais agir Console sans lui passer une seule prop.\nconst ContexteAlerte = createContext(null);\n\nfunction reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Console() {\n  return <button>Monter l'alerte</button>;\n}\n",
      placeholder: "// value={{ etat, dispatch }}",
      previewMount: "App",
      narrator:
        "Voici la combinaison qui fait tenir les vraies applications : le reducteur tient l'état et ses règles, le contexte le diffuse. N'importe quel descendant peut alors lire l'état et déclencher une transition, sans qu'aucun etage intermédiaire ne transporte quoi que ce soit. Termine la manoeuvre, Cadet.",
      hint: "const ContexteAlerte = createContext(null);\n\nfunction reducteur(etat, action) {\n  switch (action.type) {\n    case 'monter':\n      return { niveau: etat.niveau + 1 };\n    default:\n      return etat;\n  }\n}\n\nfunction Console() {\n  const { etat, dispatch } = useContext(ContexteAlerte);\n  return (\n    <button onClick={() => dispatch({ type: 'monter' })}>\n      Alerte {etat.niveau}\n    </button>\n  );\n}\n\nfunction App() {\n  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });\n  return (\n    <ContexteAlerte.Provider value={{ etat, dispatch }}>\n      <Console />\n    </ContexteAlerte.Provider>\n  );\n}",
      briefing: {
        title: "Contexte plus reducteur",
        content: `
### Le patron
L'état vit dans un \`useReducer\` au sommet. On diffuse les deux sorties :

\`const [etat, dispatch] = useReducer(reducteur, initial);\`
\`<Contexte.Provider value={{ etat, dispatch }}>\`

N'importe quel descendant lit l'état **et** declenche des transitions.

### Pourquoi dispatch est precieux ici
\`dispatch\` a une **identité stable** : React garantit que la fonction ne change pas entre les rendus. La diffuser ne provoque donc aucun re-rendu supplementaire, contrairement a un handler recree à chaque passage.

### Decouper en deux contextes
Dans une vraie application, on sépare souvent :

\`<ContexteEtat.Provider value={etat}>\`
\`  <ContexteDispatch.Provider value={dispatch}>\`

Ainsi un composant qui ne fait qu'émettre des actions ne se re-rend pas quand l'état change. C'est l'optimisation classique de ce patron.

### La limite à connaître
Ce couple couvre enormement de besoins, et suffit à la majorité des applications. Il ne gère pas la mise en cache de données serveur ni la synchronisation réseau — c'est le domaine de bibliotheques dediees, que tu aborderas quand tu en auras vraiment besoin.

### Ce que tu sais faire maintenant
Composants et props, état local, effets et nettoyage, navigation, listes, formulaires controles, hooks personnalises, et désormais état partage. C'est le socle complet d'une interface React réelle.

**À retenir :** useReducer tient l'état et ses règles, le contexte le diffuse. dispatch est stable, sa diffusion ne coute rien.
        `,
      },
      objectives: [
        { id: "o4a", label: "Diffuser état et dispatch dans la value du Provider" },
        { id: "o4b", label: "Lire le contexte et envoyer une action depuis Console" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RÉSEAU COMPLET",
      bannerIcon: "📡",
      bannerTtl: "CURSUS REACT ACHEVE",
      bannerSub: "Toute la station lit et pilote le même état. Le socle React est complet, Cadet.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
