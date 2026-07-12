# Cinématique d'intro Nebula Command — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une courte cinématique pixel-art à l'accueil (`/`) qui pose l'univers Nebula Command, jouée à la première visite, skippable et rejouable.

**Architecture:** Un composant client overlay (`IntroCinematic`) affiche 5 scènes en auto-défilement. Le rendu a deux modes pilotés par un flag : un **placeholder** composé des assets `/public` existants (actif tout de suite) et un mode **sprite-sheet** qui lira `intro-cinematic.png` quand l'art sera dessiné. La logique de déclenchement (première visite, reduced-motion) est isolée dans un module pur testé.

**Tech Stack:** Next.js 16 (App Router, React Server + Client Components), Tailwind v4 (classes utilitaires + `@keyframes` manuels dans `globals.css`), Vitest (env **node**, tests purs), Playwright (e2e), Web Audio via `lib/audio.ts`.

## Global Constraints

- **Copie en français**, ton Nebula Command (Cadet, station, cursus). Pas de vocabulaire « forge/marteau ».
- **Assets pixel** : `image-rendering: pixelated` + scaling entier sur toute image pixel-art.
- **Pattern art différé** : tout sprite non encore dessiné est gardé par un flag dans `SPRITE_SHEETS_READY` (`lib/sprite-config.ts`) ; tant que `false`, on rend un fallback. Ne jamais committer un `src` de PNG absent sans fallback.
- **Vitest = env node** : les tests unitaires ne couvrent que des fonctions **pures** (pas de `window`/DOM). Les composants React se vérifient via `tsc` + `next build` + e2e.
- **Tokens couleur** : n'utiliser que les classes `nebula-*` existantes (`text-nebula-cyan`, `bg-nebula-bg-darkest`, `bg-nebula-stars`, `border-nebula-border`, …).
- **Clé localStorage** : `nc_intro_seen` (valeur `"true"`).
- **Commits fréquents**, un par tâche.
- Spec de référence : [docs/superpowers/specs/2026-07-12-cinematique-intro-design.md](../specs/2026-07-12-cinematique-intro-design.md).

---

## File Structure

| Fichier | Responsabilité |
|---|---|
| `lib/intro.ts` | Logique pure : scènes, clé storage, `shouldAutoPlayIntro`, helpers storage gardés. |
| `lib/intro.test.ts` | Tests Vitest des fonctions pures. |
| `lib/sprite-config.ts` (modif) | Déclare `INTRO_CINEMATIC` + flag `intro`. |
| `app/globals.css` (modif) | `@keyframes` + utilitaires d'animation des scènes. |
| `components/intro/IntroCinematic.tsx` | Le moteur : overlay, scènes, contrôles, son, a11y, placeholder/sprite. |
| `components/intro/IntroCinematicMount.tsx` | Wrapper client : décide de l'auto-play + écoute la relecture. |
| `components/intro/ReplayIntroButton.tsx` | Bouton « Revoir l'intro » (émet l'évènement de relecture). |
| `app/page.tsx` (modif) | Monte le wrapper + place le bouton de relecture. |
| `e2e/intro.spec.ts` | Couverture e2e (1re visite / skip / 2e visite / relecture). |
| `docs/PIXEL_ART_GUIDE.md` (modif) | Contrat de frames de la cinématique (livrable art). |

---

## Task 1: Logique pure, données de scènes & contrat sprite

**Files:**
- Create: `lib/intro.ts`
- Create: `lib/intro.test.ts`
- Modify: `lib/sprite-config.ts`

**Interfaces:**
- Produces:
  - `INTRO_STORAGE_KEY: string` (= `"nc_intro_seen"`)
  - `INTRO_SCENE_DURATION_MS: number` (= `4500`)
  - `interface IntroScene { id: number; narration: string; visual: "logo" | "cadet" | "orbit" | "planet" | "invite" }`
  - `INTRO_SCENES: IntroScene[]` (5 éléments, `id` = index)
  - `shouldAutoPlayIntro(seen: boolean, reducedMotion: boolean): boolean`
  - `hasSeenIntro(): boolean` / `markIntroSeen(): void` (gardés `typeof window`)
  - `INTRO_CINEMATIC: SpriteSheet` et `SPRITE_SHEETS_READY.intro: boolean` (dans `lib/sprite-config.ts`)

