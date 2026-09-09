import type { ChapterData } from "@/data/courses/html/types";

export const chapitre7: ChapterData = {
  slug: "chapitre-7",
  tag: "MISSION : MODULES REUTILISABLES",
  title: "HOOKS\nPERSONNALISES",
  subtitle: "Extrais ta logique dans des modules que tu rebranche partout",
  totalXp: 280,
  completionBadge: "🔧",
  completionBadgeLabel: "FORGERON DE HOOKS",
  steps: [
    {
      startCode:
        "// Ce composant melange sa logique de comptage et son affichage.\n// Extrais la logique dans un hook personnalise nomme useCompteur,\n// puis appelle-le depuis Reacteur.\nfunction Reacteur() {\n  const [poussee, setPoussee] = useState(0);\n  const augmenter = () => setPoussee(poussee + 1);\n\n  return <button onClick={augmenter}>Poussee : {poussee}</button>;\n}\n",
      placeholder: "// function useCompteur() { ... }",
      previewMount: "Reacteur",
      narrator:
        "Cadet, tu viens d'écrire trois fois la même logique de comptage dans trois modules différents. Un hook personnalise est une fonction prefixee par use qui appelle d'autres hooks : tu l'écris une fois, tu la rebranche partout. Sors cette logique de ton composant.",
      hint: "function useCompteur() {\n  const [poussee, setPoussee] = useState(0);\n  const augmenter = () => setPoussee(poussee + 1);\n  return { poussee, augmenter };\n}\n\nfunction Reacteur() {\n  const { poussee, augmenter } = useCompteur();\n  return <button onClick={augmenter}>Poussee : {poussee}</button>;\n}",
      briefing: {
        title: "Extraire un hook personnalise",
        content: `
### Ce qu'est un hook personnalise
Une **fonction JavaScript ordinaire** dont le nom commence par \`use\` et qui appelle au moins un autre hook.

Il n'y a pas d'API spéciale, pas de classe à etendre, rien à importer. C'est une convention de nommage plus une fonction.

### Pourquoi le préfixe use est obligatoire
React et les outils de lint se servent du préfixe pour savoir qu'il faut appliquer les règles des hooks à l'intérieur. Une fonction \`compteur()\` qui appelle \`useState\` ne sera pas verifiee et cassera silencieusement.

\`function useCompteur() { ... }\` -> reconnu comme hook
\`function compteur() { ... }\` -> considere comme fonction normale, aucune vérification

### Le mouvement d'extraction
On deplace les appels de hooks et la logique qui va avec **hors** du composant, dans la fonction \`useXxx\`. Le composant se contente d'appeler le hook.

\`function useCompteur() {\`
\`  const [n, setN] = useState(0);\`
\`  const augmenter = () => setN(n + 1);\`
\`  return { n, augmenter };\`
\`}\`

### Ce qui n'est PAS partage
Chaque appel de hook cree son **propre état**. Deux composants qui appellent \`useCompteur()\` ont deux compteurs independants.

C'est la différence avec un contexte : un hook partage de la **logique**, pas des **données**. Pour partager des données, il faut un contexte — c'est le chapitre suivant.

### Le piège classique
Extraire la logique mais oublier de retourner ce dont le composant a besoin. Le hook fonctionne, le composant n'a rien à afficher.

**À retenir :** un hook personnalise = une fonction prefixee use qui appelle d'autres hooks. Elle partage la logique, jamais l'état.
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer un hook useCompteur qui appelle useState" },
        { id: "o1b", label: "Appeler useCompteur depuis le composant" },
      ],
      missionIcon: "🔧",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER MODULE",
      bannerIcon: "🔧",
      bannerTtl: "LOGIQUE EXTRAITE",
      bannerSub: "Ta logique de comptage vit maintenant hors du composant.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Ce hook garde son etat pour lui : le composant ne peut rien afficher.\n// Fais-lui retourner la valeur ET l'action, puis destructure-les\n// dans Bouclier.\nfunction useBouclier() {\n  const [charge, setCharge] = useState(100);\n  const recharger = () => setCharge(100);\n}\n\nfunction Bouclier() {\n  return <div>Bouclier : ???</div>;\n}\n",
      placeholder: "// return { charge, recharger };",
      previewMount: "Bouclier",
      narrator:
        "Un hook qui ne retourne rien est un module scelle : sa logique tourne, mais aucun composant ne peut la lire. Définis son contrat de sortie — la valeur à afficher et les actions qui la modifient — puis recupere-les par destructuration.",
      hint: "function useBouclier() {\n  const [charge, setCharge] = useState(100);\n  const recharger = () => setCharge(100);\n  return { charge, recharger };\n}\n\nfunction Bouclier() {\n  const { charge, recharger } = useBouclier();\n  return (\n    <div>\n      Bouclier : {charge}%\n      <button onClick={recharger}>Recharger</button>\n    </div>\n  );\n}",
      briefing: {
        title: "Le contrat de retour",
        content: `
### Objet ou tableau ?
Les deux marchent. La convention depend du nombre de valeurs.

**Tableau** quand il y à deux valeurs et que l'ordre est evident — c'est ce que fait \`useState\` lui-même :
\`const [valeur, setValeur] = useEtat();\`

**Objet** des qu'il y en à plus, ou que les noms comptent :
\`const { charge, recharger, estVide } = useBouclier();\`

### Pourquoi l'objet est souvent preferable
Avec un tableau, l'appelant doit respecter l'ordre et tout prendre dans l'ordre. Avec un objet, il prend ce qui l'interesse :

\`const { recharger } = useBouclier();  // je n'ai besoin que de l'action\`

Et ajouter une valeur au hook ne casse aucun appelant existant.

### Retourner des actions, pas le setter brut
\`return { charge, setCharge };\` -> l'appelant peut écrire n'importe quoi
\`return { charge, recharger };\` -> l'appelant ne peut faire que ce que tu autorises

Exposer des actions nommées plutôt que le setter, c'est ce qui rend le hook reellement réutilisable : la règle metier reste dans le hook.

### Le piège classique
Oublier le \`return\`. La fonction s'execute, l'état existe, et le composant reçoit \`undefined\` — puis plante à la destructuration.

**À retenir :** un hook expose une valeur et des actions nommées. Objet des qu'il y à plus de deux sorties.
        `,
      },
      objectives: [
        { id: "o2a", label: "Retourner la valeur et l'action depuis le hook" },
        { id: "o2b", label: "Destructurer le résultat dans le composant" },
      ],
      missionIcon: "📤",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CONTRAT DE SORTIE",
      bannerIcon: "📤",
      bannerTtl: "MODULE BRANCHE",
      bannerSub: "Ton hook expose sa valeur et son action au composant.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Ecris un hook useLargeurHublot qui suit la largeur de la fenetre.\n// Il doit : stocker la largeur, s'abonner a l'evenement 'resize',\n// et se DESABONNER dans le cleanup du useEffect.\n// Puis affiche la largeur dans Hublot.\nfunction Hublot() {\n  return <div>Largeur du hublot : ???</div>;\n}\n",
      placeholder: "// window.addEventListener('resize', ...) puis removeEventListener",
      previewMount: "Hublot",
      narrator:
        "Cadet, ton hublot doit connaître sa taille. Combine un état et un effet dans ce hook : abonne-toi à l'événement du navigateur et, surtout, desabonne-toi quand le composant disparait. Sans ce nettoyage, chaque montage laisse un ecouteur fantome derrière toi.",
      hint: "function useLargeurHublot() {\n  const [largeur, setLargeur] = useState(window.innerWidth);\n\n  useEffect(() => {\n    const surResize = () => setLargeur(window.innerWidth);\n    window.addEventListener('resize', surResize);\n    return () => window.removeEventListener('resize', surResize);\n  }, []);\n\n  return largeur;\n}\n\nfunction Hublot() {\n  const largeur = useLargeurHublot();\n  return <div>Largeur du hublot : {largeur}px</div>;\n}",
      briefing: {
        title: "Un hook qui s'abonne et se desabonne",
        content: `
### Le patron abonnement / desabonnement
C'est le cas d'usage le plus courant d'un hook personnalise : encapsuler un abonnement pour que l'appelant n'ait pas a y penser.

\`useEffect(() => {\`
\`  const handler = () => setLargeur(window.innerWidth);\`
\`  window.addEventListener('resize', handler);\`
\`  return () => window.removeEventListener('resize', handler);\`
\`}, []);\`

### Pourquoi la fonction de cleanup est obligatoire
Sans elle, chaque montage du composant ajoute un ecouteur, et aucun n'est jamais retire. Après dix navigations, dix ecouteurs tournent en parallele et mettent à jour un état qui n'existe plus. React affiche alors un avertissement de fuite mémoire.

### La MÊME référence de fonction
\`removeEventListener\` ne retire un ecouteur que si on lui passe **exactement la même fonction** que celle donnée a \`addEventListener\`.

\`addEventListener('resize', () => setL(w));\`
\`removeEventListener('resize', () => setL(w));\`

Ces deux fonctions flechees sont deux objets différents : le retrait ne fait rien. D'ou la variable intermédiaire \`handler\`.

### Le tableau de dependances vide
\`[]\` signifie : abonne-toi une fois au montage, desabonne-toi au demontage. C'est ce qu'on veut pour un ecouteur global.

### Le piège classique
Lire \`window.innerWidth\` directement dans le rendu au lieu de le mettre en état. La valeur ne declenche aucun re-rendu : l'affichage se figera à la première mesure.

**À retenir :** tout abonnement dans un useEffect doit avoir son desabonnement dans le cleanup, avec la même référence de fonction.
        `,
      },
      objectives: [
        { id: "o3a", label: "S'abonner a resize dans un useEffect du hook" },
        { id: "o3b", label: "Se desabonner dans la fonction de cleanup" },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ABONNEMENT PROPRE",
      bannerIcon: "📡",
      bannerTtl: "HUBLOT CALIBRE",
      bannerSub: "Ton hook s'abonne au navigateur et nettoie derrière lui.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Ce code viole les regles des hooks : l'appel a useState est\n// enferme dans un if. React perd le fil de l'ordre des hooks.\n// Remonte l'appel au niveau superieur du composant et garde le\n// comportement conditionnel dans l'affichage.\nfunction Panneau({ visible }) {\n  if (visible) {\n    const [mode, setMode] = useState('auto');\n    return <div>Mode : {mode}</div>;\n  }\n  return null;\n}\n",
      placeholder: "// Appelle useState AVANT tout if / return",
      previewMount: "Panneau",
      narrator:
        "Le Spectre adore ce genre de faille. React identifie chaque hook par son ORDRE d'appel, pas par son nom : si un if saute un appel, tous les hooks suivants se decalent et lisent l'état du voisin. Remonte cet appel tout en haut du composant.",
      hint: "function Panneau({ visible }) {\n  const [mode, setMode] = useState('auto');\n\n  if (!visible) return null;\n\n  return <div>Mode : {mode}</div>;\n}",
      briefing: {
        title: "Les règles des hooks",
        content: `
### La règle unique
**Toujours appeler les hooks au niveau supérieur du composant ou du hook.** Jamais dans un \`if\`, une boucle, un \`try\`, ou après un \`return\` anticipe.

### Pourquoi : React compte, il ne lit pas les noms
React ne sait pas que ton hook s'appelle \`mode\`. Il retient : "ce composant appelle 3 hooks, dans cet ordre". À chaque rendu, il redistribue les états dans le même ordre.

Rendu 1 (visible = true) : useState('auto'), useState(0), useEffect
Rendu 2 (visible = false) : useState(0), useEffect

Le deuxième hook reçoit maintenant l'état du premier. Les valeurs se melangent silencieusement.

### Le bon réflexe
Le hook monte, la condition descend :

\`const [mode, setMode] = useState('auto');  // toujours appele\`
\`if (!visible) return null;                 // le return vient APRES\`

### Conditionner l'effet, pas l'appel
Pour un \`useEffect\` qu'on ne veut exécuter que parfois, on garde l'appel inconditionnel et on met la condition **dedans** :

\`useEffect(() => {\`
\`  if (!visible) return;\`
\`  // ... le travail\`
\`}, [visible]);\`

### Le second volet de la règle
Les hooks ne s'appellent que depuis un composant React ou depuis un autre hook. Jamais depuis une fonction utilitaire ordinaire — c'est aussi a ca que sert le préfixe \`use\`.

**À retenir :** les hooks se comptent, ils ne se nomment pas. Aucun appel dans un if, une boucle ou après un return.
        `,
      },
      objectives: [
        { id: "o4a", label: "Sortir l'appel useState de la condition" },
        { id: "o4b", label: "Garder le comportement conditionnel après l'appel" },
      ],
      missionIcon: "⚖",
      missionTag: "PROTOCOLE 04",
      missionTtl: "RÈGLES DES HOOKS",
      bannerIcon: "🔧",
      bannerTtl: "FORGE MAÎTRISÉE",
      bannerSub: "Tes hooks respectent l'ordre d'appel que React exige.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
