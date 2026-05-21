import type { ChapterData } from "@/data/courses/html/types";

export const chapitre9: ChapterData = {
  slug: "chapitre-9",
  tag: "MISSION : COMMUNICATIONS ASYNCHRONES",
  title: "PROMISES\n& ASYNC",
  subtitle: "Maitrise les operations qui prennent du temps",
  totalXp: 280,
  completionBadge: "🌐",
  completionBadgeLabel: "OPERATEUR ASYNCHRONE",
  steps: [
    {
      startCode:
        "// Cree une Promise qui resoud avec 'OK' apres 50ms (setTimeout).\n// Utilise .then() pour logger la valeur.\n",
      placeholder: "// new Promise + .then",
      narrator:
        "Premiere promesse. Cree-en une qui resoud avec 'OK' apres 50ms, puis chain un .then() qui logge la valeur.",
      hint: "new Promise((resolve) => setTimeout(() => resolve('OK'), 50)).then((v) => console.log(v));",
      briefing: {
        title: "La Promise",
        content: `
### Le probleme
Du JavaScript synchrone bloque le navigateur. Pour les operations longues (reseau, fichier, animation), on a besoin **d'asynchrone**.

### La Promise
Une **Promise** represente le **resultat futur** d'une operation. Elle peut etre dans 3 etats :
- **pending** (en cours)
- **fulfilled** (succes, avec une valeur)
- **rejected** (echec, avec une erreur)

### Creer une Promise
\`new Promise((resolve, reject) => {\`
\`  setTimeout(() => resolve('OK'), 50);\`
\`});\`

### Consommer avec .then()
\`promise.then((valeur) => console.log(valeur));\`

### .catch()
\`promise\`
\`  .then((valeur) => ...)\`
\`  .catch((erreur) => console.error(erreur));\`

### En pratique
Tu cree **rarement** des Promises a la main. Les APIs (**fetch**, **setTimeout-as-promise**, etc.) te les fournissent. Mais comprendre comment elles se construisent reste utile.

**A retenir :** une Promise = "appelle-moi quand c'est pret".
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser new Promise + setTimeout" },
        { id: "o1b", label: "Logger 'OK' dans un .then()" },
      ],
      missionIcon: "⏳",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PROMESSE FUTURE",
      bannerIcon: "⏳",
      bannerTtl: "PROMESSE TENUE",
      bannerSub: "La Promise a resolu apres son delai.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Cree une fonction async getMission() qui retourne 'Mission lunaire' apres 30ms.\n// Appelle-la dans un autre async block (IIFE) et logge le resultat avec await.\n",
      placeholder: "// async / await",
      narrator:
        "async/await rend l'asynchrone lisible comme du synchrone. Definis une fonction async qui retourne 'Mission lunaire' apres 30ms, puis utilise await pour recuperer la valeur.",
      hint: "async function getMission() { await new Promise(r => setTimeout(r, 30)); return 'Mission lunaire'; }\n(async () => { const m = await getMission(); console.log(m); })();",
      briefing: {
        title: "async / await",
        content: `
### Le sucre syntaxique
async/await rend le code **asynchrone aussi lisible que synchrone**. C'est du sucre par-dessus les Promises.

### async function
\`async function getMission() {\`
\`  // ...\`
\`  return 'Mission lunaire';   // promesse resolue avec cette valeur\`
\`}\`

**Une fonction async retourne TOUJOURS une Promise**, meme si tu return une valeur simple.

### await
**await** met en pause la fonction async jusqu'a ce que la Promise resolve.

\`async function main() {\`
\`  const m = await getMission();\`
\`  console.log(m);\`
\`}\`

### IIFE async
**await ne peut etre utilise QUE dans une async function**. Pour l'utiliser au top-level d'un script, on encapsule dans une async arrow auto-invoquee :

\`(async () => {\`
\`  const v = await ...;\`
\`  console.log(v);\`
\`})();\`

### vs .then()
- **then()** : chains lisibles pour les transformations sequentielles.
- **async/await** : preferable des qu'il y a plusieurs awaits, du if/else, ou du try/catch.

**A retenir :** await rend le code **vertical** (lisible de haut en bas) au lieu de **horizontal** (chains de .then).
        `,
      },
      objectives: [
        { id: "o2a", label: "Definir une fonction async" },
        { id: "o2b", label: "Logger 'Mission lunaire' via await" },
      ],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 02",
      missionTtl: "AWAIT EN ACTION",
      bannerIcon: "🔗",
      bannerTtl: "FLUX SYNCHRONISE",
      bannerSub: "Le code asynchrone se lit comme du synchrone.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree une fonction async badAPI() qui REJETE avec new Error('timeout').\n// Dans un async IIFE, attrape l'erreur avec try/catch et logge 'Erreur: ' + err.message.\n",
      placeholder: "// try / catch avec await",
      narrator:
        "Les communications echouent parfois. Cree une fonction async qui rejette une erreur, puis attrape-la proprement avec try/catch dans le bloc appelant.",
      hint: "async function badAPI() { throw new Error('timeout'); }\n(async () => { try { await badAPI(); } catch (err) { console.log('Erreur: ' + err.message); } })();",
      briefing: {
        title: "try / catch avec await",
        content: `
### Gerer les rejects
Une fonction async qui **throw** une erreur **rejette** sa Promise. Pour la rattraper avec await, on utilise try/catch standard.

\`async function badAPI() {\`
\`  throw new Error('timeout');\`
\`}\`

\`async function main() {\`
\`  try {\`
\`    await badAPI();\`
\`  } catch (err) {\`
\`    console.log('Erreur: ' + err.message);\`
\`  }\`
\`}\`

### Equivalent avec .then()
\`badAPI()\`
\`  .then((v) => ...)\`
\`  .catch((err) => console.log('Erreur:', err));\`

### finally
S'execute dans les deux cas (succes ou echec). Utile pour cacher un loader :
\`try {\`
\`  showLoader();\`
\`  const data = await fetchData();\`
\`} catch (err) {\`
\`  showError(err);\`
\`} finally {\`
\`  hideLoader();\`
\`}\`

### Erreur non rattrapee
Une Promise rejetee sans .catch() ni try/catch declenche un avertissement "unhandled promise rejection". A ne jamais ignorer.

**A retenir :** une fonction async sans try/catch propage l'erreur vers son appelant — comme une fonction synchrone classique.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser try/catch avec await" },
        { id: "o3b", label: "Logger une chaine contenant 'timeout'" },
      ],
      missionIcon: "⚠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "GESTION D'ERREUR",
      bannerIcon: "⚠",
      bannerTtl: "ERREUR INTERCEPTEE",
      bannerSub: "Une erreur asynchrone ne plante plus le programme.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Cree 3 promises p1, p2, p3 qui resolvent avec 1, 2, 3 apres des delais courts.\n// Utilise Promise.all pour attendre les 3 et logger le tableau de resultats.\n",
      placeholder: "// Promise.all([...])",
      narrator:
        "Trois operations independantes. Utilise Promise.all pour les paralleliser et recuperer leurs resultats ensemble.",
      hint: "const p1 = new Promise(r => setTimeout(() => r(1), 10));\nconst p2 = new Promise(r => setTimeout(() => r(2), 10));\nconst p3 = new Promise(r => setTimeout(() => r(3), 10));\nPromise.all([p1, p2, p3]).then((arr) => console.log(arr));",
      briefing: {
        title: "Promise.all",
        content: `
### Parallelisation
Quand plusieurs operations independantes peuvent **tourner en meme temps**, on utilise **Promise.all**.

\`Promise.all([p1, p2, p3]).then((arr) => {\`
\`  // arr = [val1, val2, val3]\`
\`});\`

### Pourquoi parallel et pas sequentiel ?
- **Sequentiel** (await chaque) : temps = somme des durees.
- **Parallel** (Promise.all) : temps = la plus longue duree.

Pour 3 fetches de 200ms chacun : 600ms vs 200ms.

### Comportement en cas d'echec
**Promise.all rejette des qu'UNE Promise rejette.** Les autres continuent mais leurs resultats sont perdus.

### Variantes
- **Promise.allSettled([...])** : attend toutes, retourne {status, value/reason} pour chacune. Ne rejette jamais.
- **Promise.race([...])** : retourne la **premiere** qui resout/rejette.
- **Promise.any([...])** : retourne la **premiere** qui resout (ignore les rejets).

### Avec async/await
\`const [a, b, c] = await Promise.all([p1, p2, p3]);\`
Lisible et destructurant.

**A retenir :** des qu'il y a 2+ operations independantes, **paralleliser** avec Promise.all.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser Promise.all([...])" },
        { id: "o4b", label: "Logger un tableau contenant 1, 2, 3" },
      ],
      missionIcon: "⛓",
      missionTag: "PROTOCOLE 04",
      missionTtl: "EXECUTION PARALLELE",
      bannerIcon: "⛓",
      bannerTtl: "OPERATIONS GROUPEES",
      bannerSub: "Promise.all attend tout le monde en parallele.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
