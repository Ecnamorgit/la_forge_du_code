# Barre « recul du Null » (tâche 6A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher en tête de la page d'un cursus une jauge « recul du Null » qui reflète la progression (étapes validées / total), cadrée comme le recul de la corruption.

**Architecture:** Un helper pur `nullProgressLabel(pct)` donne le libellé/tonalité ; un composant client `NullProgressBar` lit `useUser` + le `getCourseProgress` existant et rend la jauge ; la page cursus (Server Component) le monte dans l'en-tête. Aucune nouvelle donnée ni migration.

**Tech Stack:** Next.js 16 (App Router, Server + Client Components), Tailwind v4, Vitest (env **node**, tests purs).

## Global Constraints

- **Copie française, registre Nebula Command** ; tokens couleur `nebula-*` (dont `nebula-spectre` = le Null violet, `nebula-cyan`, `nebula-green`).
- **Garde d'hydratation** via le flag `hydrated` de `useUser()` (déjà exposé) : rendu stable (0 %) tant que `!hydrated`, pour éviter tout mismatch SSR.
- **Réutiliser** `getCourseProgress(state, course, chapters)` ([lib/user-store.ts](../../../lib/user-store.ts)) — ne pas recalculer la progression.
- Transition de largeur neutralisée sous reduced-motion via la variante Tailwind `motion-reduce:transition-none` (pas de globals.css nécessaire).
- `aria-label` décrivant la progression.
- Vitest = env **node** : test pur pour le helper ; le composant se vérifie via `tsc`/`eslint`/`next build` + navigateur.
- Spec : [docs/superpowers/specs/2026-07-13-null-progress-design.md](../specs/2026-07-13-null-progress-design.md).

---

## Task 1: Helper pur `nullProgressLabel`

**Files:**
- Create: `lib/null-progress.ts`
- Create: `lib/null-progress.test.ts`

**Interfaces:**
- Produces : `type NullProgressTone = "corrupt" | "progress" | "purged"` ; `interface NullProgressLabel { title: string; tone: NullProgressTone }` ; `nullProgressLabel(pct: number): NullProgressLabel`.

- [ ] **Step 1 : Écrire le test qui échoue** — `lib/null-progress.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { nullProgressLabel } from "./null-progress";

describe("nullProgressLabel", () => {
  it("0% → secteur corrompu", () => {
    expect(nullProgressLabel(0)).toEqual({ title: "SECTEUR CORROMPU", tone: "corrupt" });
  });
  it("100% → secteur purgé", () => {
    expect(nullProgressLabel(100)).toEqual({ title: "SECTEUR PURGÉ", tone: "purged" });
  });
  it("intermédiaire → null repoussé avec le pourcentage arrondi", () => {
    expect(nullProgressLabel(42)).toEqual({ title: "NULL REPOUSSÉ — 42%", tone: "progress" });
    expect(nullProgressLabel(41.6)).toEqual({ title: "NULL REPOUSSÉ — 42%", tone: "progress" });
  });
  it("clamp : <=0 → corrompu, >=100 → purgé", () => {
    expect(nullProgressLabel(-5).tone).toBe("corrupt");
    expect(nullProgressLabel(150).tone).toBe("purged");
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/null-progress.test.ts`
Expected: FAIL — `Failed to resolve import "./null-progress"`.

- [ ] **Step 3 : Implémenter** — `lib/null-progress.ts`

```ts
/**
 * Libellé narratif de la jauge « recul du Null » selon le pourcentage de purge
 * du cursus (0..100). La progression elle-même vient de getCourseProgress
 * (lib/user-store.ts) ; ce module ne fait que l'habiller.
 */

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

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `npx vitest run lib/null-progress.test.ts`
Expected: PASS (4 blocs).

- [ ] **Step 5 : Vérifier types & lint**

Run: `npx tsc --noEmit && npx eslint lib/null-progress.ts lib/null-progress.test.ts`
Expected: aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add lib/null-progress.ts lib/null-progress.test.ts
git commit -m "feat(null): helper pur nullProgressLabel (corrompu/repousse/purge)"
```

---

## Task 2: Composant `NullProgressBar` + câblage page cursus

**Files:**
- Create: `components/lesson/NullProgressBar.tsx`
- Modify: `app/learn/[course]/page.tsx`

**Interfaces:**
- Consumes (Task 1) : `nullProgressLabel`. Existant : `useUser()` → `{ state, hydrated }` ([lib/use-user.ts](../../../lib/use-user.ts)) ; `getCourseProgress(state, course, chapters)` ([lib/user-store.ts](../../../lib/user-store.ts)).
- Produces : `NullProgressBar` (default export), props `{ course: string; chapters: { slug: string; totalSteps: number }[] }`.

