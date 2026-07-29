# Profondeur React — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter le cursus React de 4 à 8 chapitres, à parité avec HTML, en validateurs statiques.

**Architecture:** Chaque chapitre est un fichier de données (`ChapterData`, 4 étapes) plus un fichier de validateurs statiques (regex sur le source), câblés dans 5 registres. Aucun changement de moteur.

**Tech Stack:** TypeScript, Vitest. Aucune dépendance nouvelle.

**Spec:** `docs/superpowers/specs/2026-07-29-react-profondeur-design.md`
**Branche:** `feat/react-profondeur`

## Global Constraints

- **4 étapes par chapitre**, `totalXp: 280`, réparti **65 / 70 / 70 / 75** dans les `bannerXp`.
- **Texte sans accents** dans les chaînes de `data/courses/**` — convention existante (`Decouvre`, `reactivite`, `Cree`). Les commentaires de code et les docs gardent leurs accents.
- Ton narrateur : univers **Nebula Command**, tutoiement du Cadet, vocabulaire spatial. Cadre React : « Station de Réplication Multiplicative ».
- Le nom canonique de la menace est **Spectre**. Jamais « Null », jamais « Glitch ».
- Objectifs : **exactement 2 par étape**, ids `o1a`/`o1b`, `o2a`/`o2b`, `o3a`/`o3b`, `o4a`/`o4b`.
- Validateurs **statiques uniquement**, via `lib/validators/_static-utils` (`stripLineComments`, `countMatches`, `fail`, `pass`). Ne jamais exécuter le code.
- `pass(msg, objList)` prend la liste des ids d'objectifs de l'étape.
- **Aucune fiche `docRefs`** sur ces chapitres (voir spec).
- **Aucune migration de schéma.** Si un besoin apparaît, s'arrêter et le signaler.
- Ne pas modifier `lib/sandbox/**`, `lib/lore.ts`, `lib/public-routes.ts`, `proxy.ts`.

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `data/courses/react/chapitre-{5,6,7,8}.ts` | **créés** — `export const chapitreN: ChapterData` |
| `lib/validators/react/chapitre-{5,6,7,8}.ts` | **créés** — `export const validators: Validator[]`, 4 entrées |
| `lib/validators/react/chapitre-{5,6,7,8}.test.ts` | **créés** — cas passant + cas échouant par étape |
| `lib/validators/react/index.ts` | **modifié** — 4 entrées dans `VALIDATORS_BY_CHAPTER` |
| `lib/courses-registry.ts` | **modifié** — imports + `toMap` de `react` |
| `lib/courses-meta.ts` | **modifié** — `CHAPTER_BADGES.react` |
| `lib/badges-catalog.ts` | **modifié** — 4 badges |
| `lib/chapter-summaries.ts` | **modifié** — 4 entrées |
| `lib/spectre-trap.test.ts` | **modifié** — piège du chapitre 6 |
| `lib/courses-catalog.ts` | **modifié** (Task 5) — description React |

## Le patron de référence

**Lire `data/courses/react/chapitre-4.ts` en entier avant d'écrire quoi que ce soit.** C'est le gabarit : structure des étapes, longueur et style des briefings markdown, ton du narrateur, forme des `hint`. Lire aussi `lib/validators/react/chapitre-4.ts` pour la forme des validateurs.

Un chapitre réussi est **indiscernable** de celui-là.

---

## Task 1: Chapitre 5 — REACT & LISTES

**Files:**
- Create: `data/courses/react/chapitre-5.ts`, `lib/validators/react/chapitre-5.ts`, `lib/validators/react/chapitre-5.test.ts`
- Modify: `lib/validators/react/index.ts`, `lib/courses-registry.ts`, `lib/courses-meta.ts`, `lib/badges-catalog.ts`, `lib/chapter-summaries.ts`

**Interfaces:**
- Produces: `chapitre5: ChapterData`, `validators: Validator[]` (4), badge `react-fleet`

**Identité du chapitre :**
- `slug: "chapitre-5"`, `tag: "MISSION : FLOTTE DYNAMIQUE"`
- `title: "REACT &\nLISTES"`, `subtitle` sur le rendu de collections
- `completionBadge: "🛰"`, `completionBadgeLabel: "CARTOGRAPHE DE FLOTTE"`
- Badge catalogue : `{ id: "react-fleet", icon: "🛰", label: "Cartographe de Flotte", description: "Listes et cles React" }`

