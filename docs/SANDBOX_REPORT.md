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
| **React** | composant monté et rendu dans une iframe `sandbox` persistante (JSX transformé par Sucrase **dans le navigateur**) | analyse **statique** du code source — l'aperçu affiche, il ne juge pas |
| **Cursus statiques** (Git, SQL, Python, TS, Node…) | aucune exécution | analyse statique par motifs (pattern-matching) |

Le principe directeur : **on n'exécute du code que lorsque c'est nécessaire (JS, React), et toujours dans une iframe `sandbox` à origine opaque.** Tout le reste est validé en lisant le texte saisi, ce qui supprime entièrement la surface d'attaque pour ces cursus.

Le cas React mérite d'être distingué : le code y est **exécuté pour être montré**, jamais pour être jugé. La validation reste purement statique, donc l'exécution n'a aucune autorité sur la progression de l'apprenant.

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
| Boucle infinie / script bloquant — **cursus JS** | Timeout parent 3 s + suppression de l'iframe (`run-js.ts`, iframe headless) |
| Boucle infinie / script bloquant — **cursus React** | **Non mitigeable après envoi.** Voir la note ci-dessous. Refus statique avant envoi (`loop-guard.ts`) |
| Message forgé vers le parent | Vérification `event.source` **et** `event.origin === "null"` |
| Navigation / popups / formulaires malicieux | Non autorisés par le sandbox (`allow-scripts` seul) |
| Exfiltration réseau | Bornée par la CSP (`connect-src 'self'` + jsdelivr) |

---

## 7. Limites et pistes d'amélioration

- **Pas de limite mémoire/CPU stricte.** Le timeout borne la **durée**, pas la consommation. Une allocation massive (`new Array(1e9)`) peut momentanément peser sur l'onglet avant les 3 s. Un vrai isolat (Web Worker dédié + terminaison forcée) offrirait un contrôle plus fin.
- **Exécution côté client uniquement.** Le sandbox tourne dans le navigateur de l'apprenant : il protège **l'application**, pas la machine de l'utilisateur contre son propre code (ce qui est acceptable ici). Les cursus « serveur » (Node, SQL) sont volontairement validés en statique, sans backend d'exécution.
- **`postMessage(..., "*")`.** L'iframe poste vers le parent avec une cible `"*"` ; comme l'iframe est éphémère et locale, le risque est faible, mais une cible d'origine explicite serait plus stricte. *(Corrigé depuis pour le sandbox JS et l'aperçu React : l'iframe cible désormais l'origine du parent.)*

- **Asymétrie assumée sur l'aperçu React : le parent poste vers `"*"`.** Dans l'autre sens, `postMessage` n'accepte aucune autre cible — l'iframe est à origine opaque, et `"null"` n'est pas une valeur de cible valide. Acceptable ici parce que la charge utile est le code de l'apprenant lui-même, pas un secret, et que l'iframe vérifie `event.source === parent`. Mais c'est une vraie asymétrie avec le reste du sandbox, à ne pas enterrer.

- **Une boucle infinie React fige l'onglet, et rien ne peut la rattraper.** Vérifié au navigateur le 2026-07-31 : une iframe `srcdoc` à origine opaque **partage le thread principal du parent** dans Chromium. Un `while (true)` dans le composant a gelé l'onglet entier pendant 58 secondes ; un chien de garde côté parent ne peut donc jamais s'exécuter. Le contraste avec le cursus JS est instructif : là-bas l'iframe est *headless*, donc le timeout parent fonctionne — ici elle est visible et interactive, ce qui impose le partage de thread.

  Conséquence : `lib/sandbox/loop-guard.ts` **refuse d'envoyer** un code contenant une boucle littéralement sans fin, plutôt que de prétendre le rattraper. C'est un filet pédagogique, **pas une sécurité** : `let x = true; while (x) {}` le contourne trivialement. Assumé — l'apprenant ne piège que lui-même et recharge la page. Le seul vrai correctif serait de servir l'aperçu depuis une **autre origine**, ce qui lui donnerait son propre processus ; c'est un chantier d'infrastructure à part entière.
- **Validation statique contournable.** Pour les cursus non exécutés, un apprenant déterminé pourrait « tromper » le pattern-matching. Ce n'est pas un risque de sécurité (aucune exécution), seulement une limite pédagogique assumée.

---

## 8. Fichiers de référence

| Fichier | Rôle |
|---|---|
| `lib/sandbox/run-js.ts` | Cœur du sandbox JS : iframe isolée **headless et à un coup**, console/localStorage simulés, timeout, postMessage |
| `lib/sandbox/react-preview.ts` | Sandbox React : `srcdoc` de l'iframe **persistante et visible**, protocole de messages, frontière d'erreur |
| `lib/sandbox/jsx-transform.ts` | Transformation JSX → JS par Sucrase, **dans le navigateur** — le code de l'apprenant ne part jamais sur le réseau |
| `lib/sandbox/loop-guard.ts` | Refus avant envoi des boucles littérales sans fin (voir la note sur le thread partagé) |
| `components/lesson/ReactPreview.tsx` | Cycle de vie de l'aperçu React : poignée de main, file d'attente, affichage des erreurs |
| `components/lesson/ChapterWorkspace.tsx` | Orchestration : appel à `runJs`, aperçu HTML/CSS, aperçu React, affichage console |
| `next.config.ts` | CSP et en-têtes de sécurité alignés sur le sandbox |
| `lib/validators/**` | Validation (exécutée pour JS, statique pour le reste) — voir le rapport dédié |