- [ ] **Step 1 : Écrire le composant** — `components/lesson/NullProgressBar.tsx`

```tsx
"use client";

import { useUser } from "@/lib/use-user";
import { getCourseProgress } from "@/lib/user-store";
import { nullProgressLabel } from "@/lib/null-progress";

interface NullProgressBarProps {
  course: string;
  /** Chapitres jouables du cursus (slug + nombre d'étapes), pour le calcul. */
  chapters: { slug: string; totalSteps: number }[];
}

/**
 * Jauge « recul du Null » d'un cursus : la corruption (violet) est repoussée
 * par un remplissage cyan→vert à mesure des étapes validées. Progression lue
 * via getCourseProgress ; rendu stable (0 %) tant que le store n'est pas hydraté.
 */
export default function NullProgressBar({ course, chapters }: NullProgressBarProps) {
  const { state, hydrated } = useUser();
  const pct = hydrated ? getCourseProgress(state, course, chapters) : 0;
  const { title, tone } = nullProgressLabel(pct);
  const isPurged = tone === "purged";

  return (
    <div aria-label={`Recul du Null : ${pct}% du secteur purgé`}>
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`font-tech text-[10px] uppercase tracking-[0.3em] ${
            isPurged ? "text-nebula-green" : "text-nebula-text-secondary"
          }`}
        >
          {title}
        </span>
        <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim">
          {pct}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-sm bg-nebula-spectre/25">
        <div
          className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-nebula-cyan to-nebula-green transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Monter le composant dans la page cursus** — `app/learn/[course]/page.tsx`

Ajouter l'import (après `import { getCourseStatus } from "@/lib/courses-catalog";`) :
```tsx
import NullProgressBar from "@/components/lesson/NullProgressBar";
```
Puis insérer la jauge entre la fin du bloc d'en-tête (le `</div>` qui ferme
`<div className="relative z-20 flex items-center justify-between px-6 py-4">`) et le
bloc `{isPreview && (`. Concrètement, insérer ce bloc **juste avant** la ligne
`      {isPreview && (` :
```tsx
      <div className="relative z-20 mx-auto max-w-3xl px-4 pt-1">
        <NullProgressBar course={course} chapters={chaptersMeta} />
      </div>

```
(`chaptersMeta` est déjà calculé plus haut dans la page via `getChaptersMeta(course)` et
contient `{ slug, totalSteps, … }` — compatible avec le prop `chapters`.)

- [ ] **Step 3 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint components/lesson/NullProgressBar.tsx "app/learn/[course]/page.tsx" && npx next build`
Expected: 0 erreur ; `next build` exit 0.

- [ ] **Step 4 : Vérification visuelle (navigateur)**

Démarrer le serveur, se connecter, ouvrir une page cursus (ex. `/learn/html`). Vérifier :
la jauge apparaît sous « CURSUS HTML », reflète la progression (0 %/« SECTEUR CORROMPU »
sur un compte vierge, augmente après complétion d'étapes), aucune erreur d'hydratation en
console. (Si l'environnement dev/DB n'est pas dispo, noter comme à vérifier en local ; le
build + le test unitaire couvrent le reste.)

- [ ] **Step 5 : Commit**

```bash
git add components/lesson/NullProgressBar.tsx "app/learn/[course]/page.tsx"
git commit -m "feat(null): jauge 'recul du Null' dans l'en-tete de la page cursus"
```

---

## Self-Review

**Spec coverage :** helper `nullProgressLabel` + type (Task 1) ✔ ; composant client lisant `useUser`+`getCourseProgress` avec garde `hydrated` (Task 2 step 1) ✔ ; jauge violette (Null) repoussée par cyan→vert + paliers de label + vert à 100 % (Task 2 step 1) ✔ ; câblage en-tête page cursus (Task 2 step 2) ✔ ; reduced-motion via `motion-reduce:transition-none` ✔ ; `aria-label` ✔ ; tests + vérifs (Task 1 test, Task 2 build+visuel) ✔.

**Placeholders :** aucun ; helper, test, composant complet et l'édition de câblage sont fournis intégralement.

**Cohérence des types :** `nullProgressLabel(pct)` identique entre définition (Task 1) et usage (Task 2) ; `NullProgressBar` props `{ course, chapters }` alimentés par `course` et `chaptersMeta` de la page ; `getCourseProgress(state, course, chapters)` appelé avec la signature existante ; `{ state, hydrated }` conforme à l'API `useUser` (même usage que le dashboard).