**Les 4 étapes :**
1. **Rendre un tableau avec `.map()`** — transformer un tableau de données en JSX. Validateur : présence de `.map(`, et d'un retour JSX dans le callback.
2. **La prop `key`** — pourquoi React en a besoin, pourquoi l'index est un mauvais choix quand la liste bouge. Validateur : `key={` présent, et l'expression n'est pas `index`/`i` seul.
3. **Filtrer avant de rendre** — chaîner `.filter()` puis `.map()`. Validateur : les deux appels présents, dans cet ordre.
4. **Liste vide** — afficher un message quand la collection est vide plutôt qu'un blanc. Validateur : un test de longueur (`.length === 0` ou `!length`) et un retour alternatif.

- [ ] **Step 1: Lire le patron**

Lire `data/courses/react/chapitre-4.ts` et `lib/validators/react/chapitre-4.ts` en entier.

- [ ] **Step 2: Écrire les tests de validateurs (ils échouent)**

Créer `lib/validators/react/chapitre-5.test.ts`. Pour chacune des 4 étapes : un code conforme qui doit passer, et au moins un code fautif qui doit échouer avec un message utile.

Le cas échouant doit être **réaliste** — l'erreur qu'un débutant commet vraiment (oublier `key`, mettre `key={i}`, oublier le cas liste vide), pas un `"xxx"` arbitraire.

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

```bash
pnpm vitest run lib/validators/react/chapitre-5.test.ts
```

Attendu : ÉCHEC — module introuvable.

- [ ] **Step 4: Écrire le chapitre et ses validateurs**

Créer `data/courses/react/chapitre-5.ts` puis `lib/validators/react/chapitre-5.ts`.

- [ ] **Step 5: Câbler les 5 registres**

`lib/validators/react/index.ts`, `lib/courses-registry.ts` (import + `toMap`), `lib/courses-meta.ts` (`CHAPTER_BADGES.react`), `lib/badges-catalog.ts`, `lib/chapter-summaries.ts`.

- [ ] **Step 6: Vérifier**

```bash
pnpm vitest run lib/validators/react/chapitre-5.test.ts
pnpm test:run
pnpm typecheck && pnpm lint
```

Attendu : tests du chapitre verts, suite complète verte, typecheck et lint à 0 erreur.

- [ ] **Step 7: Commit**

```bash
git add data/courses/react/chapitre-5.ts lib/validators/react/chapitre-5.ts lib/validators/react/chapitre-5.test.ts lib/validators/react/index.ts lib/courses-registry.ts lib/courses-meta.ts lib/badges-catalog.ts lib/chapter-summaries.ts
git commit -m "feat(react): chapitre 5 - listes et cles"
```

---

## Task 2: Chapitre 6 — REACT & FORMULAIRES

**Files:**
- Create: `data/courses/react/chapitre-6.ts`, `lib/validators/react/chapitre-6.ts`, `lib/validators/react/chapitre-6.test.ts`
- Modify: les 5 registres + `lib/spectre-trap.test.ts`

**Interfaces:**
- Produces: `chapitre6: ChapterData`, `validators: Validator[]` (4), badge `react-forms`

**Identité :**
- `tag: "MISSION : CONSOLE DE COMMANDE"`, `title: "REACT &\nFORMULAIRES"`
- `completionBadge: "🎛"`, `completionBadgeLabel: "OPERATEUR DE CONSOLE"`
- Badge : `{ id: "react-forms", icon: "🎛", label: "Opérateur de Console", description: "Formulaires controles" }`

**Les 4 étapes :**
1. **Input contrôlé — ÉTAPE-PIÈGE SPECTRE.** Le `startCode` porte un `<input value={nom} />` **sans `onChange`** : le champ refuse la saisie. Le Cadet doit brancher `onChange`. Champ `spectreTrap` obligatoire : une raillerie du Spectre, en français avec accents, du même ton que `data/courses/javascript/chapitre-1.ts:14`. Validateur : `value=` **et** `onChange=` présents, avec un `setX` dans le handler.
2. **Plusieurs champs dans un objet d'état** — un seul `useState({ ... })`, mise à jour immutable par spread. Validateur : `useState({`, un spread `...` dans le setter, et une clé calculée ou deux champs distincts.
3. **Soumission** — `onSubmit` sur le `<form>` avec `e.preventDefault()`. Validateur : `onSubmit=`, `preventDefault()`. Doit **échouer** si le handler est sur le bouton (`onClick`) au lieu du formulaire.
4. **Validation et bouton désactivé** — `disabled` calculé depuis l'état. Validateur : `disabled={` avec une expression dérivée de l'état, pas `disabled={false}`.

- [ ] **Step 1: Lire le patron et l'exemple de piège**

