# Rapport technique — Sandbox d'exécution du code étudiant

**Projet :** CodeForge / Nebula Command
**Périmètre :** exécution sécurisée du code écrit par les apprenants, et rendu des aperçus
**Date :** 2026-06-17

---

## 1. Le problème

Une plateforme d'apprentissage du code doit **exécuter du code arbitraire écrit par l'utilisateur**, puis vérifier le résultat. C'est intrinsèquement dangereux : sans isolation, du code étudiant (volontairement malveillant ou simplement bugué) pourrait lire les cookies de session, accéder au `localStorage` de l'app, manipuler le DOM principal (XSS), exfiltrer des données, ou figer l'onglet avec une boucle infinie.

L'enjeu est donc de **faire tourner ce code tout en l'isolant complètement** de l'application, et de **borner sa durée d'exécution**.

---

## 2. Stratégie retenue

Deux mécanismes distincts selon le type de cursus :

| Type de contenu | Exécution | Validation |
|---|---|---|
| **JavaScript** (et cursus exécutés) | `runJs()` dans une iframe isolée, console capturée | analyse de la sortie (`logs`, `error`, `lastValue`) |
| **HTML / CSS** | aperçu live dans une iframe `sandbox` | analyse **statique** du code source (pas d'exécution) |
| **Cursus statiques** (Git, SQL, Python, React, TS, Node…) | aucune exécution | analyse statique par motifs (pattern-matching) |

Le principe directeur : **on n'exécute du code que lorsque c'est nécessaire (JS), et toujours dans une iframe `sandbox` à origine opaque.** Tout le reste est validé en lisant le texte saisi, ce qui supprime entièrement la surface d'attaque pour la majorité des cursus.

---

## 3. Le sandbox JavaScript (`lib/sandbox/run-js.ts`)

### 3.1 Isolation par iframe à origine opaque

Le code est exécuté dans une `<iframe>` créée dynamiquement, masquée, avec l'attribut :

```
sandbox="allow-scripts"
```

Le point crucial est l'**absence de `allow-same-origin`**. Une iframe `sandbox` sans ce drapeau reçoit une **origine opaque** (la chaîne littérale `"null"`). Conséquences :

- elle **ne partage pas l'origine** de l'application : impossible d'accéder à `window.parent` en lecture/écriture, aux cookies, au `localStorage`/`sessionStorage` réels, ni à quoi que ce soit de same-origin ;
- `allow-scripts` autorise uniquement l'exécution de JavaScript à l'intérieur de la bulle, rien d'autre (pas de navigation top-level, pas de formulaires, pas de popups).

C'est la garantie d'isolation principale, fournie nativement par le navigateur.

### 3.2 Injection et exécution du code

Le code étudiant est injecté via `srcdoc` et exécuté ainsi, à l'intérieur de l'iframe :

```js
const fn = new Function(
  "console", "localStorage",
  '"use strict"; return (function(){\n' + JSON.stringify(code) + '\n})();'
);
lastValue = fn(fakeConsole, fakeStorage);
```

Points notables :

- **`"use strict"`** force le mode strict (erreurs plus tôt, pas de variables globales implicites).
- Le code est passé via `JSON.stringify`, ce qui le neutralise correctement comme chaîne (pas d'évasion de contexte par guillemets).
- On capture la **valeur de la dernière expression** (`lastValue`) pour permettre des validations fines.

### 3.3 Console et localStorage simulés

- **`fakeConsole`** : `log`, `info`, `warn`, `error`, `debug` sont redirigés vers un tableau `logs[]`, formatés par une fonction `formatArg` (gère `null`, `undefined`, objets via `JSON.stringify`, fonctions…). C'est cette sortie qui est affichée à l'apprenant **et** transmise au validateur.
- **`fakeStorage`** : une iframe à origine opaque n'a pas de véritable API `Storage`. Un **shim en mémoire** (objet `__store`) réimplémente `getItem/setItem/removeItem/clear/key/length`, pour que les chapitres qui enseignent `localStorage` fonctionnent. Il ne persiste pas entre deux exécutions — comportement volontaire et sans incidence pédagogique.

### 3.4 Communication parent ↔ iframe (durcie)

Le résultat remonte par `postMessage`. Le parent applique une **double vérification** avant d'accepter un message :

```js
if (event.source !== iframe.contentWindow) return; // vient bien de NOTRE iframe
if (event.origin !== "null") return;               // origine opaque attendue
```

La seconde vérification est de la **défense en profondeur** : si un jour les attributs du sandbox changeaient, le filtre d'origine resterait un garde-fou.

### 3.5 Garde-fou temporel (anti-boucle infinie)

Le parent arme un **timeout de 3 secondes**. Si l'iframe n'a pas répondu (boucle infinie, script bloquant), on résout l'exécution en erreur explicite (« Exécution interrompue après 3s… ») et on **retire l'iframe**, ce qui tue le contexte d'exécution.

Côté iframe, un **délai de 300 ms** précède l'envoi du résultat, pour laisser le temps à du travail asynchrone léger (`setTimeout`, `Promise`, `async/await`) de vider ses logs avant la sérialisation — tout en restant largement dans le budget de 3 s.

### 3.6 Nettoyage

À la fin (succès, erreur ou timeout), `cleanup()` retire l'écouteur `message`, annule le timeout et **supprime l'iframe du DOM** : pas de fuite de contexte ni d'écouteur résiduel.

---

## 4. L'aperçu HTML / CSS (`components/lesson/ChapterWorkspace.tsx`)

Pour les cursus HTML et CSS, le code saisi est injecté **en direct** dans une iframe d'aperçu, elle aussi en `sandbox="allow-scripts"` :

```jsx
<iframe ref={iframeRef} sandbox="allow-scripts" title="Aperçu" />
// ...
iframeRef.current.srcdoc = code;
```

Ici **la validation ne dépend pas de l'exécution** : elle est **statique** (analyse du source). L'iframe ne sert qu'à montrer le rendu visuel à l'apprenant, en restant isolée. Un détail UX : la frappe déclenche une détection de balises fermées (`detectClosedTags`) avec anti-rebond (150 ms) pour les effets sonores/visuels, sans jamais exécuter de logique sensible.

---

## 5. Intégration avec la politique de sécurité (CSP)

La `Content-Security-Policy` définie dans `next.config.ts` (active en production) est **alignée** sur ce besoin :

- `frame-src 'self' blob:` et `child-src 'self' blob:` — autorisent les iframes `srcdoc`/`blob:` du runner ;
- `worker-src 'self' blob:` — pour les web workers de l'éditeur Monaco ;
- `script-src` / `style-src` autorisent le CDN jsdelivr (Monaco) et l'inline nécessaire à Next.

Autrement dit, l'exécution du code étudiant a été pensée **conjointement** avec la CSP : l'iframe sandbox vit dans le périmètre autorisé, sans ouvrir l'app à des sources externes arbitraires.

---

## 6. Modèle de menaces (synthèse)

| Menace | Contre-mesure |
|---|---|
| Vol de session / cookies | Origine opaque (`sandbox` sans `allow-same-origin`) → pas d'accès same-origin |
| Accès au `localStorage` de l'app | Idem + shim en mémoire isolé dans l'iframe |
| XSS sur le DOM principal | Le code ne s'exécute jamais dans le document de l'app, seulement dans l'iframe |
| Boucle infinie / script bloquant | Timeout parent 3 s + suppression de l'iframe |
| Message forgé vers le parent | Vérification `event.source` **et** `event.origin === "null"` |
| Navigation / popups / formulaires malicieux | Non autorisés par le sandbox (`allow-scripts` seul) |
| Exfiltration réseau | Bornée par la CSP (`connect-src 'self'` + jsdelivr) |

---

## 7. Limites et pistes d'amélioration

- **Pas de limite mémoire/CPU stricte.** Le timeout borne la **durée**, pas la consommation. Une allocation massive (`new Array(1e9)`) peut momentanément peser sur l'onglet avant les 3 s. Un vrai isolat (Web Worker dédié + terminaison forcée) offrirait un contrôle plus fin.
- **Exécution côté client uniquement.** Le sandbox tourne dans le navigateur de l'apprenant : il protège **l'application**, pas la machine de l'utilisateur contre son propre code (ce qui est acceptable ici). Les cursus « serveur » (Node, SQL) sont volontairement validés en statique, sans backend d'exécution.
- **`postMessage(..., "*")`.** L'iframe poste vers le parent avec une cible `"*"` ; comme l'iframe est éphémère et locale, le risque est faible, mais une cible d'origine explicite serait plus stricte.
- **Validation statique contournable.** Pour les cursus non exécutés, un apprenant déterminé pourrait « tromper » le pattern-matching. Ce n'est pas un risque de sécurité (aucune exécution), seulement une limite pédagogique assumée.

---

## 8. Fichiers de référence

| Fichier | Rôle |
|---|---|
| `lib/sandbox/run-js.ts` | Cœur du sandbox JS : iframe isolée, console/localStorage simulés, timeout, postMessage |
| `components/lesson/ChapterWorkspace.tsx` | Orchestration : appel à `runJs`, aperçu HTML/CSS, affichage console |
| `next.config.ts` | CSP et en-têtes de sécurité alignés sur le sandbox |
| `lib/validators/**` | Validation (exécutée pour JS, statique pour le reste) — voir le rapport dédié |
