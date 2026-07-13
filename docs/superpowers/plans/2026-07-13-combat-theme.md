# Visualiseur de combat thématisé — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner au beat de succès du visualiseur de combat une identité par cursus (HTML=repair, CSS=field, JS=turret), en CSS pur, sans nouvel asset.

**Architecture:** Un helper pur `combatThemeForCourse(course)` mappe le slug de cursus vers un `CombatTheme`. `ChapterClient` le calcule et le fait descendre `ChapterWorkspace → CombatVisualizer`, qui branche le beat de succès selon le thème. Deux nouveaux keyframes CSS (repair vert, field cyan) rejoignent le bloc combat existant.

**Tech Stack:** Next.js 16 (App Router, Client Components), Tailwind v4 + `@keyframes` manuels, Vitest (env **node**, tests purs).

## Global Constraints

- **CSS-only**, esthétique 16-bit existante ; tokens couleur `--green` / `--cyan` (via classes `nebula-*` ou vars CSS).
- Le beat est piloté par le **slug de cursus** (`"html"`, `"css"`, `"javascript"`…), PAS par le `language` du workspace (qui collapse HTML et CSS en `"html"`).
- **Défaut `"turret"`** pour tout cursus non ciblé (sql, react, ts, aperçus) — zéro régression.
- Le beat d'**échec** (`fly`) reste inchangé et partagé.
- Le composant reste `aria-hidden` et non bloquant ; les nouveaux keyframes s'effondrent sous `prefers-reduced-motion`.
- Vitest = env **node** : test pur pour le helper ; le composant se vérifie via `tsc`/`eslint`/`next build` + navigateur.
- Spec : [docs/superpowers/specs/2026-07-13-combat-theme-design.md](../specs/2026-07-13-combat-theme-design.md).

---

## Task 1: Helper pur `combatThemeForCourse`

**Files:**
- Create: `lib/combat-theme.ts`
- Create: `lib/combat-theme.test.ts`

**Interfaces:**
- Produces : `type CombatTheme = "turret" | "repair" | "field"` ; `combatThemeForCourse(course: string): CombatTheme`.

- [ ] **Step 1 : Écrire le test qui échoue** — `lib/combat-theme.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { combatThemeForCourse } from "./combat-theme";

describe("combatThemeForCourse", () => {
  it("html → repair", () => {
    expect(combatThemeForCourse("html")).toBe("repair");
  });
  it("css → field", () => {
    expect(combatThemeForCourse("css")).toBe("field");
  });
  it("javascript → turret", () => {
    expect(combatThemeForCourse("javascript")).toBe("turret");
  });
  it("tout autre cursus tombe sur turret par défaut", () => {
    expect(combatThemeForCourse("sql")).toBe("turret");
    expect(combatThemeForCourse("react")).toBe("turret");
    expect(combatThemeForCourse("typescript")).toBe("turret");
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/combat-theme.test.ts`
Expected: FAIL — `Failed to resolve import "./combat-theme"`.

- [ ] **Step 3 : Implémenter** — `lib/combat-theme.ts`

```ts
/**
 * Thème visuel du visualiseur de combat, dérivé du cursus. Le beat de succès
 * (geste constructif) diffère par thème ; le beat d'échec reste partagé.
 */
export type CombatTheme = "turret" | "repair" | "field";

/**
 * Thème de combat d'un cursus, à partir de son slug (`"html"`, `"css"`,
 * `"javascript"`…). Tout cursus non ciblé retombe sur `"turret"`.
 */
export function combatThemeForCourse(course: string): CombatTheme {
  if (course === "html") return "repair";
  if (course === "css") return "field";
  return "turret";
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `npx vitest run lib/combat-theme.test.ts`
Expected: PASS (4 cas).

- [ ] **Step 5 : Vérifier types & lint**

Run: `npx tsc --noEmit && npx eslint lib/combat-theme.ts lib/combat-theme.test.ts`
Expected: aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add lib/combat-theme.ts lib/combat-theme.test.ts
git commit -m "feat(combat): helper pur combatThemeForCourse (repair/field/turret)"
```

---

## Task 2: Beats thématisés dans CombatVisualizer + CSS + câblage