- [ ] **Step 1 : Écrire le test qui échoue** — `lib/intro.test.ts`

```ts
import { describe, it, expect } from "vitest";
import {
  shouldAutoPlayIntro,
  INTRO_SCENES,
  INTRO_STORAGE_KEY,
  INTRO_SCENE_DURATION_MS,
} from "./intro";

describe("shouldAutoPlayIntro", () => {
  it("joue à la première visite sans reduced-motion", () => {
    expect(shouldAutoPlayIntro(false, false)).toBe(true);
  });
  it("ne joue pas si déjà vue", () => {
    expect(shouldAutoPlayIntro(true, false)).toBe(false);
  });
  it("ne joue pas si reduced-motion demandé", () => {
    expect(shouldAutoPlayIntro(false, true)).toBe(false);
  });
  it("ne joue pas si vue ET reduced-motion", () => {
    expect(shouldAutoPlayIntro(true, true)).toBe(false);
  });
});

describe("INTRO_SCENES", () => {
  it("contient exactement 5 scènes aux ids séquentiels 0..4", () => {
    expect(INTRO_SCENES).toHaveLength(5);
    INTRO_SCENES.forEach((s, i) => expect(s.id).toBe(i));
  });
  it("a une narration non vide pour chaque scène", () => {
    for (const s of INTRO_SCENES) {
      expect(s.narration.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("constantes", () => {
  it("clé storage et durée stables", () => {
    expect(INTRO_STORAGE_KEY).toBe("nc_intro_seen");
    expect(INTRO_SCENE_DURATION_MS).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/intro.test.ts`
Expected: FAIL — `Failed to resolve import "./intro"`.

- [ ] **Step 3 : Écrire l'implémentation minimale** — `lib/intro.ts`

```ts
/**
 * Logique pure de la cinématique d'intro (aucune dépendance DOM au niveau
 * module, pour rester testable en environnement node). Les helpers storage
 * sont gardés par `typeof window` et ne s'exécutent qu'au runtime navigateur.
 */

export const INTRO_STORAGE_KEY = "nc_intro_seen";

/** Durée d'affichage d'une scène avant auto-défilement (ms). */
export const INTRO_SCENE_DURATION_MS = 4500;

export interface IntroScene {
  /** Index stable ; sert aussi de numéro de frame quand l'art pixel arrive. */
  id: number;
  /** Narration affichée en texte réel (lisible par lecteur d'écran). */
  narration: string;
  /** Variante visuelle du placeholder (composé d'assets existants). */
  visual: "logo" | "cadet" | "orbit" | "planet" | "invite";
}

export const INTRO_SCENES: IntroScene[] = [
  { id: 0, narration: "Bienvenue à bord de Nebula Command", visual: "logo" },
  { id: 1, narration: "Tu es Cadet-Ingénieur de la station", visual: "cadet" },
  { id: 2, narration: "Chaque langage est une pièce maîtresse", visual: "orbit" },
  {
    id: 3,
    narration: "La console scelle le code — une planète se stabilise",
    visual: "planet",
  },
  { id: 4, narration: "Choisis ton premier cursus", visual: "invite" },
];

/**
 * N'auto-joue la cinématique qu'à une première visite ET si l'utilisateur n'a
 * pas demandé à réduire les animations. Pur : le composant résout les booléens.
 */
export function shouldAutoPlayIntro(seen: boolean, reducedMotion: boolean): boolean {
  return !seen && !reducedMotion;
}

/** Lit le drapeau « déjà vue » ; `false` si le storage est indisponible. */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persiste que l'intro a été vue ; no-op si le storage est indisponible. */
export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `npx vitest run lib/intro.test.ts`
Expected: PASS (les 3 blocs `describe`).

- [ ] **Step 5 : Ajouter le contrat sprite** — `lib/sprite-config.ts`

Dans l'objet `SPRITE_SHEETS_READY`, ajouter la ligne `intro: false` :

```ts
export const SPRITE_SHEETS_READY = {
  mission: true,
  banner: true,
  badges: true,
  intro: false,
} as const;
```

Puis, à la fin du fichier (avant les helpers `BACKGROUND_BY_COURSE`), déclarer la sheet :

```ts
/**
 * Frames de la cinématique d'intro : une frame par scène, ordre = INTRO_SCENES
 * (lib/intro.ts). Sheet : 5 colonnes × 1 ligne × 320×180 = 1600×180.
 * Livrée plus tard (voir docs/PIXEL_ART_GUIDE.md) ; tant que
 * SPRITE_SHEETS_READY.intro est false, le composant rend un placeholder.
 */
