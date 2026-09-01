# Essai étendu « premiers niveaux HTML » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ouvrir les chapitres 1-3 du cursus HTML et sa carte aux visiteurs sans compte, avec cinématiques, XP, niveaux et level-up, conversion en fin de chapitre 3, et import complet à l'inscription.

**Architecture:** `TRIAL_CHAPTERS` dans `lib/public-routes.ts` devient la source de vérité unique (routes publiques, état, verrous, import). L'état d'essai localStorage passe en multi-chapitres avec migration silencieuse. Le hook `useCinematicSeen` gagne un mode `"local"` (localStorage). La carte `/learn/html` et `ChapterClient` deviennent trial-aware ; l'import à l'inscription est étendu aux 3 chapitres + cinématiques vues.

**Tech Stack:** Next.js App Router, React client components, localStorage, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-24-essai-etendu-html-design.md`

## Global Constraints

- Texte joueur en français, ton Nebula Command.
- `TRIAL_CHAPTERS = ["chapitre-1", "chapitre-2", "chapitre-3"]` — toute borne d'essai en dérive ; jamais de match par préfixe sur les routes (commentaire chapitre-10 de `public-routes.ts` à préserver).
- Migration de l'état d'essai : l'ancienne forme `{ completedSteps, xp }` est convertie sans perte ni exception (`chapters["chapitre-1"] = completedSteps`).
- Sécurité de l'import : rejets en égalité stricte + valeurs reconstruites en dur (jamais recopiées de l'appelant) — les DEUX protections existantes de `lib/trial-import.ts` sont conservées ; les ids de cinématiques légitimes sont construits en dur depuis `TRIAL_COURSE`/`TRIAL_CHAPTERS`.
- Politique cinématiques inchangée : état non chargé → jamais d'auto-play ; une cinématique enregistrée ne se rejoue jamais automatiquement ; la finale n'est jamais jouable ni marquable en essai.
- Comportement des inscrits strictement inchangé (mode `"server"` du hook, CompletionScreen, badges, quêtes).
- Préfixer les commandes shell par `rtk` ; repli sans rtk si besoin.
- Commits en français, style existant, avec `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- TDD sur toute la logique pure.
- Branche de travail : `feat/essai-etendu-html`, créée depuis `feat/cinematiques-narratives` (la feature s'appuie sur les cinématiques non encore mergées).

---

### Task 1: Routes publiques et source de vérité `TRIAL_CHAPTERS`

**Files:**
- Modify: `lib/public-routes.ts`
- Modify: `lib/public-routes.test.ts`
- Modify: `lib/trial-user.ts` (remplacement mécanique de `TRIAL_CHAPTER`)
- Modify: `lib/trial-import.ts` (idem)
- Modify: `lib/use-trial-user.ts` (idem)

**Interfaces:**
- Consumes: rien (racine).
- Produces (toutes les autres tâches) : `TRIAL_COURSE: "html"`, `TRIAL_CHAPTERS: readonly string[]`, `TRIAL_LAST_CHAPTER: string`, `PUBLIC_TRIAL_ROUTES`, `isPublicRoute(pathname)`. L'export `TRIAL_CHAPTER` disparaît.

- [ ] **Step 1: Étendre les tests de routes (échec attendu)**

Dans `lib/public-routes.test.ts`, ajouter (en conservant les tests existants, adaptés si besoin) :

```ts
describe("essai étendu", () => {
  it("la carte du cursus d'essai est publique", () => {
    expect(isPublicRoute("/learn/html")).toBe(true);
    expect(isPublicRoute("/learn/html/")).toBe(true);
  });

  it("les chapitres 1 à 3 sont publics, pas les suivants", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-2")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-3")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-4")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-8")).toBe(false);
  });

  it("jamais de match par préfixe", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/htmlx")).toBe(false);
    expect(isPublicRoute("/learn/css")).toBe(false);
  });

  it("TRIAL_CHAPTERS est ordonné et TRIAL_LAST_CHAPTER en est le dernier", () => {
    expect(TRIAL_CHAPTERS).toEqual(["chapitre-1", "chapitre-2", "chapitre-3"]);
    expect(TRIAL_LAST_CHAPTER).toBe("chapitre-3");
  });
});
```

(ajouter `TRIAL_CHAPTERS`, `TRIAL_LAST_CHAPTER` aux imports du test).

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/public-routes.test.ts`
Expected: FAIL (`TRIAL_CHAPTERS` inexistant).

- [ ] **Step 3: Implémenter**

Dans `lib/public-routes.ts`, remplacer les exports d'essai par :

```ts
/** Cursus ouvert à l'essai. */
export const TRIAL_COURSE = "html";

/** Chapitres ouverts à l'essai, dans l'ordre du cursus. */
export const TRIAL_CHAPTERS: readonly string[] = [
  "chapitre-1",
  "chapitre-2",
  "chapitre-3",
];

/** Dernier chapitre d'essai : fin de l'essai, moment de la conversion. */
export const TRIAL_LAST_CHAPTER = TRIAL_CHAPTERS[TRIAL_CHAPTERS.length - 1];

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}`,
  ...TRIAL_CHAPTERS.map((c) => `/learn/${TRIAL_COURSE}/${c}`),
];
```