`data/courses/react/chapitre-4.ts`, `lib/validators/react/chapitre-4.ts`, et le piège de `data/courses/javascript/chapitre-1.ts` (étape 1) pour le ton du `spectreTrap`.

- [ ] **Step 2: Écrire les tests (ils échouent)**

Comme Task 1. Pour l'étape 3, inclure explicitement le cas `onClick` sur le bouton, qui doit échouer.

- [ ] **Step 3: Lancer pour vérifier l'échec**

```bash
pnpm vitest run lib/validators/react/chapitre-6.test.ts
```

- [ ] **Step 4: Écrire le chapitre et ses validateurs**

Le `startCode` de l'étape 1 doit être **réellement cassé** : un `value={}` sans `onChange`. C'est ce que le Cadet répare.

- [ ] **Step 5: Câbler, et déclarer le piège**

Les 5 registres, plus l'entrée `["react", "chapitre-6", 0]` dans le tableau `TRAPS` de `lib/spectre-trap.test.ts`.

- [ ] **Step 6: Vérifier**

```bash
pnpm vitest run lib/validators/react/chapitre-6.test.ts lib/spectre-trap.test.ts
pnpm test:run
pnpm typecheck && pnpm lint
```

- [ ] **Step 7: Commit**

```bash
git add data/courses/react/chapitre-6.ts lib/validators/react/chapitre-6.ts lib/validators/react/chapitre-6.test.ts lib/validators/react/index.ts lib/courses-registry.ts lib/courses-meta.ts lib/badges-catalog.ts lib/chapter-summaries.ts lib/spectre-trap.test.ts
git commit -m "feat(react): chapitre 6 - formulaires controles + etape-piege Spectre"
```

---

## Task 3: Chapitre 7 — HOOKS PERSONNALISÉS

**Files:**
- Create: `data/courses/react/chapitre-7.ts`, `lib/validators/react/chapitre-7.ts`, `lib/validators/react/chapitre-7.test.ts`
- Modify: les 5 registres

**Interfaces:**
- Produces: `chapitre7: ChapterData`, `validators: Validator[]` (4), badge `react-hooks`

**Identité :**
- `tag: "MISSION : MODULES REUTILISABLES"`, `title: "HOOKS\nPERSONNALISES"`
- `completionBadge: "🔧"`, `completionBadgeLabel: "FORGERON DE HOOKS"`
- Badge : `{ id: "react-hooks", icon: "🔧", label: "Forgeron de Hooks", description: "Hooks personnalises" }`

**Les 4 étapes :**
1. **Extraire en `useXxx`** — sortir de la logique d'un composant vers une fonction préfixée `use`. Validateur : déclaration `function useX` ou `const useX =`, et un appel depuis le composant.
2. **Un hook avec état** — `useCompteur` retournant valeur et actions. Validateur : `useState` **dans** le hook, et un `return` d'objet ou de tableau.
3. **Un hook avec effet** — `useLargeurFenetre` qui s'abonne à `resize` et se désabonne. Validateur : `useEffect`, `addEventListener`, et un `removeEventListener` dans la fonction de cleanup.
4. **Les règles des hooks** — pas d'appel conditionnel, préfixe `use` obligatoire. `startCode` contenant un appel de hook dans un `if`, à corriger en remontant l'appel. Validateur : aucun `useState`/`useEffect` à l'intérieur d'un bloc conditionnel.

Pour l'étape 4, le validateur doit chercher un motif du type `if (...) {` suivi d'un appel de hook avant l'accolade fermante. Un heuristique regex suffit ; documenter sa limite en commentaire.

- [ ] **Step 1: Lire le patron**
- [ ] **Step 2: Écrire les tests (ils échouent)**
- [ ] **Step 3: Lancer pour vérifier l'échec**

```bash
pnpm vitest run lib/validators/react/chapitre-7.test.ts
```

- [ ] **Step 4: Écrire le chapitre et ses validateurs**
- [ ] **Step 5: Câbler les 5 registres**
- [ ] **Step 6: Vérifier**

```bash
pnpm vitest run lib/validators/react/chapitre-7.test.ts
pnpm test:run
pnpm typecheck && pnpm lint
```

- [ ] **Step 7: Commit**

```bash
git add data/courses/react/chapitre-7.ts lib/validators/react/chapitre-7.ts lib/validators/react/chapitre-7.test.ts lib/validators/react/index.ts lib/courses-registry.ts lib/courses-meta.ts lib/badges-catalog.ts lib/chapter-summaries.ts
git commit -m "feat(react): chapitre 7 - hooks personnalises"
```

