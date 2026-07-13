# Spec — Barre « recul du Null » par cursus (tâche 6A)

> Rédigé le 2026-07-13. Sous-projet 6A de l'arc méta : un indicateur de progression
> par cursus, cadré comme le recul de la menace (le Null). Habillage narratif d'une
> donnée de progression **déjà calculée**. 6B (Le Spectre en étapes-pièges) est un
> cycle distinct.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (tâche 6).
> Décisions validées avec l'utilisateur (§2).

## 1. Objectif

Afficher, en tête de la page d'un cursus, une jauge « recul du Null » : au fil des
étapes validées, la corruption (Null) recule jusqu'à la purge complète du secteur.
Renforce l'arc narratif (le Null menace, tu le repousses) à coût quasi nul — la
progression est déjà connue.

## 2. Décisions validées

- **Visuel** : jauge thématisée dans l'en-tête — remplissage cyan/vert qui repousse
  une zone violette (le Null, token `--spectre`).
- **Placement** : **page cursus uniquement** ([app/learn/[course]/page.tsx](../../../app/learn/[course]/page.tsx)) ;
  pas le dashboard (hors périmètre).
- Paliers de label : **0 %** « SECTEUR CORROMPU » → intermédiaire « NULL REPOUSSÉ — X% »
  → **100 %** « SECTEUR PURGÉ ».

## 3. Architecture

### 3.1 Helper pur — `lib/null-progress.ts` (+ `lib/null-progress.test.ts`)
```ts
export type NullProgressTone = "corrupt" | "progress" | "purged";

export interface NullProgressLabel {
  title: string;
  tone: NullProgressTone;
}

/** Libellé + tonalité de la jauge selon le pourcentage de purge (0..100). */
export function nullProgressLabel(pct: number): NullProgressLabel {
  if (pct >= 100) return { title: "SECTEUR PURGÉ", tone: "purged" };
  if (pct <= 0) return { title: "SECTEUR CORROMPU", tone: "corrupt" };
  return { title: `NULL REPOUSSÉ — ${Math.round(pct)}%`, tone: "progress" };
}
```
`nullProgressLabel` est la seule logique métier à tester en unitaire. Le pourcentage
lui-même provient de `getCourseProgress` (existant, [user-store.ts](../../../lib/user-store.ts)).

### 3.2 Composant client — `components/lesson/NullProgressBar.tsx`
- Props : `course: string` ; `chapters: { slug: string; totalSteps: number }[]`
  (les `chaptersMeta` déjà calculés par la page cursus via `getChaptersMeta`).
- Lit l'état via `useUser()` puis calcule `getCourseProgress(state, course, chapters)`.
- **Garde d'hydratation** : tant que le composant n'est pas monté côté client, afficher
  un état stable (0 % / « SECTEUR CORROMPU ») pour éviter un mismatch SSR — bascule sur
  la vraie valeur après montage (`useEffect` + flag `mounted`).
- Rendu : un conteneur violet (`bg-nebula-spectre/20` = le Null) barré d'un remplissage
  `width: pct%` en dégradé cyan→vert ; au-dessus, le label de `nullProgressLabel(pct)`
  (vert quand `purged`). `aria-label` décrivant la progression pour les lecteurs d'écran.

### 3.3 Câblage — `app/learn/[course]/page.tsx`
Server Component. La page a déjà `const chaptersMeta = await getChaptersMeta(course);`.
Monter le composant client dans l'en-tête, sous le titre « CURSUS X » (après le bloc
`<div className="relative z-20 flex items-center justify-between …">…</div>`), par ex. :
```tsx
<div className="relative z-20 mx-auto max-w-3xl px-4 pt-1">
  <NullProgressBar course={course} chapters={chaptersMeta} />
</div>
```
(Un composant client peut être enfant d'un Server Component ; il reçoit `chaptersMeta`
sérialisable en props.)

### 3.4 CSS — `app/globals.css`
Minimal : le remplissage utilise une `transition: width` douce. Pas de nouveau keyframe
indispensable (Tailwind + transition inline suffisent). Si une transition est ajoutée,
la neutraliser sous `prefers-reduced-motion` (barre statique à la bonne largeur).

## 4. Fichiers touchés

| Fichier | Nature |
|---|---|
| `lib/null-progress.ts` (+ `.test.ts`) | nouveau — helper pur `nullProgressLabel` + type + tests |
| `components/lesson/NullProgressBar.tsx` | nouveau — jauge client (useUser + getCourseProgress) |
| `app/learn/[course]/page.tsx` | modif — monte la jauge dans l'en-tête |
| `app/globals.css` | modif éventuelle — transition + reduced-motion (si utilisée) |

## 5. Tests
- **Unitaire (Vitest, node)** : `nullProgressLabel` — 0 → corrupt/« SECTEUR CORROMPU » ;
  100 → purged/« SECTEUR PURGÉ » ; 42 → progress/« NULL REPOUSSÉ — 42% » ; arrondi
  (41.6 → 42) ; bornes négatives/>100 clampées sur corrupt/purged.
- **Composant** : pas de test de rendu (client, Vitest node) → vérif `tsc`/`eslint`/`next build`.
- **Visuel (navigateur)** : sur une page cursus, la jauge reflète la progression (0 % vierge,
  augmente après complétion d'étapes) ; pas de mismatch d'hydratation en console.

## 6. Critères d'acceptation
- [ ] La page cursus affiche une jauge « recul du Null » reflétant `getCourseProgress`.
- [ ] Paliers de label corrects (corrompu / repoussé X% / purgé) ; couleur verte à 100 %.
- [ ] Pas de mismatch d'hydratation (garde de montage).
- [ ] `nullProgressLabel` testé ; `tsc`/`lint`/tests verts ; `next build` OK.
- [ ] Accessible (`aria-label` décrivant la progression) ; reduced-motion respecté si transition.

## 7. Hors périmètre
Dashboard ; overlay de corruption sur la carte ; **6B** (Le Spectre en étapes-pièges) ;
persistance/nouvelle donnée (on réutilise `completedSteps` existant).