export const INTRO_CINEMATIC: SpriteSheet = {
  src: "/sprites/intro-cinematic.png",
  frameWidth: 320,
  frameHeight: 180,
  columns: 5,
};
```

- [ ] **Step 6 : Vérifier types & lint**

Run: `npx tsc --noEmit && npx eslint lib/intro.ts lib/sprite-config.ts`
Expected: aucune erreur.

- [ ] **Step 7 : Commit**

```bash
git add lib/intro.ts lib/intro.test.ts lib/sprite-config.ts
git commit -m "feat(intro): logique pure, scenes et contrat sprite de la cinematique"
```

---

## Task 2: Le composant moteur `IntroCinematic` + animations CSS

**Files:**
- Create: `components/intro/IntroCinematic.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes (Task 1) : `INTRO_SCENES`, `INTRO_SCENE_DURATION_MS`, `markIntroSeen`, `IntroScene`, `INTRO_CINEMATIC`, `SPRITE_SHEETS_READY`. Depuis `lib/audio.ts` : `isSoundEnabled`, `setSoundEnabled`, `unlockAudio`, `playDeployBip`, `playFanfare`. Composant `components/ui/Sprite.tsx` (export default `Sprite`).
- Produces : `export default function IntroCinematic(props: { open: boolean; onClose: () => void; reducedMotion?: boolean })`.

- [ ] **Step 1 : Ajouter les keyframes** — `app/globals.css`

Ajouter à la fin du fichier (après les derniers `@keyframes`) :

```css
/* Cinématique d'intro */
@keyframes intro-scene-in {
  from { opacity: 0; transform: scale(1.04); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-intro-scene-in { animation: intro-scene-in 0.6s ease-out both; }

@keyframes intro-orbit {
  from { transform: rotate(0deg) translateX(78px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(78px) rotate(-360deg); }
}
.animate-intro-orbit { animation: intro-orbit 6s linear infinite; }

@keyframes intro-planet-settle {
  0%   { opacity: 0; transform: scale(0.2) rotate(-18deg); }
  70%  { opacity: 1; transform: scale(1.08) rotate(4deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
.animate-intro-planet-settle { animation: intro-planet-settle 1.2s ease-out both; }
```

