import type { ChapterData } from "@/data/courses/html/types";

export const chapitre10: ChapterData = {
  slug: "chapitre-10",
  tag: "MISSION : MEMOIRE PERSISTANTE",
  title: "STOCKAGE\nLOCAL",
  subtitle: "Conserve les preferences du cadet entre les sessions",
  totalXp: 270,
  completionBadge: "💾",
  completionBadgeLabel: "GARDIEN DES DONNEES",
  steps: [
    {
      startCode:
        "// Stocke 'theme' = 'dark' dans localStorage, puis affiche-le avec getItem.\n",
      placeholder: "// localStorage.setItem + getItem",
      narrator:
        "Premier ecriture en memoire persistante. Stocke la preference de theme du cadet, puis lis-la pour verifier.",
      hint: "localStorage.setItem('theme', 'dark');\nconsole.log(localStorage.getItem('theme'));",
      briefing: {
        title: "localStorage : setItem & getItem",
        content: `
### Qu'est-ce que localStorage ?
Un **stockage cle/valeur** integre au navigateur. Les donnees persistent **meme apres fermeture du navigateur** (contrairement a sessionStorage qui est efface a la fermeture).

### Limites
- **Strings uniquement** : les valeurs sont stockees en string. Pour les objets, on JSON.stringify avant et JSON.parse en lecture.
- **~5 Mo** par domaine, environ.
- **Synchrone** : pas d'IO disque visible, mais ca bloque le thread quand meme. A eviter pour gros volumes.

### setItem
\`localStorage.setItem('theme', 'dark');\`

Si la cle existe deja, la valeur est ecrasee.

### getItem
\`const theme = localStorage.getItem('theme');\`

Retourne la valeur (string) ou **null** si la cle n'existe pas.

### Note importante
Dans cet editeur, le localStorage est un **polyfill en memoire** : les valeurs ne persistent pas entre deux executions du code. Dans un vrai navigateur, elles survivraient meme apres un reboot.

**A retenir :** setItem(cle, valeur) ecrit, getItem(cle) lit. Toujours en string.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser localStorage.setItem('theme', 'dark')" },
        { id: "o1b", label: "Afficher 'dark' via getItem" },
      ],
      missionIcon: "💾",
      missionTag: "PROTOCOLE 01",
      missionTtl: "ECRITURE & LECTURE",
      bannerIcon: "💾",
      bannerTtl: "MEMOIRE OPERATIONNELLE",
      bannerSub: "La preference est stockee et relue avec succes.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "// Stocke un objet pilote {nom: 'Luna', niveau: 8} dans localStorage sous la cle 'pilote'.\n// Relis et parse l'objet, puis logge pilote.nom et pilote.niveau.\n",
      placeholder: "// JSON.stringify + JSON.parse",
      narrator:
        "localStorage ne stocke que des strings. Pour persister un objet, JSON.stringify avant d'ecrire, JSON.parse apres lecture.",
      hint: "const pilote = {nom: 'Luna', niveau: 8};\nlocalStorage.setItem('pilote', JSON.stringify(pilote));\nconst lu = JSON.parse(localStorage.getItem('pilote'));\nconsole.log(lu.nom);\nconsole.log(lu.niveau);",
      briefing: {
        title: "Serialiser un objet",
        content: `
### Le probleme
\`localStorage.setItem('pilote', { nom: 'Luna' });\`
\`// Stocke en realite la chaine "[object Object]"\`

Toute valeur passee a setItem est convertie en string. Pour un objet, c'est une catastrophe.

### La solution : JSON
**Stringify** transforme un objet en JSON (string), **parse** fait l'inverse.

\`// Ecrire\`
\`localStorage.setItem('pilote', JSON.stringify({nom: 'Luna', niveau: 8}));\`

\`// Lire\`
\`const data = JSON.parse(localStorage.getItem('pilote'));\`
\`// data est un vrai objet : { nom: 'Luna', niveau: 8 }\`

### Attention : null
Si la cle n'existe pas, getItem retourne **null**. **JSON.parse(null)** retourne null (heureusement). Mais accede a une propriete sur null = TypeError.

\`const data = JSON.parse(localStorage.getItem('inexistant'));\`
\`if (data) { console.log(data.nom); }   // garde defensif\`

### Que stocker ?
- Preferences utilisateur (theme, langue, taille de police)
- Brouillon de formulaire
- Cache de donnees recentes
- Token d'auth (avec precaution — JWT en localStorage peut etre vulnerable au XSS)

**A retenir :** \`JSON.stringify avant setItem, JSON.parse apres getItem\`. Tu seras 90 % du temps dans ce pattern.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser JSON.stringify pour stocker l'objet" },
        { id: "o2b", label: "Logger 'Luna' et le niveau (8) apres parse" },
      ],
      missionIcon: "📦",
      missionTag: "PROTOCOLE 02",
      missionTtl: "SERIALISATION",
      bannerIcon: "📦",
      bannerTtl: "OBJET PERSISTE",
      bannerSub: "Tu sais maintenant stocker n'importe quelle structure.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Stocke 'token' = 'abc123' dans localStorage.\n// Supprime-le avec removeItem, puis verifie que getItem renvoie null.\n",
      placeholder: "// localStorage.removeItem",
      narrator:
        "Quand le cadet se deconnecte, il faut supprimer son token. Utilise removeItem pour cibler une cle precise, puis verifie sa disparition.",
      hint: "localStorage.setItem('token', 'abc123');\nlocalStorage.removeItem('token');\nconsole.log(localStorage.getItem('token'));",
      briefing: {
        title: "removeItem & clear",
        content: `
### Supprimer une cle
\`localStorage.removeItem('token');\`
Aucun effet si la cle n'existe pas (pas d'erreur).

### Tout effacer
\`localStorage.clear();\`
**Attention** : efface TOUTES les cles, pas seulement celles de ton app. A utiliser avec parcimonie.

### Verification
\`localStorage.getItem('token') === null\`
Apres removeItem, getItem retourne null.

### Cas d'usage typique : deconnexion
\`function signOut() {\`
\`  localStorage.removeItem('token');\`
\`  localStorage.removeItem('userInfo');\`
\`  redirectToLogin();\`
\`}\`

### Iterer les cles
\`for (let i = 0; i < localStorage.length; i++) {\`
\`  const key = localStorage.key(i);\`
\`  console.log(key, localStorage.getItem(key));\`
\`}\`

**A retenir :** removeItem(cle) pour cibler, clear() pour tout flusher.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser localStorage.removeItem" },
        { id: "o3b", label: "Verifier que getItem retourne null apres" },
      ],
      missionIcon: "🗑",
      missionTag: "PROTOCOLE 03",
      missionTtl: "NETTOYAGE",
      bannerIcon: "🗑",
      bannerTtl: "CLE EFFACEE",
      bannerSub: "Le token a ete proprement supprime.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "// Cree une fonction loadOrInit(defaultValue) qui :\n// - Si localStorage a la cle 'settings', retourne JSON.parse(...).\n// - Sinon, retourne defaultValue (sans rien ecrire en stockage).\n//\n// Teste avec defaultValue = {volume: 80, theme: 'dark'} et logge settings.volume.\n",
      placeholder: "// fonction utilitaire de lecture avec fallback",
      narrator:
        "Patron classique : on lit le stockage, si la cle existe on parse, sinon on retourne une valeur par defaut. Implemente cette fonction et utilise-la.",
      hint: "function loadOrInit(defaultValue) {\n  const raw = localStorage.getItem('settings');\n  if (raw === null) return defaultValue;\n  try { return JSON.parse(raw); } catch { return defaultValue; }\n}\nconst settings = loadOrInit({volume: 80, theme: 'dark'});\nconsole.log(settings.volume);",
      briefing: {
        title: "Patron 'load with fallback'",
        content: `
### Robustesse
Lire localStorage demande de gerer 2 cas :
1. La cle n'existe pas (-> null)
2. La cle existe mais le contenu est invalide (JSON corrompu)

### Implementation defensive
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

### Patron save symetrique
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

Le composant utilise useLocalState exactement comme useState mais la valeur persiste.

**A retenir :** envelopper localStorage dans des helpers (load/save) est presque toujours une bonne idee.
        `,
      },
      objectives: [
        { id: "o4a", label: "Definir une fonction loadOrInit" },
        { id: "o4b", label: "Logger 80 (volume par defaut)" },
      ],
      missionIcon: "🧬",
      missionTag: "PROTOCOLE 04",
      missionTtl: "PERSISTANCE STRUCTUREE",
      bannerIcon: "🧬",
      bannerTtl: "MEMOIRE MAITRISEE",
      bannerSub: "Tu sais gerer ecriture, lecture, suppression et fallback.",
      bannerXp: "⚡ +80 XP",
    },
  ],
};