`isPublicRoute` et le commentaire « jamais startsWith » restent tels quels.

- [ ] **Step 4: Adapter mécaniquement les consommateurs de `TRIAL_CHAPTER`**

Sans changer leur comportement (leurs vraies évolutions arrivent aux tâches 2 et 6) :
- `lib/trial-user.ts` : `import { TRIAL_CHAPTERS, TRIAL_COURSE }` et remplacer chaque usage de `TRIAL_CHAPTER` par `TRIAL_CHAPTERS[0]`.
- `lib/trial-import.ts` : idem (`chapter !== TRIAL_CHAPTERS[0]`, valeur reconstruite `TRIAL_CHAPTERS[0]`).
- `lib/use-trial-user.ts` : idem (`chapter !== TRIAL_CHAPTERS[0]`).

- [ ] **Step 5: Vérifier**

Run: `rtk vitest run lib/public-routes.test.ts lib/trial-user.test.ts lib/trial-import.test.ts && rtk tsc --noEmit`
Expected: PASS / clean.

- [ ] **Step 6: Commit**

```bash
rtk git add lib/public-routes.ts lib/public-routes.test.ts lib/trial-user.ts lib/trial-import.ts lib/use-trial-user.ts && rtk git commit -m "feat(essai): la carte HTML et les chapitres 1-3 deviennent publics

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: État d'essai multi-chapitres avec migration

**Files:**
- Modify: `lib/trial-user.ts`
- Modify: `lib/trial-user.test.ts`
- Modify: `lib/use-trial-user.ts`

**Interfaces:**
- Consumes: `TRIAL_CHAPTERS`, `TRIAL_COURSE` (Task 1).
- Produces (Tasks 5, 6) :
  - `interface TrialState { chapters: Record<string, number[]>; xp: number }`
  - `parseTrialState(raw: string | null): TrialState` (migration incluse)
  - `applyTrialStep(state, chapter: string, stepIndex: number, objectivesCount: number): TrialStepResult`
  - `trialStateToUserState(state): UserState` (clés `html/chapitre-1..3`)
  - `trialCompletedSteps(state): TrialStepRef[]` (aplati, tous chapitres)
  - `emptyTrialState(): TrialState`

- [ ] **Step 1: Écrire les tests de migration et de bornes (échec attendu)**

Dans `lib/trial-user.test.ts`, ajouter :

```ts
describe("TrialState multi-chapitres", () => {
  it("migre l'ancienne forme sans perte", () => {
    const legacy = JSON.stringify({ completedSteps: [0, 2], xp: 45 });
    expect(parseTrialState(legacy)).toEqual({
      chapters: { "chapitre-1": [0, 2] },
      xp: 45,
    });
  });

  it("accepte la forme neuve telle quelle", () => {
    const fresh = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
    expect(parseTrialState(fresh)).toEqual({
      chapters: { "chapitre-1": [0], "chapitre-2": [1] },
      xp: 30,
    });
  });

  it("rejette les formes corrompues vers l'état vide", () => {
    for (const raw of [null, "", "{", "[]", JSON.stringify({ chapters: "x", xp: 1 }), JSON.stringify({ chapters: { c: ["a"] }, xp: 1 })]) {
      expect(parseTrialState(raw)).toEqual({ chapters: {}, xp: 0 });
    }
  });

  it("ignore les chapitres hors périmètre à la migration comme à l'écriture", () => {
    const smuggled = JSON.stringify({
      chapters: { "chapitre-1": [0], "chapitre-7": [0, 1] },
      xp: 10,
    });
    expect(parseTrialState(smuggled).chapters["chapitre-7"]).toBeUndefined();
    expect(() =>
      applyTrialStep(emptyTrialState(), "chapitre-7", 0, 2)
    ).toThrow();
  });

  it("applyTrialStep crédite par chapitre et reste idempotent", () => {
    const s1 = applyTrialStep(emptyTrialState(), "chapitre-2", 0, 2);
    expect(s1.alreadyDone).toBe(false);
    expect(s1.state.chapters["chapitre-2"]).toEqual([0]);
    const s2 = applyTrialStep(s1.state, "chapitre-2", 0, 2);
    expect(s2.alreadyDone).toBe(true);
    expect(s2.state.xp).toBe(s1.state.xp);
  });

  it("trialStateToUserState expose chaque chapitre d'essai", () => {
    const state = { chapters: { "chapitre-1": [0], "chapitre-3": [1] }, xp: 25 };
    const user = trialStateToUserState(state);
    expect(user.completedSteps["html/chapitre-1"]).toEqual([0]);
    expect(user.completedSteps["html/chapitre-3"]).toEqual([1]);
    expect(user.totalXp).toBe(25);
  });

  it("trialCompletedSteps aplatit tous les chapitres", () => {
    const state = { chapters: { "chapitre-1": [0, 1], "chapitre-2": [0] }, xp: 0 };
    expect(trialCompletedSteps(state)).toEqual([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 1 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
  });
});
```

Adapter les tests existants à la nouvelle forme (mêmes intentions, nouvelle structure) ; ajouter `emptyTrialState` aux imports.

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/trial-user.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter dans `lib/trial-user.ts`**

Points clés (le style et les gardes `typeof window` existants sont conservés) :

```ts
export interface TrialState {
  /** Index des étapes validées, triés, par slug de chapitre d'essai. */
  chapters: Record<string, number[]>;
  xp: number;
}

/** État vide — littéral frais à chaque appel (cf. commentaire existant). */
export function emptyTrialState(): TrialState {
  return { chapters: {}, xp: 0 };
}

function sanitizeChapters(value: unknown): Record<string, number[]> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const out: Record<string, number[]> = {};
  for (const [chapter, steps] of Object.entries(value)) {
    if (!TRIAL_CHAPTERS.includes(chapter)) continue; // hors périmètre : ignoré
    if (!Array.isArray(steps) || !steps.every((n) => typeof n === "number")) return null;
    out[chapter] = [...steps];
  }
  return out;
}

export function parseTrialState(raw: string | null): TrialState {
  if (!raw) return emptyTrialState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyTrialState();
    const v = parsed as Record<string, unknown>;
    if (typeof v.xp !== "number") return emptyTrialState();
    // Forme neuve.
    if ("chapters" in v) {
      const chapters = sanitizeChapters(v.chapters);
      return chapters ? { chapters, xp: v.xp } : emptyTrialState();
    }
    // Ancienne forme { completedSteps, xp } : migration silencieuse.
    if (
      Array.isArray(v.completedSteps) &&
      v.completedSteps.every((n) => typeof n === "number")
    ) {
      return {
        chapters: { [TRIAL_CHAPTERS[0]]: [...v.completedSteps] },
        xp: v.xp,
      };
    }
    return emptyTrialState();
  } catch {
    return emptyTrialState();
  }
}

