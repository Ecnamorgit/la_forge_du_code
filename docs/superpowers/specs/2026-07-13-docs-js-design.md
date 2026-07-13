# Spec — Parité du panneau de référence : JavaScript (tâche 7B)

> Rédigé le 2026-07-13. Sous-projet 7B : étendre au cursus JavaScript les fiches de
> référence, en réutilisant l'infrastructure créée en 7A (résolveur multi-domaine
> `data/docs/index.ts`, DocPanel, câblage `docRefs`). Clôt la tâche 7 et le backlog
> de cohérence.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (tâche 7).
> Design validé : 12 fiches, une par chapitre JS.

## 1. Objectif

Donner au cursus JavaScript le même panneau de référence que HTML et CSS : 12 fiches
`DocEntry` (une par chapitre), branchées au cluster « Références de cette étape ».
Après 7B, les trois cursus complets sont à parité pédagogique.

## 2. Décisions validées

- **Portée** : JavaScript. Densité : **12 fiches**, une par chapitre (concept phare).
- **Réutilise 7A** : résolveur `data/docs/index.ts` (fusionne déjà html+css), DocPanel,
  champ `Step.docRefs?`. Aucun repointage d'import (déjà fait en 7A).
- **Tokens inline `[[doc:js/…]]`** : hors périmètre (on câble le cluster `docRefs`).

## 3. Architecture

### 3.1 Fiches JS — `data/docs/js/*.ts` + `data/docs/js/index.ts` (nouveaux)
Même forme que HTML/CSS (`DocEntry`, [data/docs/types.ts](../../../data/docs/types.ts)) ;
domaine `"js"`, id `"js/<slug>"` ; barrel `jsDocs: Record<string, DocEntry>` (comme
`htmlDocs`/`cssDocs`).

Les 12 fiches (une par chapitre) :

| id | term | Concept (chapitre) |
|---|---|---|
| `js/console` | `console.log` | Variables & affichage (ch1) |
| `js/conditions` | `if / else` | Opérateurs & décisions (ch2) |
| `js/fonctions` | `function` | Fonctions (ch3) |
| `js/tableaux` | `Array` | Tableaux & boucles (ch4) |
| `js/objets` | `{ }` | Objets & méthodes (ch5) |
| `js/array-methods` | `.map()` | map / filter / reduce (ch6) |
| `js/dom` | `document` | DOM (ch7) |
| `js/events` | `addEventListener` | Événements (ch8) |
| `js/async` | `async / await` | Promises & async (ch9) |
| `js/localstorage` | `localStorage` | Stockage local (ch10) |
| `js/fetch` | `fetch()` | Réseau & fetch (ch11) |
| `js/rest` | `REST` | API REST & HTTP (ch12) |

Chaque fiche : `id`, `domain: "js"`, `term`, `title`, `summary`, `body` (markdown maison),
`syntax`, au moins un `examples[]`, `pitfalls[]`, `related[]` (ids js/html/css existants),
`official` (lien MDN fr). Le plan pré-écrit les 12.

### 3.2 Résolveur — `data/docs/index.ts` (modif)
Ajouter l'import `jsDocs` et l'étaler dans `ALL_DOCS` :
```ts
export const ALL_DOCS: Record<string, DocEntry> = { ...htmlDocs, ...cssDocs, ...jsDocs };
```
`getDocEntry` reste inchangé (résout désormais html/css/js). Clés disjointes par préfixe.

### 3.3 Câblage `docRefs` — `data/courses/javascript/chapitre-{1..12}.ts`
Ajouter `docRefs: ["js/<slug>"]` sur **l'étape phare (1re)** de chaque chapitre JS, après
le tableau `objectives` de cette étape. Le rendu est déjà en place.

### 3.4 Tests
- Intégrité JS (calquée sur le test CSS) : id == clé, `domain === "js"`, préfixe `js/`,
  champs obligatoires non vides, tous les `related` résolvent (js/html/css).
- Test que les 12 `docRefs` JS des cours résolvent via `getDocEntry`.

## 4. Fichiers touchés

| Fichier | Nature |
|---|---|
| `data/docs/js/*.ts` (×12) | nouveau — les 12 fiches JS |
| `data/docs/js/index.ts` | nouveau — barrel `jsDocs` |
| `data/docs/js/docs-js.test.ts` | nouveau — registre/intégrité JS |
| `data/docs/index.ts` | modif — ajoute `...jsDocs` à `ALL_DOCS` |
| `data/docs/docs-resolver.test.ts` | modif — ajoute un cas de résolution JS |
| `data/courses/javascript/chapitre-{1..12}.ts` | modif — `docRefs` sur l'étape phare |
| `data/courses/javascript/docrefs-js.test.ts` | nouveau — résolution des docRefs JS |

## 5. Tests
- **Unitaire (Vitest, node)** : `getDocEntry("js/fetch")` résout ; intégrité JS (12, id/clé/domaine,
  related résolvent) ; les 12 docRefs JS résolvent.
- **Composant** : pas de test de rendu → `tsc`/`eslint`/`next build`.
- **Visuel (navigateur)** : sur un chapitre JS, le cluster « Références de cette étape » affiche
  la fiche et le panneau s'ouvre au clic (comme html/css).

## 6. Critères d'acceptation
- [ ] 12 fiches JS complètes (une par chapitre), forme identique à html/css.
- [ ] `getDocEntry` résout `js/*` (en plus de html/css) ; clés disjointes.
- [ ] `docRefs` JS câblés sur l'étape phare de chaque chapitre, tous résolvant.
- [ ] Tests intégrité/résolution JS verts ; `tsc`/`lint`/tests verts ; `next build` OK.
- [ ] Fiches html/css et leur panneau inchangés (non-régression).

## 7. Hors périmètre
Tokens inline `[[doc:js/…]]` ; couverture exhaustive (plusieurs fiches/chapitre) ;
cursus « aperçu » (react, sql…). Le backlog de cohérence est clos après 7B.