- [ ] **Step 2 : Écrire le composant** — `components/intro/IntroCinematic.tsx`

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Sprite from "@/components/ui/Sprite";
import {
  INTRO_SCENES,
  INTRO_SCENE_DURATION_MS,
  markIntroSeen,
  type IntroScene,
} from "@/lib/intro";
import { INTRO_CINEMATIC, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import {
  isSoundEnabled,
  setSoundEnabled,
  unlockAudio,
  playDeployBip,
  playFanfare,
} from "@/lib/audio";

interface IntroCinematicProps {
  /** Quand false, rien n'est rendu. */
  open: boolean;
  /** Appelé à la fermeture (skip, fin, ou Échap). */
  onClose: () => void;
  /** En reduced-motion : scènes en stills, pas d'auto-défilement ni d'animation. */
  reducedMotion?: boolean;
}

/** Rend le visuel d'une scène : sprite si l'art est prêt, sinon placeholder. */
function SceneVisual({
  scene,
  reducedMotion,
}: {
  scene: IntroScene;
  reducedMotion: boolean;
}) {
  if (SPRITE_SHEETS_READY.intro) {
    return <Sprite sheet={INTRO_CINEMATIC} frame={scene.id} displaySize={320} />;
  }
  const pixel = { imageRendering: "pixelated" as const };
  switch (scene.visual) {
    case "logo":
      return (
        <Image
          src="/brand_logo_pixel.png"
          alt=""
          width={128}
          height={128}
          className={reducedMotion ? "" : "animate-planet-rotate"}
          style={pixel}
        />
      );
    case "cadet":
      return (
        <Image src="/role-ingenieur-v2.png" alt="" width={140} height={140} style={pixel} />
      );
    case "orbit":
      return (
        <div className="relative h-40 w-40">
          <Image
            src="/brand_logo_pixel.png"
            alt=""
            width={56}
            height={56}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={pixel}
          />
          {["HTML", "CSS", "JS"].map((label, i) => (
            <span
              key={label}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                reducedMotion ? "" : "animate-intro-orbit"
              }`}
              style={{ animationDelay: `${i * -2}s` }}
            >
              <span className="rounded-sm border border-nebula-cyan/50 bg-nebula-bg-panel px-2 py-1 font-tech text-[10px] tracking-widest text-nebula-cyan">
                {label}
              </span>
            </span>
          ))}
        </div>
      );
    case "planet":
      return (
        <Image
          src="/planet-ring-v2.png"
          alt=""
          width={160}
          height={160}
          className={reducedMotion ? "" : "animate-intro-planet-settle"}
          style={pixel}
        />
      );
    case "invite":
      return (
        <Image
          src="/planet-gas-v2.png"
          alt=""
          width={120}
          height={120}
          className={reducedMotion ? "" : "animate-planet-rotate"}
          style={pixel}
        />
      );
  }
}

export default function IntroCinematic({
  open,
  onClose,
  reducedMotion = false,
}: IntroCinematicProps) {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    markIntroSeen();
    onClose();
  }, [onClose]);

  // Repart à la première scène et lit la préférence son à chaque ouverture.
  useEffect(() => {
    if (open) {
      setIndex(0);
      setSoundOn(isSoundEnabled());
    }
  }, [open]);

  // Auto-défilement (désactivé en reduced-motion).
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((i) => {
        if (i >= INTRO_SCENES.length - 1) {
          finish();
          return i;
        }
        return i + 1;
      });
    }, INTRO_SCENE_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [open, index, reducedMotion, finish]);

  // Cue sonore par scène (uniquement si le son est activé).
  useEffect(() => {
    if (!open || !soundOn) return;
    if (index === INTRO_SCENES.length - 1) playFanfare();
    else playDeployBip();
  }, [open, index, soundOn]);

  // Échap ferme.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  // Focus l'overlay à l'ouverture (navigation clavier).
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const scene = INTRO_SCENES[index];
  const isLast = index === INTRO_SCENES.length - 1;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) unlockAudio();
  };

  const goNext = () => {
    setIndex((i) => (i >= INTRO_SCENES.length - 1 ? i : i + 1));
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cinématique d'introduction Nebula Command"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula-bg-darkest outline-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-40" />

      <div
        key={reducedMotion ? "static" : index}
        className={`relative flex h-56 w-full max-w-2xl items-center justify-center ${
          reducedMotion ? "" : "animate-intro-scene-in"
        }`}
      >
        <SceneVisual scene={scene} reducedMotion={reducedMotion} />
      </div>

      <p
        aria-live="polite"
        className="mt-6 max-w-xl px-6 text-center font-tech text-lg tracking-wide text-nebula-cyan sm:text-xl"
      >
        {scene.narration}
      </p>

      {isLast && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            onClick={finish}
            className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest transition-all hover:translate-y-px active:translate-y-[3px]"
          >
            {"> "}Démarrer la mission
          </Link>
          <Link
            href="/learn"
            onClick={finish}
            className="rounded-sm border border-nebula-cyan-dim px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan"
          >
            Explorer les cursus
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <div className="flex gap-2">
          {INTRO_SCENES.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Aller à la scène ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-nebula-cyan" : "bg-nebula-border"
              }`}
            />
          ))}
        </div>
        {reducedMotion && !isLast && (
          <button
            onClick={goNext}
            className="ml-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan hover:underline"
          >
            Suivant →
          </button>
        )}
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-4">
        <button
          onClick={toggleSound}
          aria-label={soundOn ? "Couper le son" : "Activer le son"}
          className="text-lg transition-transform hover:scale-110"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button
          onClick={finish}
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          Passer ✕
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint components/intro/IntroCinematic.tsx && npx next build`
Expected: 0 erreur ; `next build` réussit (exit 0).

> Note : le composant est client et Vitest tourne en env node — pas de test de rendu unitaire ici. Le comportement est couvert par l'e2e (Task 4).

- [ ] **Step 4 : Commit**

```bash
git add components/intro/IntroCinematic.tsx app/globals.css
git commit -m "feat(intro): composant cinematique (scenes, controles, son, a11y) + keyframes"
```

---

## Task 3: Montage sur l'accueil + bouton de relecture

**Files:**
- Create: `components/intro/IntroCinematicMount.tsx`
- Create: `components/intro/ReplayIntroButton.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes (Task 1/2) : `IntroCinematic` (default), `hasSeenIntro`, `shouldAutoPlayIntro`.
- Produces : `IntroCinematicMount` (default) et `ReplayIntroButton` (default), communiquant via l'évènement window `nebula:replay-intro`.

- [ ] **Step 1 : Écrire le wrapper d'auto-play** — `components/intro/IntroCinematicMount.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

import IntroCinematic from "./IntroCinematic";
import { hasSeenIntro, shouldAutoPlayIntro } from "@/lib/intro";

/** Évènement window déclenchant une relecture depuis n'importe quel bouton. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
    if (shouldAutoPlayIntro(hasSeenIntro(), rm)) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  return (
    <IntroCinematic
      open={open}
      reducedMotion={reducedMotion}
      onClose={() => setOpen(false)}
    />
  );
}
```

- [ ] **Step 2 : Écrire le bouton de relecture** — `components/intro/ReplayIntroButton.tsx`

```tsx
"use client";

import { REPLAY_INTRO_EVENT } from "./IntroCinematicMount";

export default function ReplayIntroButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}
      className="font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim transition-colors hover:text-nebula-cyan"
    >
      ▶ Revoir l&apos;intro
    </button>
  );
}
```

- [ ] **Step 3 : Monter sur l'accueil** — `app/page.tsx`

En haut du fichier, ajouter les imports (après `import BrandLogo ...`) :

```tsx
import IntroCinematicMount from "@/components/intro/IntroCinematicMount";
import ReplayIntroButton from "@/components/intro/ReplayIntroButton";
```

Juste après l'ouverture du `return (` (première ligne à l'intérieur du `<div className="relative min-h-screen ...">`), monter le wrapper — placer cette ligne immédiatement après cette `<div>` ouvrante :

```tsx
      {/* Cinématique d'intro (auto-play 1re visite, rejouable) */}
      <IntroCinematicMount />
```

Puis, dans le hero, juste **après** le bloc des deux boutons CTA (le `<div className="flex w-full flex-col items-stretch ...">...</div>` qui contient « Démarrer la mission » / « J'ai déjà un compte »), ajouter le bouton de relecture :

```tsx
          <div className="mt-6">
            <ReplayIntroButton />
          </div>
```

- [ ] **Step 4 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint components/intro app/page.tsx && npx next build`
Expected: 0 erreur ; build réussi.

- [ ] **Step 5 : Vérification manuelle rapide**

Démarrer le serveur, ouvrir `http://localhost:3000` dans une fenêtre privée (localStorage vierge) : la cinématique s'auto-joue, « Passer » la ferme, un rechargement ne la rejoue pas, « ▶ Revoir l'intro » la relance.

- [ ] **Step 6 : Commit**

```bash
git add components/intro/IntroCinematicMount.tsx components/intro/ReplayIntroButton.tsx app/page.tsx
git commit -m "feat(intro): montage accueil (auto-play 1re visite) + bouton relecture"
```

---

## Task 4: Test end-to-end (Playwright)

**Files:**
- Create: `e2e/intro.spec.ts`

**Interfaces:**
- Consumes : le comportement livré (Task 2/3). Sélecteurs : `role="dialog"` de nom « Cinématique d'introduction Nebula Command », bouton « Passer », bouton « ▶ Revoir l'intro ».

> Prérequis e2e (identiques au reste du repo) : `DATABASE_URL` accessible + `pnpm exec playwright install chromium`. La cinématique vit sur `/` (page publique) — pas de connexion nécessaire. Chaque test Playwright a un contexte neuf (localStorage vierge) → l'auto-play se déclenche.

- [ ] **Step 1 : Écrire le test e2e** — `e2e/intro.spec.ts`

```ts
import { test, expect } from "@playwright/test";

const DIALOG = "Cinématique d'introduction Nebula Command";

test("la cinématique s'auto-joue à la première visite puis se saute", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: DIALOG });
  await expect(dialog).toBeVisible();

  await page.getByRole("button", { name: /passer/i }).click();
  await expect(dialog).toBeHidden();

  // Le hero est accessible après fermeture.
  await expect(
    page.getByRole("heading", { name: /nebula command/i })
  ).toBeVisible();
});

test("la cinématique ne se rejoue pas à la deuxième visite", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();

  // Deuxième visite dans le même contexte (flag localStorage posé).
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();
});

test("le bouton « Revoir l'intro » relance la cinématique", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();

  await page.getByRole("button", { name: /revoir l'intro/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeVisible();
});
```

- [ ] **Step 2 : Lancer le test e2e**

Run: `npx playwright test e2e/intro.spec.ts --project=chromium`
Expected: 3 tests PASS. (Si la base/le navigateur ne sont pas provisionnés localement, exécuter en CI — cf. `playwright.config.ts`.)

- [ ] **Step 3 : Commit**

```bash
git add e2e/intro.spec.ts
git commit -m "test(e2e): cinematique d'intro (auto-play, skip, non-rejeu, relecture)"
```

---

## Task 5: Contrat de frames pixel-art (livrable art)

**Files:**
- Modify: `docs/PIXEL_ART_GUIDE.md`

- [ ] **Step 1 : Documenter le contrat** — ajouter une section à la fin de `docs/PIXEL_ART_GUIDE.md`

```markdown
---

## 9. Cinématique d'intro — `intro-cinematic.png`

Contrat défini dans `lib/sprite-config.ts` (`INTRO_CINEMATIC`) et consommé par
`components/intro/IntroCinematic.tsx`.

- **Frame 320×180** (16:9), **5 colonnes**, 1 ligne → canvas **1600×180** (5 frames).
- **Ordre des frames = `INTRO_SCENES`** (`lib/intro.ts`) :

| Frame | Scène | Contenu visuel |
|---|---|---|
| 0 | logo | Un vaisseau se dessine sur un ciel étoilé |
| 1 | cadet | Avatar Cadet-Ingénieur + console holographique |
| 2 | orbit | Panneaux HTML/CSS/JS en orbite autour du vaisseau |
| 3 | planet | La console scelle un bloc → une planète se stabilise |
| 4 | invite | Invitation « Choisis ton premier cursus » (portail de cursus) |

- Palette Nebula (`docs/palette/nebula.hex`), pas d'anti-aliasing, contour 1 px,
  lumière haut-droite (cf. §1). Fond transparent **ou** peint sombre.
- La **narration reste du texte HTML** (déjà en place, lisible lecteur d'écran) :
  ne pas graver de texte dans les frames.

**Activation :** déposer `public/sprites/intro-cinematic.png`, puis passer
`SPRITE_SHEETS_READY.intro` à `true` (`lib/sprite-config.ts`). Le composant
bascule du placeholder au sprite sans autre changement de code.
```

- [ ] **Step 2 : Commit**

```bash
git add docs/PIXEL_ART_GUIDE.md
git commit -m "docs(pixel-art): contrat de frames de la cinematique d'intro"
```

---

## Self-Review (fait à la rédaction)

**Couverture spec :** placement/1re-visite/rejouable (Task 1 logique + Task 3 montage) ✔ ; skippable/Échap (Task 2) ✔ ; reduced-motion (Task 1 `shouldAutoPlayIntro` + Task 2 stills/`Suivant`) ✔ ; sprite-sheet + placeholder + flag (Task 1 config, Task 2 `SceneVisual`) ✔ ; son toggle muet par défaut (Task 2) ✔ ; 5 scènes Nebula Command (Task 1) ✔ ; a11y dialog/aria-live/focus (Task 2) ✔ ; tests unitaires + e2e (Task 1, Task 4) ✔ ; contrat de frames (Task 5) ✔.

**Placeholders :** aucun « TBD/TODO » ; tout le code est fourni intégralement.

**Cohérence des types :** `IntroScene` (id/narration/visual) identique entre `lib/intro.ts`, `SceneVisual` et le contrat doc ; `INTRO_CINEMATIC`/`SPRITE_SHEETS_READY.intro` cohérents entre Task 1 et Task 2 ; `REPLAY_INTRO_EVENT` défini dans `IntroCinematicMount` et réutilisé par `ReplayIntroButton` (Task 3).
```