export function applyTrialStep(
  state: TrialState,
  chapter: string,
  stepIndex: number,
  objectivesCount: number
): TrialStepResult {
  if (!TRIAL_CHAPTERS.includes(chapter)) {
    throw new Error("Chapitre hors du périmètre d'essai");
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new Error("Index d'étape invalide");
  }
  const done = state.chapters[chapter] ?? [];
  if (done.includes(stepIndex)) return { state, awardedXp: 0, alreadyDone: true };
  const awardedXp = xpForStep(objectivesCount);
  return {
    state: {
      chapters: {
        ...state.chapters,
        [chapter]: [...done, stepIndex].sort((a, b) => a - b),
      },
      xp: state.xp + awardedXp,
    },
    awardedXp,
    alreadyDone: false,
  };
}
```

`readTrialState`/`writeTrialState`/`clearTrialState` : seuls les littéraux d'état vide changent (`emptyTrialState()`).
`trialStateToUserState` : `completedSteps` devient

```ts
    completedSteps: Object.fromEntries(
      Object.entries(state.chapters).map(([chapter, steps]) => [
        `${TRIAL_COURSE}/${chapter}`,
        [...steps],
      ])
    ),
```

`trialCompletedSteps` : aplatir dans l'ordre de `TRIAL_CHAPTERS` :

```ts
export function trialCompletedSteps(state: TrialState): TrialStepRef[] {
  return TRIAL_CHAPTERS.flatMap((chapter) =>
    (state.chapters[chapter] ?? []).map((stepIndex) => ({
      course: TRIAL_COURSE,
      chapter,
      stepIndex,
    }))
  );
}
```

- [ ] **Step 4: Adapter `lib/use-trial-user.ts`**

- Remplacer l'import du seul chapitre 1 par un registre des chapitres d'essai :

```ts
import { chapitre1 as htmlCh1 } from "@/data/courses/html/chapitre-1";
import { chapitre2 as htmlCh2 } from "@/data/courses/html/chapitre-2";
import { chapitre3 as htmlCh3 } from "@/data/courses/html/chapitre-3";

/** Chapitres jouables en essai, indexés par slug (source : TRIAL_CHAPTERS). */
const TRIAL_CHAPTER_DATA: Record<string, typeof htmlCh1> = {
  [htmlCh1.slug]: htmlCh1,
  [htmlCh2.slug]: htmlCh2,
  [htmlCh3.slug]: htmlCh3,
};
```

- Dans `completeStep` : la garde devient

```ts
      if (course !== TRIAL_COURSE || !TRIAL_CHAPTERS.includes(chapter)) {
        throw new AccountRequiredError(
          "Ce chapitre nécessite un compte. Crée le tien pour continuer."
        );
      }
      const chapterData = TRIAL_CHAPTER_DATA[chapter];
      const step = chapterData?.steps[stepIndex];
      if (!step) throw new Error("Index d'étape invalide");
      const result = applyTrialStep(trial, chapter, stepIndex, step.objectives.length);