---

## Task 4: Chapitre 8 — CONTEXTE & useReducer

**Files:**
- Create: `data/courses/react/chapitre-8.ts`, `lib/validators/react/chapitre-8.ts`, `lib/validators/react/chapitre-8.test.ts`
- Modify: les 5 registres

**Interfaces:**
- Produces: `chapitre8: ChapterData`, `validators: Validator[]` (4), badge `react-context`

**Identité :**
- `tag: "MISSION : RESEAU DE COMMANDEMENT"`, `title: "CONTEXTE &\nuseReducer"`
- `completionBadge: "📡"`, `completionBadgeLabel: "COORDINATEUR DE FLOTTE"`
- Badge : `{ id: "react-context", icon: "📡", label: "Coordinateur de Flotte", description: "Contexte et useReducer" }`

**Les 4 étapes :**
1. **`createContext` + Provider** — créer un contexte et fournir une valeur. Validateur : `createContext(`, et un `<XContext.Provider value={`.
2. **`useContext` dans un enfant profond** — consommer sans prop drilling. Validateur : `useContext(`, avec le contexte en argument.
3. **`useReducer`** — un reducer avec deux actions au moins. Validateur : `useReducer(`, une fonction reducer avec un `switch` ou des `if` sur `action.type`, et un `dispatch(`.
4. **Combiner contexte et reducer** — fournir `state` et `dispatch` via le contexte. Validateur : `useReducer` **et** un Provider dont la `value` transporte `dispatch`.

Ce chapitre clôt le cursus : le `bannerSub` de l'étape 4 doit marquer l'aboutissement du parcours React.

- [ ] **Step 1: Lire le patron**
- [ ] **Step 2: Écrire les tests (ils échouent)**
- [ ] **Step 3: Lancer pour vérifier l'échec**

```bash
pnpm vitest run lib/validators/react/chapitre-8.test.ts
```

- [ ] **Step 4: Écrire le chapitre et ses validateurs**
- [ ] **Step 5: Câbler les 5 registres**
- [ ] **Step 6: Vérifier**

```bash
pnpm vitest run lib/validators/react/chapitre-8.test.ts
pnpm test:run
pnpm typecheck && pnpm lint
```

- [ ] **Step 7: Commit**

```bash
git add data/courses/react/chapitre-8.ts lib/validators/react/chapitre-8.ts lib/validators/react/chapitre-8.test.ts lib/validators/react/index.ts lib/courses-registry.ts lib/courses-meta.ts lib/badges-catalog.ts lib/chapter-summaries.ts
git commit -m "feat(react): chapitre 8 - contexte et useReducer"
```

---

## Task 5: Catalogue et vérification complète

**Files:**
- Modify: `lib/courses-catalog.ts`
- Modify: `README.md`

- [ ] **Step 1: Mettre à jour la description du cursus**

Dans `lib/courses-catalog.ts`, l'entrée `react` annonce « Construis des interfaces modernes : composants, useState, useEffect et React Router. » Elle doit mentionner les nouveaux sujets — listes, formulaires, hooks personnalisés, contexte — sans dépasser la longueur des autres descriptions du catalogue.

- [ ] **Step 2: Mettre à jour le README**

`README.md` annonce « **4 cursus complets** (HTML, CSS, JavaScript, React) ». Vérifier que le décompte des chapitres React n'y figure pas ailleurs, et corriger si oui.

- [ ] **Step 3: Vérifier que les 8 chapitres sont cohérents partout**

```bash
pnpm exec tsx scripts/verify-validators.ts 2>/dev/null || pnpm vitest run lib/courses-catalog.test.ts
```

Puis vérifier à la main que `getChapterData("react", "chapitre-8")` répond, et que chaque chapitre 5 à 8 a bien 4 validateurs.

- [ ] **Step 4: Gate complet**

```bash
pnpm lint && pnpm typecheck && pnpm test:run && pnpm build
```

```bash
pnpm exec playwright test --workers=2
```

Le cap à 2 workers est délibéré (voir spec). Si une spec préexistante échoue, vérifier qu'elle échoue **aussi** sans ce chantier avant de conclure à une régression.

- [ ] **Step 5: Vérifier au navigateur**

Démarrer le serveur, ouvrir la carte du cursus React, confirmer que les 8 chapitres apparaissent et que le chapitre 5 s'ouvre. Arrêter le serveur ensuite.

- [ ] **Step 6: Commit**

```bash
git add lib/courses-catalog.ts README.md
git commit -m "feat(react): catalogue et README a jour pour 8 chapitres"
```
