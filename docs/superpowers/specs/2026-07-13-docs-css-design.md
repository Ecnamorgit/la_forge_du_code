# Spec — Parité du panneau de référence : CSS (tâche 7A)

> Rédigé le 2026-07-13. Sous-projet 7A de la tâche 7 : étendre au cursus CSS les
> fiches de référence (aujourd'hui HTML uniquement). Introduit un résolveur de
> fiches multi-domaine (réutilisé par 7B pour JS) + 10 fiches CSS + câblage.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (tâche 7, fracture #5).
> Décisions validées : CSS d'abord ; ~1 fiche par chapitre CSS.

## 1. Objectif

Donner au cursus CSS le même appui pédagogique que HTML : un panneau de référence
(cluster « Références de cette étape ») alimenté par des fiches `DocEntry`. Corrige
l'asymétrie où seul HTML dispose de `docRefs`.

## 2. Décisions validées

- **Portée** : CSS uniquement (7A). JS = 7B, cycle distinct, réutilisera le résolveur.
- **Densité** : **10 fiches**, une par chapitre CSS (concept phare).
- **Tokens inline `[[doc:css/…]]`** dans les briefings : **hors périmètre** 7A (on câble le
  cluster `docRefs` de l'étape, pas les liens inline).

## 3. Architecture

### 3.1 Résolveur multi-domaine — `data/docs/index.ts` (nouveau)
Aujourd'hui `getDocEntry` vit dans [data/docs/html/index.ts](../../../data/docs/html/index.ts)
et ne connaît que HTML. On crée un résolveur au-dessus :
```ts
import type { DocEntry } from "./types";
import { htmlDocs } from "./html";
import { cssDocs } from "./css";

/** Toutes les fiches, tous domaines, clé = DocEntry.id (ex. "css/flexbox"). */
export const ALL_DOCS: Record<string, DocEntry> = { ...htmlDocs, ...cssDocs };

/** Retourne la fiche correspondant à l'id complet, ou undefined. */
export function getDocEntry(id: string): DocEntry | undefined {
  return ALL_DOCS[id];
}
```
- Repointer les 2 consommateurs de `@/data/docs/html` vers `@/data/docs` :
  [components/docs/DocPanel.tsx](../../../components/docs/DocPanel.tsx) et
  [app/learn/[course]/[chapter]/ChapterClient.tsx](../../../app/learn/[course]/[chapter]/ChapterClient.tsx).
- `data/docs/html/index.ts` reste tel quel (exporte `htmlDocs` + son `getDocEntry` local,
  toujours utilisé par les tests HTML) ; le nouveau `getDocEntry` de `data/docs/index.ts`
  est la source unique côté UI.

### 3.2 Fiches CSS — `data/docs/css/*.ts` + `data/docs/css/index.ts` (nouveaux)
Même forme que HTML : un fichier par fiche exportant un `DocEntry` (type inchangé,
[data/docs/types.ts](../../../data/docs/types.ts)), et un barrel `cssDocs: Record<string, DocEntry>`
(comme `htmlDocs`). Domaine = `"css"`, id = `"css/<slug>"`.

Les 10 fiches (une par chapitre) :

| id | term | Concept (chapitre) |
|---|---|---|
| `css/style` | `<style>` | Brancher le CSS (ch1) |
| `css/selecteurs` | `.classe` | Sélecteurs & classes (ch2) |
| `css/box-model` | box model | width/height/padding/border (ch3) |
| `css/flexbox` | `display: flex` | Flexbox (ch4) |
| `css/grid` | `display: grid` | Grid (ch5) |
| `css/position` | `position` | relative/absolute/fixed/sticky (ch6) |
| `css/pseudo-classes` | `:hover` | Pseudo-classes & états (ch7) |
| `css/media-queries` | `@media` | Responsive (ch8) |
| `css/transition` | `transition` | Transitions & animations (ch9) |
| `css/variables` | `var(--x)` | Variables CSS (ch10) |

Chaque fiche renseigne : `id`, `domain: "css"`, `term`, `title`, `summary`, `body`
(markdown maison), `syntax`, au moins un `examples[]`, `pitfalls[]`, `related[]`
(ids existants — html ou css), et `official` (lien MDN fr). Le plan pré-écrit les 10.

### 3.3 Câblage `docRefs` — `data/courses/css/chapitre-{1..10}.ts`
Ajouter `docRefs: ["css/<slug>"]` sur **l'étape du concept phare** de chaque chapitre
(en général la première étape). Le rendu (cluster « Références de cette étape ») est déjà
en place et fonctionnera dès que `getDocEntry` résout les ids CSS.

### 3.4 Tests — `data/docs/css/` + généralisation
- Un registre/intégrité CSS calqué sur `data/docs/docs-registry.test.ts` et
  `docs-integrity.test.ts` (id == clé, `domain === "css"`, `related` résolvent via le
  résolveur multi-domaine).
- Un test que **chaque `docRefs` CSS des cours résout** vers une fiche (via `getDocEntry`).

## 4. Fichiers touchés

| Fichier | Nature |
|---|---|
| `data/docs/index.ts` | nouveau — résolveur multi-domaine `getDocEntry` + `ALL_DOCS` |
| `data/docs/css/*.ts` (×10) | nouveau — les 10 fiches CSS |
| `data/docs/css/index.ts` | nouveau — barrel `cssDocs` |
| `data/docs/css/docs-css.test.ts` | nouveau — registre/intégrité CSS + résolution des docRefs |
| `components/docs/DocPanel.tsx` | modif — import `getDocEntry` depuis `@/data/docs` |
| `app/learn/[course]/[chapter]/ChapterClient.tsx` | modif — import `getDocEntry` depuis `@/data/docs` |
| `data/courses/css/chapitre-{1..10}.ts` | modif — `docRefs` sur l'étape phare |

## 5. Tests
- **Unitaire (Vitest, node)** : `getDocEntry("css/flexbox")` résout ; id inconnu → undefined ;
  cohérence id/clé + `domain === "css"` sur les 10 ; tous les `related` résolvent ; tous les
  `docRefs` CSS des cours résolvent.
- **Composant** : pas de test de rendu → `tsc`/`eslint`/`next build`.
- **Visuel (navigateur)** : sur un chapitre CSS, le cluster « Références de cette étape »
  affiche la/les fiche(s), le panneau s'ouvre au clic (comme HTML).

## 6. Critères d'acceptation
- [ ] Résolveur multi-domaine : `getDocEntry` résout `html/*` ET `css/*` ; les 2 consommateurs repointés.
- [ ] 10 fiches CSS complètes (une par chapitre), forme identique à HTML.
- [ ] `docRefs` CSS câblés sur l'étape phare de chaque chapitre, tous résolvant.
- [ ] Tests registre/intégrité CSS verts ; `tsc`/`lint`/tests verts ; `next build` OK.
- [ ] Les fiches HTML et leur panneau restent inchangés (non-régression).

## 7. Hors périmètre
JS (7B) ; tokens inline `[[doc:css/…]]` dans les briefings ; couverture exhaustive
(3-4 fiches/chapitre) ; refonte du DocPanel.