```

- L'état initial `useState<TrialState>({ completedSteps: [], xp: 0 })` devient `useState<TrialState>(emptyTrialState)`.

- [ ] **Step 5: Vérifier**

Run: `rtk vitest run lib/trial-user.test.ts lib/trial-import.test.ts && rtk tsc --noEmit && rtk lint`
Expected: PASS / clean (adapter tout test cassé par la nouvelle forme — les intentions ne changent pas).

- [ ] **Step 6: Commit**

```bash
rtk git add lib/trial-user.ts lib/trial-user.test.ts lib/use-trial-user.ts && rtk git commit -m "feat(essai): etat d'essai multi-chapitres avec migration silencieuse

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Mode `"local"` du hook cinématiques

**Files:**
- Create: `lib/cinematics/local-seen.ts`
- Create: `lib/cinematics/local-seen.test.ts`
- Modify: `lib/cinematics/use-cinematic-seen.ts`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx` (adaptation mécanique de l'appel)

**Interfaces:**
- Consumes: rien de nouveau.
- Produces (Tasks 4, 5, 6) :
  - `type CinematicSeenMode = "server" | "local" | "off"`
  - `useCinematicSeen(course: string, mode: CinematicSeenMode = "server")` — retour inchangé `{ loaded, seen, mark }`
  - `lib/cinematics/local-seen.ts` : `CINE_SEEN_STORAGE_KEY = "nc_cine_seen"`, `parseSeenIds(raw: string | null): string[]`, `readLocalSeen(): string[]`, `writeLocalSeen(ids: string[]): void`, `clearLocalSeen(): void`

- [ ] **Step 1: Tests de la logique pure (échec attendu)**

`lib/cinematics/local-seen.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { parseSeenIds } from "./local-seen";

describe("parseSeenIds", () => {
  it("lit un tableau d'ids valide", () => {
    expect(parseSeenIds(JSON.stringify(["html:intro", "html:chapter:chapitre-1"]))).toEqual([
      "html:intro",
      "html:chapter:chapitre-1",
    ]);
  });

  it("rejette tout ce qui n'est pas un tableau de chaînes", () => {
    for (const raw of [null, "", "{", "42", JSON.stringify({ a: 1 }), JSON.stringify([1, 2]), JSON.stringify(["ok", 3])]) {
      expect(parseSeenIds(raw)).toEqual([]);
    }
  });

  it("déduplique", () => {
    expect(parseSeenIds(JSON.stringify(["a", "a", "b"]))).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/cinematics/local-seen.test.ts`
Expected: FAIL (module absent).

- [ ] **Step 3: Implémenter `lib/cinematics/local-seen.ts`**

```ts
/**
 * Persistance localStorage des cinématiques vues (mode essai, sans compte).
 * Même contrat que lib/trial-user.ts : logique pure testable en node, accès
 * storage gardés par `typeof window`, jamais d'exception.
 */

export const CINE_SEEN_STORAGE_KEY = "nc_cine_seen";

/** Décode un tableau d'ids ; [] si absent, corrompu ou de forme invalide. */
export function parseSeenIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === "string")) {
      return [];
    }
    return [...new Set(parsed)];
  } catch {
    return [];
  }
}