**Files:**
- Modify: `components/lesson/CombatVisualizer.tsx`
- Modify: `app/globals.css`
- Modify: `components/lesson/ChapterWorkspace.tsx`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`

**Interfaces:**
- Consumes (Task 1) : `type CombatTheme`, `combatThemeForCourse`.
- Produces : `CombatVisualizer` accepte `theme?: CombatTheme` ; `ChapterWorkspace` accepte `combatTheme?: CombatTheme`.

- [ ] **Step 1 : Ajouter les keyframes + éléments CSS** — `app/globals.css`

Insérer **juste après** le bloc `.combat-emitter { … }` (qui se termine par sa `}` avant le commentaire `/* Cinématique d'intro */`) :

```css
/* HTML "repair" : un segment de structure s'assemble avec un flash de soudure vert. */
@keyframes combat-repair {
  0%   { opacity: 0; transform: translateY(-50%) scale(0.3); filter: brightness(1); }
  40%  { opacity: 1; transform: translateY(-50%) scale(1.15); filter: brightness(2.4) drop-shadow(0 0 10px var(--green, #00ff88)); }
  100% { opacity: 1; transform: translateY(-50%) scale(1); filter: brightness(1); }
}
.animate-combat-repair {
  animation: combat-repair 0.55s ease-out forwards;
}
/* Segment structurel vert. */
.combat-brick {
  width: 14px;
  height: 14px;
  background: var(--green, #00ff88);
  box-shadow: 0 0 6px var(--green, #00ff88);
}

/* CSS "field" : un dôme d'énergie cyan se déploie autour de l'émetteur. */
@keyframes combat-field {
  0%   { opacity: 0; transform: translateY(-50%) scale(0.2); }
  50%  { opacity: 0.9; transform: translateY(-50%) scale(1.1); }
  100% { opacity: 0.35; transform: translateY(-50%) scale(1); }
}
.animate-combat-field {
  animation: combat-field 0.6s ease-out forwards;
}
/* Dôme d'énergie cyan translucide. */
.combat-field {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: 2px solid var(--cyan, #00f0ff);
  background: radial-gradient(circle, rgba(0, 240, 255, 0.18), transparent 70%);
  box-shadow: 0 0 12px var(--cyan, #00f0ff);
}
```

Puis, dans le bloc `@media (prefers-reduced-motion: reduce)` existant, ajouter les deux nouvelles classes à la liste qui coupe l'animation. Remplacer :

```css
  .animate-emitter-charge,
  .animate-laser-fire,
  .animate-screen-shake,
  .animate-enemy-fly,
  .animate-enemy-explode,
  .sprite-enemy-anim {
    animation: none !important;
  }
```

par :

```css
  .animate-emitter-charge,
  .animate-laser-fire,
  .animate-combat-repair,
  .animate-combat-field,
  .animate-screen-shake,
  .animate-enemy-fly,
  .animate-enemy-explode,
  .sprite-enemy-anim {
    animation: none !important;
  }
```

(Sans animation, `.combat-brick` et `.combat-field` restent visibles à leur opacité de base — succès toujours signifié.)

- [ ] **Step 2 : Brancher le thème dans CombatVisualizer** — remplacer tout le contenu de `components/lesson/CombatVisualizer.tsx` par :

```tsx
"use client";

/**
 * Combat visualizer (chantier 4/5) — turns a validation result into a short
 * space-combat beat, CodinGame-style but with pure CSS in the 16-bit aesthetic.
 * The success beat is themed per cursus (turret/repair/field); the error beat
 * (enemy counter-attack) is shared. Purely decorative (aria-hidden), never
 * blocks progression. Motion collapses under prefers-reduced-motion.
 */

import EnemySprite from "@/components/ui/EnemySprite";
import type { CombatTheme } from "@/lib/combat-theme";

export type CombatOutcome = "fly" | "explode" | "none";

interface CombatVisualizerProps {
  outcome: CombatOutcome;
  /** Increment to (re)play the sequence. */
  trigger: number;
  /** Cursus theme for the success beat. Default: turret (JS/laser). */
  theme?: CombatTheme;
}

export default function CombatVisualizer({
  outcome,
  trigger,
  theme = "turret",
}: CombatVisualizerProps) {
  if (trigger <= 0 || outcome === "none") return null;

  const isSuccess = outcome === "explode";

  return (
    <div
      key={trigger}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 overflow-hidden"
    >
      {/* Player emitter (left). Only charges for the turret (laser) theme. */}
      <div
        className={`absolute left-1 top-1/2 ${
          isSuccess && theme === "turret" ? "animate-emitter-charge" : ""
        }`}
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="combat-emitter" />
      </div>

      {/* Success beat — themed. */}
      {isSuccess && theme === "turret" && (
        <div
          className="animate-laser-fire absolute left-5 top-1/2 h-[3px] w-[55%] bg-gradient-to-r from-nebula-cyan via-nebula-cyan to-transparent"
          style={{ boxShadow: "0 0 8px var(--cyan, #00f0ff)" }}
        />
      )}
      {isSuccess && theme === "repair" && (
        <div
          className="animate-combat-repair absolute left-6 top-1/2"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="combat-brick" />
        </div>
      )}
      {isSuccess && theme === "field" && (
        <div
          className="animate-combat-field absolute left-3 top-1/2"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="combat-field" />
        </div>
      )}

      {/* Enemy drone — explodes on success, sweeps across on error. */}
      <EnemySprite type={outcome} trigger={trigger} />
    </div>
  );
}
```

- [ ] **Step 3 : Passer le thème dans ChapterWorkspace** — `components/lesson/ChapterWorkspace.tsx`

Ajouter l'import de type (près des autres imports `@/lib/...`) :
```tsx
import type { CombatTheme } from "@/lib/combat-theme";
```
Dans l'interface `ChapterWorkspaceProps`, ajouter le champ (après `language?: Language;`) :
```tsx
  /** Cursus combat theme, passed through to the CombatVisualizer. */
  combatTheme?: CombatTheme;
```
Dans la signature de la fonction (déstructuration des props), ajouter `combatTheme = "turret"` — par ex. juste après `language = "html",` :
```tsx
  combatTheme = "turret",
```
Enfin, passer le thème au composant. Remplacer :
```tsx
          <CombatVisualizer
            outcome={enemyState.type}
            trigger={enemyState.trigger}
          />
```
par :
```tsx
          <CombatVisualizer
            outcome={enemyState.type}
            trigger={enemyState.trigger}
            theme={combatTheme}
          />
```

- [ ] **Step 4 : Calculer et passer le thème dans ChapterClient** — `app/learn/[course]/[chapter]/ChapterClient.tsx`

Ajouter l'import (près des autres imports `@/lib/...`, ex. sous `import { getBadgeForChapter } from "@/lib/courses-meta";`) :
```tsx
import { combatThemeForCourse } from "@/lib/combat-theme";
```
Dans l'instanciation de `<ChapterWorkspace … />`, ajouter le prop juste après la ligne `onTeleportFlash={…}` (ou n'importe où dans la liste des props du composant) :
```tsx
            combatTheme={combatThemeForCourse(course)}
```

- [ ] **Step 5 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint components/lesson/CombatVisualizer.tsx components/lesson/ChapterWorkspace.tsx "app/learn/[course]/[chapter]/ChapterClient.tsx" && npx next build`
Expected: 0 erreur ; `next build` exit 0.

- [ ] **Step 6 : Vérification visuelle (navigateur)**

Démarrer le serveur, se connecter, ouvrir un chapitre **HTML**, **CSS** et **JS**. Sur chacun, écrire un code correct et cliquer DÉPLOYER : vérifier que le beat de succès diffère — soudure verte (HTML), dôme cyan (CSS), laser cyan (JS). Vérifier qu'un code faux déclenche le même beat d'échec (balayage + secousse) partout. (Si l'environnement dev/DB n'est pas dispo, noter la vérif comme à faire en local ; le build + le test unitaire couvrent le reste.)

- [ ] **Step 7 : Commit**

```bash
git add components/lesson/CombatVisualizer.tsx app/globals.css components/lesson/ChapterWorkspace.tsx "app/learn/[course]/[chapter]/ChapterClient.tsx"
git commit -m "feat(combat): beats de succes thematises par cursus (repair/field/turret)"
```

---

## Self-Review

**Spec coverage :** helper + type (Task 1) ✔ ; beats repair/field/turret + branches (Task 2 step 2) ✔ ; câblage course→workspace→visualizer (Task 2 steps 3-4) ✔ ; keyframes CSS + reduced-motion (Task 2 step 1) ✔ ; défaut turret partout ailleurs (Task 1 helper + prop default `"turret"`) ✔ ; beat d'échec inchangé (CombatVisualizer garde `EnemySprite type=outcome` + pas de branche fly modifiée) ✔ ; tests + vérifs (Task 1 test, Task 2 build+visuel) ✔.

**Placeholders :** aucun ; tout le code (helper, test, composant complet, CSS, éditions de câblage) est fourni intégralement.

**Cohérence des types :** `CombatTheme` défini en Task 1, importé/utilisé identiquement dans CombatVisualizer et ChapterWorkspace (Task 2) ; `combatThemeForCourse(course)` signature identique entre définition (Task 1) et appel dans ChapterClient (Task 2) ; prop `theme` (CombatVisualizer) alimenté par `combatTheme` (ChapterWorkspace), lui-même par `combatThemeForCourse(course)`.
