import type { ChapterData } from "@/data/courses/html/types";

export const chapitre3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : EFFETS DE BORD",
  title: "REACT &\nuseEffect",
  subtitle: "Synchronise tes composants avec le monde extérieur",
  totalXp: 280,
  completionBadge: "🔁",
  completionBadgeLabel: "MAÎTRE DES CYCLES",
  steps: [
    {
      startCode:
        "// Importe useEffect.\n// Au montage du composant, logge 'Composant en ligne' dans la console.\n// Indice : utilise un tableau de dependances vide [].\nimport { useState } from 'react';\n\nfunction Console() {\n  return <div>Pret</div>;\n}\n",
      placeholder: "// useEffect(() => { ... }, []);",
      previewMount: "Console",
      narrator:
        "Un composant pur ne devrait jamais avoir d'effets exterieurs durant son rendu. Pour interagir avec le monde réel (logs, fetch, abonnements), React fournit useEffect. Premier protocole : détecter le montage du composant.",
      hint: "import { useState, useEffect } from 'react';\n\nfunction Console() {\n  useEffect(() => {\n    console.log('Composant en ligne');\n  }, []);\n  return <div>Prêt</div>;\n}",
      briefing: {
        title: "Le hook useEffect",
        content: `
### Qu'est-ce qu'un effet de bord ?
C'est toute action qui touche au monde EXTÉRIEUR au composant : log console, fetch, modification du DOM, timer, abonnement a un événement. React refuse qu'on fasse ca pendant le rendu — ce serait imprévisible.

### La syntaxe
\`useEffect(() => {\`
\`  // ton effet de bord\`
\`}, [dependances]);\`

### Les trois modes
- \`useEffect(fn)\` -> s'execute APRÈS CHAQUE rendu (rarement ce que tu veux)
- \`useEffect(fn, [])\` -> s'execute UNE SEULE FOIS au montage
- \`useEffect(fn, [a, b])\` -> s'execute au montage + à chaque changement de a ou b

### Le tableau de dependances vide
\`useEffect(() => { ... }, []);\`

C'est le pattern "au montage uniquement". Idéal pour :
- Initialiser une librairie tierce
- S'abonner a un événement global
- Faire un fetch initial

### Pourquoi pas dans le corps du composant ?
\`function Composant() {\`
\`  console.log('Hello'); // mauvaise idee\`
\`  return <div />;\`
\`}\`
Ca s'execute à CHAQUE rendu, même inutile. useEffect te donne un contexte contrôle pour ces actions.

**À retenir :** useEffect = porte de sortie controlee vers le monde extérieur. Le tableau vide = "une fois au montage".
        `,
      },
      objectives: [
        { id: "o1a", label: "Importer useEffect" },
        { id: "o1b", label: "Logger au montage avec un useEffect a dependances []" },
      ],
      missionIcon: "🔁",
      missionTag: "PROTOCOLE 01",
      missionTtl: "MONTAGE",
      bannerIcon: "🔁",
      bannerTtl: "EFFET INITIAL",
      bannerSub: "Ton composant declenche une action au demarrage.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Quand 'count' change, change le titre de l'onglet via document.title.\n// Indique la valeur : 'Score : N'.\nimport { useState, useEffect } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      Score : {count}\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}\n",
      placeholder: "// useEffect(() => { document.title = ... }, [count]);",
      previewMount: "Compteur",
      narrator:
        "Le vrai pouvoir de useEffect : reagir aux changements. En passant 'count' dans les dependances, l'effet se relance chaque fois que la valeur change. Synchronise l'onglet du navigateur avec le score.",
      hint: "import { useState, useEffect } from 'react';\n\nfunction Compteur() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    document.title = 'Score : ' + count;\n  }, [count]);\n  return (\n    <div>\n      Score : {count}\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}",
      briefing: {
        title: "Les dependances",
        content: `
### Le tableau de dependances
React compare l'ancien et le nouveau tableau à chaque rendu. Si UNE seule référence change, l'effet est rejoue.

\`useEffect(() => { ... }, [count]);\`
-> rejoue l'effet à chaque fois que count change.

### La règle d'or
Si tu utilises une variable à l'INTÉRIEUR de l'effet, elle DOIT être dans le tableau de dependances. Sinon, l'effet utilisera une vieille valeur "figee" (closure stale).

### Le linter ESLint
La règle \`react-hooks/exhaustive-deps\` te le rappelle automatiquement. Active-la, fais-lui confiance.

### Plusieurs dependances
\`useEffect(() => {\`
\`  envoyerStats(count, niveau);\`
\`}, [count, niveau]);\`
-> l'effet relance quand l'un OU l'autre change.

### Piège : les objets et tableaux
\`useEffect(() => { ... }, [{ a: 1 }]);\` -> rejoue à CHAQUE rendu (nouvelle référence d'objet à chaque fois). Solution : mettre les valeurs primitives une par une, ou utiliser \`useMemo\`.

### Et l'asynchrone ?
\`useEffect\` ne peut pas être directement \`async\`. Tu declares une fonction async à l'intérieur :
\`useEffect(() => {\`
\`  async function charger() { ... }\`
\`  charger();\`
\`}, []);\`

**À retenir :** Le tableau de dependances declenche la re-exécution. Toute variable utilisée doit y figurer.
        `,
      },
      objectives: [
        { id: "o2a", label: "Modifier document.title dans un useEffect" },
        { id: "o2b", label: "Passer count dans le tableau de dependances" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "DEPENDANCES",
      bannerIcon: "🎯",
      bannerTtl: "SYNCHRONISATION",
      bannerSub: "L'effet réagit précisément aux données qui changent.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree un composant Chronometre.\n// A chaque seconde, incremente un compteur affiche dans le composant.\n// CRITIQUE : nettoie l'interval quand le composant est demonte.\nimport { useState, useEffect } from 'react';\n\nfunction Chronometre() {\n  const [s, setS] = useState(0);\n  return <div>Temps : {s}s</div>;\n}\n",
      placeholder: "// useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, []);",
      previewMount: "Chronometre",
      narrator:
        "Certains effets laissent des traces : timers, abonnements, connexions. Si tu ne les nettoies pas, ils survivent au composant et provoquent des fuites mémoire. useEffect te donne une fonction de cleanup.",
      hint: "import { useState, useEffect } from 'react';\n\nfunction Chronometre() {\n  const [s, setS] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setS(prev => prev + 1), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <div>Temps : {s}s</div>;\n}",
      briefing: {
        title: "La fonction de cleanup",
        content: `
### Pourquoi nettoyer ?
\`setInterval\`, \`addEventListener\`, abonnements WebSocket... continuent de tourner même après que le composant a disparu de l'écran. Résultat : mémoire qui fuit, callbacks qui tentent de mettre à jour un composant demonté (warning React classique).

### Le return de useEffect
La fonction que tu retournes EST la fonction de cleanup. React l'appelle :
1. Avant la prochaine exécution de l'effet (si les dependances changent)
2. Au demontage du composant

\`useEffect(() => {\`
\`  const id = setInterval(tick, 1000);\`
\`  return () => clearInterval(id);  // CLEANUP\`
\`}, []);\`

### Cas classiques de cleanup
\`useEffect(() => {\`
\`  function onResize() { ... }\`
\`  window.addEventListener('resize', onResize);\`
\`  return () => window.removeEventListener('resize', onResize);\`
\`}, []);\`

### Pourquoi setS(prev => prev + 1) et pas setS(s + 1) ?
Dans un interval, le \`s\` est capture une fois (closure). Pour toujours avoir la valeur à jour, utilise la **forme fonctionnelle** du setter : \`setS(prev => prev + 1)\`. Sinon le chronometre reste bloque a 1.

### Strict Mode
En dev, React monte et demonte chaque composant deux fois pour détecter les effets mal nettoyes. Si tu vois des comportements doubles, ce n'est pas un bug — c'est React qui te dit "vérifie ton cleanup".

**À retenir :** Si un effet ouvre quelque chose (timer, listener, connexion), son return DOIT le fermer. Pas d'exception.
        `,
      },
      objectives: [
        { id: "o3a", label: "Demarrer un setInterval dans useEffect" },
        { id: "o3b", label: "Retourner une fonction qui fait clearInterval" },
      ],
      missionIcon: "🧹",
      missionTag: "PROTOCOLE 03",
      missionTtl: "CLEANUP",
      bannerIcon: "🧹",
      bannerTtl: "FUITE EVITEE",
      bannerSub: "Ton composant se nettoie proprement à sa destruction.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Au montage, fetch 'https://api.codeforge.space/vaisseau/42'.\n// Stocke le resultat dans un state 'vaisseau' (initialise a null).\n// Affiche 'Chargement...' tant que vaisseau est null, sinon le nom du vaisseau.\nimport { useState, useEffect } from 'react';\n\nfunction FicheVaisseau() {\n  return <div>...</div>;\n}\n",
      placeholder: "// useEffect avec async function interne + fetch",
      previewMount: "FicheVaisseau",
      narrator:
        "Le pattern le plus utilise de toute la programmation React : fetch des données au montage et les afficher. Combine tout ce que tu as appris — useState, useEffect, async/await et response.ok.",
      hint: "import { useState, useEffect } from 'react';\n\nfunction FicheVaisseau() {\n  const [vaisseau, setVaisseau] = useState(null);\n  useEffect(() => {\n    async function charger() {\n      const res = await fetch('https://api.codeforge.space/vaisseau/42');\n      if (!res.ok) throw new Error('HTTP ' + res.status);\n      const data = await res.json();\n      setVaisseau(data);\n    }\n    charger();\n  }, []);\n  if (!vaisseau) return <div>Chargement...</div>;\n  return <div>{vaisseau.nom}</div>;\n}",
      briefing: {
        title: "Fetch dans un useEffect",
        content: `
### Le pattern complet
\`function Composant() {\`
\`  const [data, setData] = useState(null);\`
\`  const [erreur, setErreur] = useState(null);\`
\`  useEffect(() => {\`
\`    async function charger() {\`
\`      try {\`
\`        const res = await fetch(url);\`
\`        if (!res.ok) throw new Error('HTTP ' + res.status);\`
\`        const json = await res.json();\`
\`        setData(json);\`
\`      } catch (e) { setErreur(e.message); }\`
\`    }\`
\`    charger();\`
\`  }, []);\`
\`  if (erreur) return <div>Erreur : {erreur}</div>;\`
\`  if (!data) return <div>Chargement...</div>;\`
\`  return <div>{data.nom}</div>;\`
\`}\`

### Pourquoi pas useEffect(async () => ...) ?
Une fonction async retourne TOUJOURS une Promise. useEffect attend soit \`undefined\`, soit une fonction de cleanup. Une Promise casserait la mécanique. Donc tu declares une fonction async À L'INTÉRIEUR.

### Le "race condition" classique
Si le composant change d'id rapidement (ex: \`/vaisseau/1\` puis \`/vaisseau/2\`), les deux fetchs peuvent revenir dans le DESORDRE. Solution avec un drapeau :

\`useEffect(() => {\`
\`  let actif = true;\`
\`  charger().then(data => { if (actif) setData(data); });\`
\`  return () => { actif = false; };\`
\`}, [id]);\`

### Les vraies pros
En production, on utilise des bibliotheques dediees au data fetching :
- **TanStack Query** (React Query) -> caching, dedup, refetch automatique
- **SWR** -> similaire, plus minimaliste
- **RTK Query** -> integre a Redux Toolkit

Elles eliminent 90% du boilerplate useEffect+useState.

**À retenir :** Le pattern useState+useEffect+fetch est partout. Pour la production, passe a TanStack Query des que tu peux.
        `,
      },
      objectives: [
        { id: "o4a", label: "Lancer un fetch au montage dans useEffect" },
        { id: "o4b", label: "Gérer l'état de chargement et l'affichage conditionnel" },
      ],
      missionIcon: "📡",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FETCH + EFFECT",
      bannerIcon: "🔁",
      bannerTtl: "DONNÉES CHARGEES",
      bannerSub: "Tu maitrises le pattern le plus utilise de React.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