export function readLocalSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseSeenIds(window.localStorage.getItem(CINE_SEEN_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeLocalSeen(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CINE_SEEN_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* navigation privée ou quota : l'essai continue sans persistance */
  }
}

export function clearLocalSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CINE_SEEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4: Faire évoluer le hook**

Dans `lib/cinematics/use-cinematic-seen.ts` : le second paramètre `enabled: boolean = true` devient `mode: CinematicSeenMode = "server"` (exporter le type). Comportements :
- `"server"` : identique à aujourd'hui (fetch GET/POST).
- `"off"` : identique à l'actuel `enabled=false` (aucune lecture, `loaded` false, `mark` purement local en mémoire).
- `"local"` : dans l'effet, lire `readLocalSeen()` de façon synchrone, `setSeen(new Set(ids))`, `setLoaded(true)` (avec le commentaire eslint-disable `react-hooks/set-state-in-effect` au besoin, convention `IntroCinematicMount`) ; si `window` est indisponible, ne rien faire (`loaded` reste false). Dans `mark` : mise à jour du Set en mémoire (code actuel) puis `writeLocalSeen([...prevIds, id])` — utiliser la valeur du Set mis à jour ; pas de réseau.

Mettre à jour la docstring (politique inchangée : `loaded` false → pas d'auto-play).

- [ ] **Step 5: Adapter les appels existants sans changer le comportement**

- `ChapterClient.tsx` : `useCinematicSeen(course, !isTrial)` devient `useCinematicSeen(course, isTrial ? "off" : "server")` (le vrai passage au mode `"local"` arrive en Task 5).
- `CourseCinematicsMount.tsx` : appel sans second argument — inchangé.

- [ ] **Step 6: Vérifier**

Run: `rtk vitest run lib/cinematics && rtk tsc --noEmit && rtk lint`
Expected: PASS / clean.

- [ ] **Step 7: Commit**

```bash
rtk git add lib/cinematics "app/learn/[course]/[chapter]/ChapterClient.tsx" && rtk git commit -m "feat(cinematics): mode localStorage du suivi des cinematiques vues

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Carte du cursus en mode essai

**Files:**
- Modify: `app/learn/[course]/page.tsx`
- Modify: `app/learn/[course]/LevelNode.tsx`
- Modify: `components/cinematics/CourseCinematicsMount.tsx`

**Interfaces:**
- Consumes: `TRIAL_COURSE`, `TRIAL_CHAPTERS` (Task 1) ; `useCinematicSeen(course, mode)` (Task 3) ; `useUserContext().isTrial` (existant — le provider couvre déjà les visiteurs, cf. `lib/user-context.tsx`).
- Produces: `CourseCinematicsMount` accepte une prop optionnelle `seenMode?: CinematicSeenMode` (défaut `"server"`).

Note de périmètre : la page carte n'affiche aujourd'hui aucun bloc badges/quêtes/classement — le « teasing verrouillé » de la spec §4 n'a donc aucun support ici ; rien à construire (YAGNI). Le teasing de conversion est porté par les nœuds verrouillés et le bandeau d'essai.

- [ ] **Step 1: Rendre la page serveur trial-aware**

`app/learn/[course]/page.tsx` (server component `CourseMapPage`) :
- Importer `auth` depuis `@/auth`, `TRIAL_COURSE` depuis `@/lib/public-routes`, `TrialBanner` depuis `@/components/lesson/TrialBanner`, `redirect` depuis `next/navigation`.
- En tête de fonction :

```tsx
  const session = await auth();
  const isTrialVisit = !session?.user?.id;
  // Défense en profondeur : le middleware ne laisse passer sans session que
  // la carte du cursus d'essai ; on ne rend jamais une autre carte sans compte.
  if (isTrialVisit && course !== TRIAL_COURSE) redirect("/login");
```

- Dans le JSX : `{isTrialVisit && <TrialBanner />}` juste au-dessus du header ; le lien retour devient `href={isTrialVisit ? "/" : "/dashboard"}` ; passer `isTrial={isTrialVisit}` à chaque `LevelNodeComponent` et `seenMode={isTrialVisit ? "local" : "server"}` à `CourseCinematicsMount`.

- [ ] **Step 2: Verrouiller les nœuds hors essai**

`app/learn/[course]/LevelNode.tsx` : ajouter une prop `isTrial?: boolean` (défaut false). Lire le statut existant, puis :

```tsx
  // En essai, tout chapitre hors du périmètre est verrouillé vers l'inscription,
  // quel que soit l'état de progression locale.
  const trialLocked = isTrial && !TRIAL_CHAPTERS.includes(node.slug);
```

- Si `trialLocked` : statut forcé `"locked"`, le lien pointe vers `/signup` au lieu de `/learn/${course}/${node.slug}`, et le libellé secondaire du nœud affiche `🔒 Inscription requise` (reprendre le style du libellé « locked » existant).
- Import : `TRIAL_CHAPTERS` depuis `@/lib/public-routes`.

- [ ] **Step 3: `CourseCinematicsMount` en mode essai**

`components/cinematics/CourseCinematicsMount.tsx` :
- Prop nouvelle : `seenMode?: CinematicSeenMode` (défaut `"server"`), passée telle quelle à `useCinematicSeen(course, seenMode)`.
- Le bouton « Revoir la finale » reste conditionné à `seen.has(finaleId)` — jamais vrai en essai (la finale n'est pas marquable), aucun code supplémentaire.

- [ ] **Step 4: Vérification manuelle rapide (facultative si l'environnement ne le permet pas)**

Si un serveur de dev est disponible : ouvrir `/learn/html` en navigation privée — carte visible, intro auto-jouée, nœuds 4-8 « Inscription requise » vers /signup, bandeau d'essai présent. Sinon, la couverture arrive avec les e2e (Task 7).

- [ ] **Step 5: Vérifier compilation/lint/suite**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: clean / PASS.

- [ ] **Step 6: Commit**

```bash
rtk git add "app/learn/[course]/page.tsx" "app/learn/[course]/LevelNode.tsx" components/cinematics/CourseCinematicsMount.tsx && rtk git commit -m "feat(essai): carte du cursus HTML visible sans compte, chapitres verrouilles vers l'inscription

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Parcours de chapitre en essai (outros, level-up, conversion fin ch. 3)

**Files:**
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`

**Interfaces:**
- Consumes: `TRIAL_COURSE`, `TRIAL_CHAPTERS`, `TRIAL_LAST_CHAPTER` (Task 1) ; `useCinematicSeen(course, mode)` (Task 3).
- Produces: rien de nouveau (flux interne).

Rappels du flux actuel : `showConversion = isTrial && chapterDone` ; dans `goNextStep`, branche `isTrial` → scroll vers la carte de conversion ; lecteur de cinématique monté `{!isTrial && …}` ; garde level-up `!isTrial` (vers la ligne 127) ; lien retour `isTrial ? "/" : /learn/${course}` ; `CompletionScreen` `show={showCompletion && !isTrial}` (inchangé).

- [ ] **Step 1: Dériver le contexte d'essai du chapitre**

Près des dérivations existantes :

```tsx
  // Chapitre jouable en essai : cinématiques en mode localStorage, conversion
  // uniquement en fin de dernier chapitre d'essai.
  const isTrialChapter =
    isTrial && course === TRIAL_COURSE && TRIAL_CHAPTERS.includes(chapter.slug);
  const isLastTrialChapter = isTrialChapter && chapter.slug === TRIAL_LAST_CHAPTER;
  const nextTrialChapter = isTrialChapter
    ? TRIAL_CHAPTERS[TRIAL_CHAPTERS.indexOf(chapter.slug) + 1] ?? null
    : null;
```

et :
- `useCinematicSeen(course, isTrial ? "off" : "server")` devient `useCinematicSeen(course, isTrial ? (isTrialChapter ? "local" : "off") : "server")`.
- `showConversion = isTrial && chapterDone` devient `showConversion = isTrial && chapterDone && isLastTrialChapter`.

- [ ] **Step 2: Rebrancher `goNextStep`**

La branche dernière étape devient (esprit : l'outro joue pour connectés ET chapitres d'essai ; ensuite conversion pour le dernier chapitre d'essai, navigation pour les autres chapitres d'essai, CompletionScreen pour les connectés) :

```tsx
    if (currentStep === chapter.steps.length - 1) {
      playFanfare();
      if (isTrial && !isTrialChapter) {
        // Hors périmètre d'essai (défense en profondeur) : comportement historique.
        conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      // Connecté OU chapitre d'essai : cinématique d'abord si jamais vue.
      if (cineLoaded && !cineSeen.has(outroId)) {
        setShowOutroCinematic(true);
        return;
      }
      finishChapter();
      return;
    }
```

avec un nouveau `finishChapter` (utilisé aussi par le `onClose` du lecteur) :

```tsx
  const finishChapter = useCallback(() => {
    if (!isTrial) {
      setShowCompletion(true);
      return;
    }
    if (isLastTrialChapter) {
      // Fin de l'essai : la carte de conversion est déjà montée (showConversion).
      conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (nextTrialChapter) {
      router.push(`/learn/${TRIAL_COURSE}/${nextTrialChapter}`);
    }
  }, [isTrial, isLastTrialChapter, nextTrialChapter, router]);
```

(`const router = useRouter()` — import `useRouter` de `next/navigation` ; compléter les deps de `goNextStep`).

- [ ] **Step 3: Monter le lecteur pour l'essai aussi**

Le montage `{!isTrial && (<CinematicPlayer …/>)}` devient `{(!isTrial || isTrialChapter) && (<CinematicPlayer …/>)}` ; son `onClose` (le `useCallback` `closeOutroCinematic` existant) appelle désormais `markCine(outroId)` puis `setShowOutroCinematic(false)` puis `finishChapter()` (au lieu de `setShowCompletion(true)`) ; le `finalCtaLabel` devient `isTrialChapter && !isLastTrialChapter ? "Chapitre suivant ->" : "Rapport de mission ->"`.

- [ ] **Step 4: Level-up et navigation en essai**

- Retirer `!isTrial` de la condition qui déclenche l'overlay de level-up (vers la ligne 127 : le calcul `levelUp` doit se faire aussi en essai).
- Le lien retour du header : `href={isTrial ? \`/learn/${TRIAL_COURSE}\` : \`/learn/${course}\`}` avec le libellé `← Retour` dans les deux cas (la carte est désormais publique ; supprimer le commentaire devenu faux et le libellé « ← Accueil »).

- [ ] **Step 5: Vérifier**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: clean / PASS.

- [ ] **Step 6: Commit**

```bash
rtk git add "app/learn/[course]/[chapter]/ChapterClient.tsx" && rtk git commit -m "feat(essai): outros, level-up et conversion en fin de chapitre 3 pour l'essai

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Import à l'inscription étendu (étapes + cinématiques)

**Files:**
- Modify: `lib/trial-import.ts`
- Modify: `lib/trial-import.test.ts`
- Modify: `app/api/me/trial-import/route.ts`
- Modify: `app/avatar/page.tsx`

**Interfaces:**
- Consumes: `TRIAL_CHAPTERS`, `TRIAL_COURSE` (Task 1) ; `trialCompletedSteps` (Task 2) ; `readLocalSeen`, `clearLocalSeen` (Task 3) ; `markCinematicView` de `lib/me-server.ts` (existant).
- Produces: `filterTrialSteps(steps: unknown): TrialStepRef[]` (multi-chapitres) ; `filterTrialCinematics(ids: unknown): string[]`.

- [ ] **Step 1: Tests du filtre (échec attendu)**

Dans `lib/trial-import.test.ts`, ajouter :

```ts
describe("filterTrialSteps multi-chapitres", () => {
  it("accepte les trois chapitres d'essai", () => {
    const kept = filterTrialSteps([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 1 },
      { course: "html", chapter: "chapitre-3", stepIndex: 2 },
    ]);
    expect(kept).toHaveLength(3);
    expect(kept[1]).toEqual({ course: "html", chapter: "chapitre-2", stepIndex: 1 });
  });

  it("rejette toujours les chapitres hors périmètre et les doublons par chapitre", () => {
    const kept = filterTrialSteps([
      { course: "html", chapter: "chapitre-4", stepIndex: 0 },
      { course: "css", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
    expect(kept).toEqual([
      { course: "html", chapter: "chapitre-1", stepIndex: 0 },
      { course: "html", chapter: "chapitre-2", stepIndex: 0 },
    ]);
  });
});

describe("filterTrialCinematics", () => {
  it("ne retient que les ids d'essai légitimes, reconstruits en dur", () => {
    expect(
      filterTrialCinematics([
        "html:intro",
        "html:chapter:chapitre-2",
        "html:finale",              // jamais accessible en essai
        "html:chapter:chapitre-8",  // hors périmètre
        "css:intro",                // autre cursus
        42,
        { toString: () => "html:intro" },
      ])
    ).toEqual(["html:intro", "html:chapter:chapitre-2"]);
  });

  it("entrée non-tableau → vide", () => {
    for (const v of [null, undefined, "html:intro", {}]) {
      expect(filterTrialCinematics(v)).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/trial-import.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter dans `lib/trial-import.ts`**

- `filterTrialSteps` : la garde `chapter !== TRIAL_CHAPTERS[0]` devient une résolution par Set — mais la valeur retenue est celle du **Set**, jamais la chaîne de l'appelant (protection 2 conservée) :

```ts
const TRIAL_CHAPTER_SET = new Set(TRIAL_CHAPTERS);

// … dans la boucle :
    if (course !== TRIAL_COURSE) continue;
    if (typeof chapter !== "string" || !TRIAL_CHAPTER_SET.has(chapter)) continue;
    // Valeur canonique reprise du périmètre, jamais de l'entrée.
    const canonicalChapter = TRIAL_CHAPTERS[TRIAL_CHAPTERS.indexOf(chapter)];
```

  Le dédoublonnage `seen: Set<number>` devient `seen: Set<string>` sur la clé `` `${canonicalChapter}:${stepIndex}` ``. `MAX_STEPS = 50` inchangé (11 étapes réelles).

- Nouveau filtre, mêmes principes (allowlist construite en dur) :

```ts
/** Ids de cinématiques atteignables en essai — construits en dur, jamais dérivés de l'entrée. */
const TRIAL_CINEMATIC_IDS: readonly string[] = [
  `${TRIAL_COURSE}:intro`,
  ...TRIAL_CHAPTERS.map((c) => `${TRIAL_COURSE}:chapter:${c}`),
];

export function filterTrialCinematics(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const provided = new Set(ids.filter((v): v is string => typeof v === "string"));
  return TRIAL_CINEMATIC_IDS.filter((id) => provided.has(id));
}
```

- [ ] **Step 4: Étendre la route**

`app/api/me/trial-import/route.ts`, après la boucle d'import des étapes :

```ts
  const seenCinematics = filterTrialCinematics(
    (raw as { seenCinematics?: unknown } | null)?.seenCinematics
  );
  for (const cinematicId of seenCinematics) {
    // Idempotent (upsert) ; un échec isolé ne fait pas échouer l'onboarding.
    try {
      await markCinematicView(session.user.id, cinematicId);
    } catch {
      /* non bloquant */
    }
  }
```

(imports : `filterTrialCinematics` et `markCinematicView`). Ajouter `cinematics: seenCinematics.length` au log `trial_import` et au JSON de réponse (`{ imported, cinematics }`).

- [ ] **Step 5: Étendre l'appel client**

`app/avatar/page.tsx` : la condition d'envoi devient « au moins une étape OU une cinématique » ; le corps envoie les deux ; les deux clés sont nettoyées en cas de succès :

```tsx
    const trialState = readTrialState();
    const steps = trialCompletedSteps(trialState);
    const seenCinematics = readLocalSeen();
    if (steps.length === 0 && seenCinematics.length === 0) return;
    // … fetch avec body: JSON.stringify({ steps, seenCinematics })
    // … en cas de res.ok : clearTrialState(); clearLocalSeen();
```

(imports : `readLocalSeen`, `clearLocalSeen` depuis `@/lib/cinematics/local-seen`).

- [ ] **Step 6: Vérifier**

Run: `rtk vitest run lib/trial-import.test.ts lib/trial-user.test.ts && rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: PASS / clean.

- [ ] **Step 7: Commit**

```bash
rtk git add lib/trial-import.ts lib/trial-import.test.ts app/api/me/trial-import/route.ts app/avatar/page.tsx && rtk git commit -m "feat(essai): l'import a l'inscription couvre trois chapitres et les cinematiques vues

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: E2E du parcours d'essai étendu

**Files:**
- Modify: `e2e/trial.spec.ts`
- Create: `e2e/trial-etendu.spec.ts`

**Interfaces:**
- Consumes: testids existants `cinematic-player`, `cinematic-skip`, `replay-intro` ; helpers/solutions de `e2e/html-parcours.spec.ts` (CH1_SOLUTIONS) ; garde e2e-db (jamais affaiblie).

- [ ] **Step 1: Lire `e2e/trial.spec.ts` et l'adapter**

Le spec d'essai actuel suppose : conversion en fin de chapitre 1, retour → accueil. Adapter : la conversion n'apparaît plus au chapitre 1 (l'outro joue, puis navigation vers le chapitre 2) ; le lien retour pointe vers `/learn/html`. Conserver toutes les intentions de test existantes (import à l'inscription, etc.) en les déplaçant vers la nouvelle borne (chapitre 3) quand c'est ce qu'elles testent.

- [ ] **Step 2: Écrire `e2e/trial-etendu.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

/**
 * Parcours d'essai étendu (sans compte) : carte publique, chapitres 1-3
 * jouables avec cinématiques, verrous vers l'inscription au-delà.
 * Aucune session : pas de storageState.
 */

test("la carte HTML est publique, avec verrous d'inscription au-delà du chapitre 3", async ({
  page,
}) => {
  await page.goto("/learn/html");
  // Pas de redirection vers /login.
  await expect(page).toHaveURL(/\/learn\/html$/);

  // Intro auto-jouée à la première visite (storage vierge) → skip.
  await expect(page.getByTestId("cinematic-player")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);

  // Nœuds hors essai : verrouillés vers l'inscription.
  await expect(page.getByText("Inscription requise").first()).toBeVisible();

  // Rechargement : pas de re-auto-play (nc_cine_seen).
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);
});

test("un chapitre protégé redirige vers la connexion", async ({ page }) => {
  await page.goto("/learn/html/chapitre-4");
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
});

test("le chapitre 1 en essai joue l'outro puis propose le chapitre suivant", async ({
  page,
}) => {
  // Marque l'intro comme vue pour ne tester ici que l'outro.
  await page.goto("/learn/html/chapitre-1");
  await page.evaluate(() => {
    window.localStorage.setItem("nc_cine_seen", JSON.stringify(["html:intro"]));
  });

  const solutions = [
    "<!DOCTYPE html>\n<html></html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
  ];
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < solutions.length; i++) {
    const editor = page.locator(".monaco-editor").first();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.insertText(solutions[i]);
    await page.getByRole("button", { name: /DEPLOYER/ }).click();
    await expect(page.getByText("SYSTEME EN LIGNE")).toBeVisible({ timeout: 10_000 });
    const bannerBtn = page.getByRole("button", {
      name: i === solutions.length - 1 ? /TERMINER LE PROTOCOLE/ : /SYSTEME SUIVANT/,
    });
    await bannerBtn.click();
  }

  // Outro du chapitre 1, CTA « Chapitre suivant » → navigation vers le ch. 2.
  const player = page.getByTestId("cinematic-player");
  await expect(player).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Chapitre suivant/ }).click();
  await expect(page).toHaveURL(/\/learn\/html\/chapitre-2/, { timeout: 15_000 });
});
```

- [ ] **Step 3: Exécuter les e2e sur Postgres local jetable**

Même protocole que la feature précédente (jamais toucher `.env`, jamais affaiblir la garde) :

```bash
docker run -d --name codeforge-e2e -e POSTGRES_PASSWORD=test -e POSTGRES_DB=codeforge_test -p 56432:5432 postgres:16
docker exec codeforge-e2e pg_isready -U postgres
```

puis, avec `DATABASE_URL` et `DIRECT_URL` surchargés vers `postgresql://postgres:test@localhost:56432/codeforge_test` pour chaque commande : `pnpm prisma migrate deploy`, `pnpm playwright test`, et enfin `docker rm -f codeforge-e2e`.
Expected: 0 échec (les skips E2E_PROD restent attendus).

- [ ] **Step 4: Suite complète**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: clean / PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add e2e && rtk git commit -m "test(e2e): parcours d'essai etendu (carte publique, outros, verrous, redirection)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
