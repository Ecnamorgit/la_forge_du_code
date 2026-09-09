import type { ChapterData } from "@/data/courses/html/types";

export const chapitre10: ChapterData = {
  slug: "chapitre-10",
  tag: "MISSION : MÉMOIRE PERSISTANTE",
  title: "STOCKAGE\nLOCAL",
  subtitle: "Conserve les préférences du cadet entre les sessions",
  totalXp: 270,
  completionBadge: "💾",
  completionBadgeLabel: "GARDIEN DES DONNÉES",
  steps: [
    {
      startCode:
        "// Stocke 'theme' = 'dark' dans localStorage, puis affiche-le avec getItem.\n",
      placeholder: "// localStorage.setItem + getItem",
      narrator:
        "Premier écriture en mémoire persistante. Stocke la préférence de thème du cadet, puis lis-la pour vérifier.",
      hint: "localStorage.setItem('thème', 'dark');\nconsole.log(localStorage.getItem('thème'));",
      briefing: {
        title: "localStorage : setItem & getItem",
        content: `
*« Ce qui n'est pas consigné est perdu au prochain redémarrage. \`localStorage\` grave les préférences du cadet dans la mémoire de bord. »* — **Kira**

### Qu'est-ce que localStorage ?
Un **stockage clé/valeur** intégré au navigateur. Les données persistent **même après fermeture du navigateur** (contrairement à sessionStorage qui est effacé à la fermeture).

### Limites
- **Strings uniquement** : les valeurs sont stockées en string. Pour les objets, on JSON.stringify avant et JSON.parse en lecture.
- **~5 Mo** par domaine, environ.
- **Synchrone** : pas d'IO disque visible, mais ça bloque le thread quand même. À éviter pour gros volumes.

### setItem
\`localStorage.setItem('theme', 'dark');\`

Si la clé existe déjà, la valeur est écrabouillée.

### getItem
\`const theme = localStorage.getItem('theme');\`

Retourne la valeur (string) ou **null** si la clé n'existe pas.

### Note importante
Dans cet éditeur, le localStorage est un **polyfill en mémoire** : les valeurs ne persistent pas entre deux exécutions du code. Dans un vrai navigateur, elles survivraient même après un reboot.

**À retenir :** setItem(clé, valeur) écrit, getItem(clé) lit. Toujours en string.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser localStorage.setItem('thème', 'dark')" },
        { id: "o1b", label: "Afficher 'dark' via getItem" },
      ],
      docRefs: ["js/localstorage"],
      missionIcon: "💾",
      missionTag: "PROTOCOLE 01",
      missionTtl: "ÉCRITURE & LECTURE",
      bannerIcon: "💾",
      bannerTtl: "MÉMOIRE OPÉRATIONNELLE",
      bannerSub: "La préférence est stockée et relue avec succès.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "// Stocke un objet pilote {nom: 'Luna', niveau: 8} dans localStorage sous la clé 'pilote'.\n// Relis et parse l'objet, puis logge pilote.nom et pilote.niveau.\n",
      placeholder: "// JSON.stringify + JSON.parse",
      narrator:
        "localStorage ne stocke que des strings. Pour persister un objet, JSON.stringify avant d'écrire, JSON.parse après lecture.",
      hint: "const pilote = {nom: 'Luna', niveau: 8};\nlocalStorage.setItem('pilote', JSON.stringify(pilote));\nconst lu = JSON.parse(localStorage.getItem('pilote'));\nconsole.log(lu.nom);\nconsole.log(lu.niveau);",
      briefing: {
        title: "Sérialiser un objet",
        content: `
### Le problème
\`localStorage.setItem('pilote', { nom: 'Luna' });\`
\`// Stocke en réalité la chaîne "[object Object]"\`

Toute valeur passée à setItem est convertie en string. Pour un objet, c'est une catastrophe.

### La solution : JSON
**Stringify** transforme un objet en JSON (string), **parse** fait l'inverse.

\`// Écrire\`
\`localStorage.setItem('pilote', JSON.stringify({nom: 'Luna', niveau: 8}));\`

\`// Lire\`
\`const data = JSON.parse(localStorage.getItem('pilote'));\`
\`// data est un vrai objet : { nom: 'Luna', niveau: 8 }\`

### Vérification
On peut vérifier si la clé existe avant de parser :
\`if (localStorage.getItem('pilote') !== null) {\`
\`  const pilote = JSON.parse(localStorage.getItem('pilote'));\`
\`}\`

**À retenir :** Utiliser JSON.stringify et JSON.parse pour stocker et récupérer des objets.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser localStorage.setItem avec un objet" },
        { id: "o2b", label: "Afficher les propriétés de l'objet après parsing" },
      ],
      missionIcon: "🛠️",
      missionTag: "PROTOCOLE 02",
      missionTtl: "STOCKAGE D'OBJETS",
      bannerIcon: "🛠️",
      bannerTtl: "OBJET SÉRIALISÉ",
      bannerSub: "L'objet est correctement stocké et récupéré.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Supprime la clé 'settings' de localStorage si elle existe, puis vérifie que getItem retourne null.\n",
      placeholder: "// localStorage.removeItem",
      narrator:
        "Suppression d'une clé spécifique dans le stockage local et vérification de son absence.",
      hint: "localStorage.removeItem('settings');\nconsole.log(localStorage.getItem('settings') === null);",
      briefing: {
        title: "Supprimer une clé",
        content: `
### Suppression d'une clé
Pour supprimer une clé spécifique dans le stockage local, on utilise \`localStorage.removeItem(cle)\`.

### Vérification
Après avoir supprimé la clé, on vérifie que \`localStorage.getItem('cle')\` retourne null.

### Exemple
\`localStorage.removeItem('settings');\`
\`console.log(localStorage.getItem('settings') === null);\`

### Cas d'usage typique : Déconnexion
Pour déconnecter un utilisateur, on supprime ses informations stockées :
\`function signOut() {\`
\`  localStorage.removeItem('token');\`
\`  localStorage.removeItem('userInfo');\`
\`  redirectToLogin();\`
\`}\`

**À retenir :** Utiliser \`localStorage.removeItem(cle)\` pour supprimer une clé spécifique.
        `,
      },
      objectives: [
        { id: "o3a", label: "Supprimer la clé 'settings'" },
        { id: "o3b", label: "Vérifier que getItem retourne null après suppression" },
      ],
      missionIcon: "🗑",
      missionTag: "PROTOCOLE 03",
      missionTtl: "SUPPRESSION",
      bannerIcon: "🗑",
      bannerTtl: "CLÉ SUPPRIMÉE",
      bannerSub: "La clé a été correctement supprimée.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "// Crée une fonction loadOrInit(defaultValue) qui :\n// - Si localStorage a la clé 'settings', retourne JSON.parse(...).\n// - Sinon, retourne defaultValue (sans rien écrire en stockage).\n//\n// Teste avec defaultValue = {volume: 80, theme: 'dark'} et logge settings.volume.\n",
      placeholder: "// fonction utilitaire de lecture avec fallback",
      narrator:
        "Patron classique : on lit le stockage, si la clé existe on parse, sinon on retourne une valeur par défaut. Implémente cette fonction et utilise-la.",
      hint: "function loadOrInit(defaultValue) {\n  const raw = localStorage.getItem('settings');\n  if (raw === null) return defaultValue;\n  try { return JSON.parse(raw); } catch { return defaultValue; }\n}\nconst settings = loadOrInit({volume: 80, thème: 'dark'});\nconsole.log(settings.volume);",
      briefing: {
        title: "Patron 'load with fallback'",
        content: `
### Robustesse
Lire localStorage demande de gérer 2 cas :
1. La clé n'existe pas (-> null)
2. La clé existe mais le contenu est invalide (JSON corrompu)

### Implémentation défensive
\`function load(key, defaultValue) {\`
\`  const raw = localStorage.getItem(key);\`
\`  if (raw === null) return defaultValue;\`
\`  try {\`
\`    return JSON.parse(raw);\`
\`  } catch {\`
\`    return defaultValue;\`
\`  }\`
\`}\`

### Pourquoi try/catch sur JSON.parse ?
Si l'utilisateur ouvre les DevTools et modifie manuellement la valeur en stockage, JSON.parse peut throw. On ne veut pas crasher l'app.

### Patron save symétrique
\`function save(key, value) {\`
\`  localStorage.setItem(key, JSON.stringify(value));\`
\`}\`

### Aller plus loin : hooks React
Dans une app React, on encapsule ce pattern dans un **custom hook** :
\`function useLocalState(key, defaultValue) {\`
\`  const [value, setValue] = useState(() => load(key, defaultValue));\`
\`  useEffect(() => save(key, value), [key, value]);\`
\`  return [value, setValue];\`
\`}\`

Le composant utilise \`useLocalState\` exactement comme \`useState\` mais la valeur persiste.

**À retenir :** envelopper localStorage dans des helpers (load/save) est presque toujours une bonne idée.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir une fonction loadOrInit" },
        { id: "o4b", label: "Logger 80 (volume par défaut)" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 04",
      missionTtl: "PERSISTANCE STRUCTURÉE",
      bannerIcon: "🧬",
      bannerTtl: "MÉMOIRE MAÎTRISÉE",
      bannerSub: "Tu sais gérer écriture, lecture, suppression et fallback.",
      bannerXp: "⚡ +80 XP",
    },
  ],
};