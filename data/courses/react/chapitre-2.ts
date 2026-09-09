import type { ChapterData } from "@/data/courses/html/types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : MÉMOIRE DU VAISSEAU",
  title: "REACT &\nuseState",
  subtitle: "Donne de la mémoire et de la réactivité a tes composants",
  totalXp: 280,
  completionBadge: "🧠",
  completionBadgeLabel: "INGÉNIEUR RÉACTIVITÉ",
  steps: [
    {
      startCode:
        "// Importe useState depuis 'react'.\n// Dans le composant Compteur, declare un etat 'count' initialise a 0.\n// Affiche-le dans le <div>.\nfunction Compteur() {\n  return <div>Score : 0</div>;\n}\n",
      placeholder: "// const [count, setCount] = useState(0);",
      previewMount: "Compteur",
      narrator:
        "Tes composants sont jusqu'ici figes. Pour qu'ils reagissent aux événements, ils ont besoin d'une mémoire interne : c'est l'état. Le hook useState est ta nouvelle arme.",
      hint: "import { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return <div>Score : {count}</div>;\n}",
      briefing: {
        title: "Le hook useState",
        content: `
### Qu'est-ce qu'un hook ?
Un **hook** est une fonction spéciale React qui commence par \`use\`. Ils donnent des super-pouvoirs aux composants fonctionnels. Le plus fondamental est \`useState\`.

### La syntaxe
\`const [valeur, setValeur] = useState(valeurInitiale);\`

C'est une **destructuration de tableau**. useState renvoie toujours deux choses :
1. La **valeur actuelle** de l'état
2. Une **fonction** pour la modifier

### Pourquoi pas une variable normale ?
Une variable JS classique n'avertit pas React quand elle change. L'interface ne se met pas à jour. \`useState\` connecte la donnée au moteur de rendu : changer la valeur via le setter declenche un nouveau rendu automatique.

\`function Pilote() {\`
\`  const [niveau, setNiveau] = useState(1);\`
\`  return <div>Niveau {niveau}</div>;\`
\`}\`

**À retenir :** useState = mémoire reactive. La valeur survit aux re-renders et declenche l'interface a se redessiner.
        `,
      },
      objectives: [
        { id: "o1a", label: "Importer useState depuis 'react'" },
        { id: "o1b", label: "Déclarer [count, setCount] et l'afficher dans le JSX" },
      ],
      missionIcon: "🧠",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER ÉTAT",
      bannerIcon: "🧠",
      bannerTtl: "MÉMOIRE ACTIVÉE",
      bannerSub: "Ton composant possede désormais une mémoire interne.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Ajoute un <button> qui, au clic, incremente count de 1.\n// Utilise l'attribut onClick et la fonction setCount.\nimport { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return <div>Score : {count}</div>;\n}\n",
      placeholder: "// <button onClick={() => setCount(count + 1)}>+1</button>",
      previewMount: "Compteur",
      narrator:
        "L'état existe, mais rien ne le modifie. Ajoute un bouton qui incremente le compteur à chaque clic. Tu vas voir l'interface se redessiner toute seule. C'est la magie de React.",
      hint: "import { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      Score : {count}\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}",
      briefing: {
        title: "Mettre à jour l'état",
        content: `
### Les événements en React
React utilise des attributs en camelCase pour les événements : \`onClick\`, \`onChange\`, \`onSubmit\`... Ils prennent une fonction (pas une chaîne comme en HTML classique).

\`<button onClick={maFonction}>Clic</button>\`

### Fleche inline ou fonction nommée ?
Deux ecritures equivalentes :
\`<button onClick={() => setCount(count + 1)}>+1</button>\`
\`<button onClick={handleClick}>+1</button>\` (avec \`function handleClick() { setCount(count + 1); }\`)

### Piège : passer le RÉSULTAT au lieu de la fonction
\`<button onClick={setCount(count + 1)}>\` -> FAUX, ca execute setCount immediatement au rendu.
\`<button onClick={() => setCount(count + 1)}>\` -> CORRECT, on passe une fonction qui sera appelée au clic.

### La forme fonctionnelle du setter
Pour modifier l'état en fonction de l'ancien état, préfère :
\`setCount(prev => prev + 1);\`
Plus sur dans les cas d'updates multiples rapides.

**À retenir :** setter = nouveau rendu automatique. Ne modifie JAMAIS l'état directement (\`count++\` ne marche pas).
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter un <button> avec un attribut onClick" },
        { id: "o2b", label: "Appeler setCount via une fleche pour incrementer" },
      ],
      missionIcon: "🔘",
      missionTag: "PROTOCOLE 02",
      missionTtl: "INTERACTION CLIC",
      bannerIcon: "🔘",
      bannerTtl: "RENDU RÉACTIF",
      bannerSub: "L'interface se met à jour automatiquement à chaque clic.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree un composant Pilote avec un etat 'profil' initialise a { nom: 'Lia', xp: 0 }.\n// Affiche le nom et l'xp. Ajoute un bouton qui ajoute 10 xp.\n// ATTENTION : ne modifie pas profil directement, cree un nouvel objet.\n",
      placeholder: "// setProfil({ ...profil, xp: profil.xp + 10 })",
      previewMount: "Pilote",
      narrator:
        "Stocker un objet entier dans un état est très courant. Mais attention : React n'accepte PAS qu'on mute l'objet existant. Il faut créer un nouvel objet à chaque mise à jour.",
      hint: "import { useState } from 'react';\n\nfunction Pilote() {\n  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });\n  return (\n    <div>\n      <p>{profil.nom} - {profil.xp} XP</p>\n      <button onClick={() => setProfil({ ...profil, xp: profil.xp + 10 })}>\n        +10 XP\n      </button>\n    </div>\n  );\n}",
      briefing: {
        title: "État avec objets et immutabilite",
        content: `
### La règle d'or : immutabilite
React compare l'ancien et le nouvel état par **référence**, pas par valeur. Si tu modifies l'objet existant, la référence reste la même, et React ne detecte aucun changement -> aucun rendu.

\`profil.xp += 10; setProfil(profil); // NE MARCHE PAS\`

### La solution : le spread
Le spread \`...\` cree un nouvel objet contenant les memes propriétés, puis on ecrase celles qu'on veut changer :

\`setProfil({ ...profil, xp: profil.xp + 10 });\`

C'est une COPIE avec une nouvelle référence -> React detecte le changement -> rendu.

### Même principe pour les tableaux
\`setListe([...liste, nouvelElement]); // ajouter\`
\`setListe(liste.filter(x => x.id !== idASupprimer)); // supprimer\`
\`setListe(liste.map(x => x.id === id ? {...x, fait: true} : x)); // modifier\`

JAMAIS \`liste.push()\`, \`liste.splice()\`, \`liste[0] = ...\`.

**À retenir :** Tout setter doit recevoir un NOUVEL objet ou tableau. Sinon, React ne re-rend pas.
        `,
      },
      objectives: [
        { id: "o3a", label: "Stocker un objet dans useState" },
        { id: "o3b", label: "Mettre à jour avec le spread (nouvelle référence)" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ÉTAT COMPLEXE",
      bannerIcon: "🧬",
      bannerTtl: "IMMUTABILITE RESPECTEE",
      bannerSub: "Tes mises à jour respectent les règles de React.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le parent TableauDeBord possede l'etat 'alerte' (booleen).\n// Il passe alerte ET la fonction setAlerte au composant enfant Bouton.\n// Le Bouton, au clic, doit basculer alerte (true <-> false).\nimport { useState } from 'react';\n\nfunction TableauDeBord() {\n  return <div>...</div>;\n}\n\nfunction Bouton(props) {\n  return <button>Toggle</button>;\n}\n",
      placeholder: "// <Bouton alerte={alerte} setAlerte={setAlerte} />",
      previewMount: "TableauDeBord",
      narrator:
        "L'état doit souvent être partage entre plusieurs composants. La règle React : faire remonter l'état dans le parent commun, puis le passer aux enfants via les props. C'est le 'state lifting'.",
      hint: "import { useState } from 'react';\n\nfunction TableauDeBord() {\n  const [alerte, setAlerte] = useState(false);\n  return (\n    <div>\n      <p>Statut : {alerte ? 'ALERTE' : 'OK'}</p>\n      <Bouton alerte={alerte} setAlerte={setAlerte} />\n    </div>\n  );\n}\n\nfunction Bouton({ alerte, setAlerte }) {\n  return <button onClick={() => setAlerte(!alerte)}>Toggle</button>;\n}",
      briefing: {
        title: "Faire remonter l'état (state lifting)",
        content: `
### Pourquoi remonter l'état ?
Si deux composants doivent partager une donnée, elle ne peut pas vivre dans l'un OU l'autre. Elle doit vivre dans leur **parent commun**, qui la redistribue via les props.

\`Parent  -- detient l'etat\`
\`  |\`
\`  +-- EnfantA (recoit valeur)\`
\`  +-- EnfantB (recoit valeur + setter)\`

### Le flux unidirectionnel
React impose un flux descendant : les données vont du parent vers l'enfant, jamais l'inverse. Pour qu'un enfant modifie une donnée du parent, le parent lui passe son **setter** en prop.

### Destructuration des props
Plutôt que \`props.alerte\` partout, destructure des l'entrée :
\`function Bouton({ alerte, setAlerte }) { ... }\`

### Et après ?
Quand l'état doit être partage par BEAUCOUP de composants, on passe à des outils dedies :
- **useContext** pour éviter le "props drilling"
- **Zustand**, **Redux Toolkit**, **Jotai** pour des stores globaux

Mais 80% du temps, useState + state lifting suffisent.

**À retenir :** L'état appartient toujours au composant qui en a besoin OU à son parent commun.
        `,
      },
      objectives: [
        { id: "o4a", label: "Déclarer l'état dans le composant parent" },
        { id: "o4b", label: "Passer valeur et setter en props à l'enfant" },
      ],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 04",
      missionTtl: "STATE LIFTING",
      bannerIcon: "🧠",
      bannerTtl: "ARCHITECTURE REACTIVE",
      bannerSub: "Tu maitrises le partage d'état entre composants.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
