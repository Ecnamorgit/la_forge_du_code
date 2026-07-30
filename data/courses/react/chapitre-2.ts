import type { ChapterData } from "@/data/courses/html/types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : MEMOIRE DU VAISSEAU",
  title: "REACT &\nuseState",
  subtitle: "Donne de la memoire et de la reactivite a tes composants",
  totalXp: 280,
  completionBadge: "🧠",
  completionBadgeLabel: "INGENIEUR REACTIVITE",
  steps: [
    {
      startCode:
        "// Importe useState depuis 'react'.\n// Dans le composant Compteur, declare un etat 'count' initialise a 0.\n// Affiche-le dans le <div>.\nfunction Compteur() {\n  return <div>Score : 0</div>;\n}\n",
      placeholder: "// const [count, setCount] = useState(0);",
      previewMount: "Compteur",
      narrator:
        "Tes composants sont jusqu'ici figes. Pour qu'ils reagissent aux evenements, ils ont besoin d'une memoire interne : c'est l'etat. Le hook useState est ta nouvelle arme.",
      hint: "import { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return <div>Score : {count}</div>;\n}",
      briefing: {
        title: "Le hook useState",
        content: `
### Qu'est-ce qu'un hook ?
Un **hook** est une fonction speciale React qui commence par \`use\`. Ils donnent des super-pouvoirs aux composants fonctionnels. Le plus fondamental est \`useState\`.

### La syntaxe
\`const [valeur, setValeur] = useState(valeurInitiale);\`

C'est une **destructuration de tableau**. useState renvoie toujours deux choses :
1. La **valeur actuelle** de l'etat
2. Une **fonction** pour la modifier

### Pourquoi pas une variable normale ?
Une variable JS classique n'avertit pas React quand elle change. L'interface ne se met pas a jour. \`useState\` connecte la donnee au moteur de rendu : changer la valeur via le setter declenche un nouveau rendu automatique.

\`function Pilote() {\`
\`  const [niveau, setNiveau] = useState(1);\`
\`  return <div>Niveau {niveau}</div>;\`
\`}\`

**A retenir :** useState = memoire reactive. La valeur survit aux re-renders et declenche l'interface a se redessiner.
        `,
      },
      objectives: [
        { id: "o1a", label: "Importer useState depuis 'react'" },
        { id: "o1b", label: "Declarer [count, setCount] et l'afficher dans le JSX" },
      ],
      missionIcon: "🧠",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER ETAT",
      bannerIcon: "🧠",
      bannerTtl: "MEMOIRE ACTIVEE",
      bannerSub: "Ton composant possede desormais une memoire interne.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Ajoute un <button> qui, au clic, incremente count de 1.\n// Utilise l'attribut onClick et la fonction setCount.\nimport { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return <div>Score : {count}</div>;\n}\n",
      placeholder: "// <button onClick={() => setCount(count + 1)}>+1</button>",
      previewMount: "Compteur",
      narrator:
        "L'etat existe, mais rien ne le modifie. Ajoute un bouton qui incremente le compteur a chaque clic. Tu vas voir l'interface se redessiner toute seule. C'est la magie de React.",
      hint: "import { useState } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      Score : {count}\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}",
      briefing: {
        title: "Mettre a jour l'etat",
        content: `
### Les evenements en React
React utilise des attributs en camelCase pour les evenements : \`onClick\`, \`onChange\`, \`onSubmit\`... Ils prennent une fonction (pas une chaine comme en HTML classique).

\`<button onClick={maFonction}>Clic</button>\`

### Fleche inline ou fonction nommee ?
Deux ecritures equivalentes :
\`<button onClick={() => setCount(count + 1)}>+1</button>\`
\`<button onClick={handleClick}>+1</button>\` (avec \`function handleClick() { setCount(count + 1); }\`)

### Piege : passer le RESULTAT au lieu de la fonction
\`<button onClick={setCount(count + 1)}>\` -> FAUX, ca execute setCount immediatement au rendu.
\`<button onClick={() => setCount(count + 1)}>\` -> CORRECT, on passe une fonction qui sera appelee au clic.

### La forme fonctionnelle du setter
Pour modifier l'etat en fonction de l'ancien etat, prefere :
\`setCount(prev => prev + 1);\`
Plus sur dans les cas d'updates multiples rapides.

**A retenir :** setter = nouveau rendu automatique. Ne modifie JAMAIS l'etat directement (\`count++\` ne marche pas).
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
      bannerTtl: "RENDU REACTIF",
      bannerSub: "L'interface se met a jour automatiquement a chaque clic.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree un composant Pilote avec un etat 'profil' initialise a { nom: 'Lia', xp: 0 }.\n// Affiche le nom et l'xp. Ajoute un bouton qui ajoute 10 xp.\n// ATTENTION : ne modifie pas profil directement, cree un nouvel objet.\n",
      placeholder: "// setProfil({ ...profil, xp: profil.xp + 10 })",
      previewMount: "Pilote",
      narrator:
        "Stocker un objet entier dans un etat est tres courant. Mais attention : React n'accepte PAS qu'on mute l'objet existant. Il faut creer un nouvel objet a chaque mise a jour.",
      hint: "import { useState } from 'react';\n\nfunction Pilote() {\n  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });\n  return (\n    <div>\n      <p>{profil.nom} - {profil.xp} XP</p>\n      <button onClick={() => setProfil({ ...profil, xp: profil.xp + 10 })}>\n        +10 XP\n      </button>\n    </div>\n  );\n}",
      briefing: {
        title: "Etat avec objets et immutabilite",
        content: `
### La regle d'or : immutabilite
React compare l'ancien et le nouvel etat par **reference**, pas par valeur. Si tu modifies l'objet existant, la reference reste la meme, et React ne detecte aucun changement -> aucun rendu.

\`profil.xp += 10; setProfil(profil); // NE MARCHE PAS\`

### La solution : le spread
Le spread \`...\` cree un nouvel objet contenant les memes proprietes, puis on ecrase celles qu'on veut changer :

\`setProfil({ ...profil, xp: profil.xp + 10 });\`

C'est une COPIE avec une nouvelle reference -> React detecte le changement -> rendu.

### Meme principe pour les tableaux
\`setListe([...liste, nouvelElement]); // ajouter\`
\`setListe(liste.filter(x => x.id !== idASupprimer)); // supprimer\`
\`setListe(liste.map(x => x.id === id ? {...x, fait: true} : x)); // modifier\`

JAMAIS \`liste.push()\`, \`liste.splice()\`, \`liste[0] = ...\`.

**A retenir :** Tout setter doit recevoir un NOUVEL objet ou tableau. Sinon, React ne re-rend pas.
        `,
      },
      objectives: [
        { id: "o3a", label: "Stocker un objet dans useState" },
        { id: "o3b", label: "Mettre a jour avec le spread (nouvelle reference)" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ETAT COMPLEXE",
      bannerIcon: "🧬",
      bannerTtl: "IMMUTABILITE RESPECTEE",
      bannerSub: "Tes mises a jour respectent les regles de React.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le parent TableauDeBord possede l'etat 'alerte' (booleen).\n// Il passe alerte ET la fonction setAlerte au composant enfant Bouton.\n// Le Bouton, au clic, doit basculer alerte (true <-> false).\nimport { useState } from 'react';\n\nfunction TableauDeBord() {\n  return <div>...</div>;\n}\n\nfunction Bouton(props) {\n  return <button>Toggle</button>;\n}\n",
      placeholder: "// <Bouton alerte={alerte} setAlerte={setAlerte} />",
      previewMount: "TableauDeBord",
      narrator:
        "L'etat doit souvent etre partage entre plusieurs composants. La regle React : faire remonter l'etat dans le parent commun, puis le passer aux enfants via les props. C'est le 'state lifting'.",
      hint: "import { useState } from 'react';\n\nfunction TableauDeBord() {\n  const [alerte, setAlerte] = useState(false);\n  return (\n    <div>\n      <p>Statut : {alerte ? 'ALERTE' : 'OK'}</p>\n      <Bouton alerte={alerte} setAlerte={setAlerte} />\n    </div>\n  );\n}\n\nfunction Bouton({ alerte, setAlerte }) {\n  return <button onClick={() => setAlerte(!alerte)}>Toggle</button>;\n}",
      briefing: {
        title: "Faire remonter l'etat (state lifting)",
        content: `
### Pourquoi remonter l'etat ?
Si deux composants doivent partager une donnee, elle ne peut pas vivre dans l'un OU l'autre. Elle doit vivre dans leur **parent commun**, qui la redistribue via les props.

\`Parent  -- detient l'etat\`
\`  |\`
\`  +-- EnfantA (recoit valeur)\`
\`  +-- EnfantB (recoit valeur + setter)\`

### Le flux unidirectionnel
React impose un flux descendant : les donnees vont du parent vers l'enfant, jamais l'inverse. Pour qu'un enfant modifie une donnee du parent, le parent lui passe son **setter** en prop.

### Destructuration des props
Plutot que \`props.alerte\` partout, destructure des l'entree :
\`function Bouton({ alerte, setAlerte }) { ... }\`

### Et apres ?
Quand l'etat doit etre partage par BEAUCOUP de composants, on passe a des outils dedies :
- **useContext** pour eviter le "props drilling"
- **Zustand**, **Redux Toolkit**, **Jotai** pour des stores globaux

Mais 80% du temps, useState + state lifting suffisent.

**A retenir :** L'etat appartient toujours au composant qui en a besoin OU a son parent commun.
        `,
      },
      objectives: [
        { id: "o4a", label: "Declarer l'etat dans le composant parent" },
        { id: "o4b", label: "Passer valeur et setter en props a l'enfant" },
      ],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 04",
      missionTtl: "STATE LIFTING",
      bannerIcon: "🧠",
      bannerTtl: "ARCHITECTURE REACTIVE",
      bannerSub: "Tu maitrises le partage d'etat entre composants.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
