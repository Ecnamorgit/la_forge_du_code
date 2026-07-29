# Le premier contact — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ouvrir le trajet inconnu → premier exercice validé → inscription, sans écrire de contenu pédagogique supplémentaire.

**Architecture:** Une seule brèche exacte dans le middleware (`html/chapitre-1`), un `UserProvider` qui choisit entre l'implémentation serveur existante et une implémentation `localStorage` derrière la même interface `UseUserReturn`, et une source narrative unique (`lib/lore.ts`) qui alimente à la fois le crawl et une page Codex publique.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Prisma 7 + PostgreSQL, Vitest, Playwright, `next/og`.

**Spec:** `docs/superpowers/specs/2026-07-28-premier-contact-design.md`
**Branche:** `feat/premier-contact`

## Global Constraints

- **Le nom canonique de la menace est `Spectre`.** Jamais « Null », jamais « Glitch » dans un texte narratif.
- **L'allowlist de routes publiques matche en égalité exacte**, jamais par préfixe.
- **Langue de l'UI et des textes narratifs : français.** Commentaires de code en français, comme le reste du dépôt.
- **Tests unitaires à côté de la source** (`lib/xp.ts` → `lib/xp.test.ts`), convention existante du dépôt.
- **`prefers-reduced-motion`** doit être respecté par toute animation ajoutée.
- Le chapitre d'essai est **`html/chapitre-1` et lui seul**.
- Aucune donnée personnelle ni identifiant de visiteur persistant dans le tracking.
- Vérification finale : `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e`, `pnpm build`.

## Prérequis (à faire avant la Task 1)

Le dépôt porte du travail non commité qui touche exactement les fichiers de ce plan.

- [ ] **Vérifier l'état du dépôt**

```bash
git status --short
```

Attendu : `components/intro/StarWarsCrawl.tsx` non suivi, plus des modifications de `components/intro/IntroCinematic.tsx`, `lib/intro.ts`, `app/globals.css`.

- [ ] **Committer ce travail en cours sur la branche**

```bash
git add components/intro/StarWarsCrawl.tsx components/intro/IntroCinematic.tsx lib/intro.ts app/globals.css
git commit -m "wip(intro): crawl Star Wars et ajustements cinematique avant refonte"
```

Ne rien réécrire ici — c'est un point de sauvegarde. Les tâches suivantes modifient ces fichiers par-dessus.

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `lib/lore.ts` | **Créé.** Source unique du lore : `LORE_SECTIONS` (complet) + `CRAWL_LINES` (condensé) |
| `lib/lore.test.ts` | **Créé.** Intégrité narrative : pas de « Null »/« Glitch », budget de mots du crawl |
| `lib/public-routes.ts` | **Créé.** `PUBLIC_TRIAL_ROUTES` + `isPublicRoute()`, pure et testable |
| `lib/public-routes.test.ts` | **Créé.** Verrouille l'égalité exacte (`chapitre-10` doit rester fermé) |
| `lib/trial-user.ts` | **Créé.** Logique pure de l'état d'essai : lecture/écriture/merge, sans React |
| `lib/trial-user.test.ts` | **Créé.** Idempotence, XP, JSON corrompu, étape inconnue |
| `lib/use-trial-user.ts` | **Créé.** Hook React implémentant `UseUserReturn` par-dessus `lib/trial-user.ts` |
| `lib/user-context.tsx` | **Créé.** `UserProvider` + `useUserContext()` |
| `lib/trial-import.ts` | **Créé.** `filterTrialSteps()`, pure, partagée client/serveur |
| `lib/trial-import.test.ts` | **Créé.** Rejet de tout ce qui sort de l'allowlist |
| `lib/track.ts` | **Créé.** `TRACK_EVENTS` + `isTrackEvent()`, allowlist des évènements |
| `components/intro/StarWarsCrawl.tsx` | **Modifié.** Texte piloté par `CRAWL_LINES`, durée paramétrable, skip immédiat |
| `components/intro/IntroCinematicMount.tsx` | **Modifié.** Autoplay du crawl gouverné par `nc_intro_seen` |
| `components/lesson/TrialBanner.tsx` | **Créé.** Bandeau « mode essai » |
| `components/lesson/TrialConversion.tsx` | **Créé.** Écran de fin d'essai |
| `app/codex/page.tsx` | **Créé.** Page publique du lore |
| `app/opengraph-image.tsx` | **Créé.** Image OG de la landing |
| `app/codex/opengraph-image.tsx` | **Créé.** Image OG du Codex |
| `app/api/me/trial-import/route.ts` | **Créé.** Import de la progression d'essai |
| `app/api/track/route.ts` | **Créé.** Compteur du tunnel |
| `proxy.ts` | **Modifié.** Consomme `isPublicRoute()` |
| `app/layout.tsx` | **Modifié.** `metadataBase` + `openGraph` + `twitter` |
| `app/page.tsx` | **Modifié.** CTA « Essayer sans compte », lien Codex, ping `landing_vue` |
| `app/learn/[course]/[chapter]/ChapterClient.tsx` | **Modifié.** Consomme `useUserContext()` |
| `app/learn/layout.tsx` | **Créé.** Monte `UserProvider` |
| `prisma/schema.prisma` | **Modifié.** Modèle `TrackEvent` |
| `e2e/trial.spec.ts` | **Créé.** Parcours d'essai complet |
| `e2e/intro.spec.ts` | **Modifié.** Mis à jour pour l'autoplay |

---

## Task 1: Source narrative unique

**Files:**
- Create: `lib/lore.ts`
- Test: `lib/lore.test.ts`

**Interfaces:**
- Consumes: rien
- Produces: `LORE_SECTIONS: LoreSection[]`, `CRAWL_LINES: CrawlLine[]`, `CRAWL_WORD_BUDGET: number`, types `LoreSection` et `CrawlLine`

Le lore est aujourd'hui écrit en dur dans le JSX de `StarWarsCrawl.tsx`, ce qui a produit deux antagonistes concurrents. On l'extrait et on verrouille par un test.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `lib/lore.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { CRAWL_LINES, CRAWL_WORD_BUDGET, LORE_SECTIONS } from "./lore";
import { INTRO_SCENES } from "./intro";

/** Termes bannis : anciens noms de la menace, remplacés par « Spectre ». */
const BANNED = [/\bnull\b/i, /\bglitch\b/i];

function allNarrativeText(): string {
  const lore = LORE_SECTIONS.map((s) => `${s.title} ${s.body.join(" ")}`).join(" ");
  const crawl = CRAWL_LINES.map((l) => l.text).join(" ");
  const scenes = INTRO_SCENES.map((s) => s.narration).join(" ");
  return `${lore} ${crawl} ${scenes}`;
}

describe("intégrité narrative", () => {
  it("ne nomme jamais la menace « Null » ou « Glitch »", () => {
    const text = allNarrativeText();
    for (const pattern of BANNED) {
      expect(text, `terme banni ${pattern} trouvé`).not.toMatch(pattern);
    }
  });

  it("nomme la menace Spectre", () => {
    expect(allNarrativeText()).toMatch(/spectre/i);
  });

  it("garde le crawl dans son budget de mots", () => {
    const words = CRAWL_LINES.map((l) => l.text).join(" ").split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(CRAWL_WORD_BUDGET);
  });

  it("expose trois sections de lore non vides", () => {
    expect(LORE_SECTIONS).toHaveLength(3);
    for (const section of LORE_SECTIONS) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/lore.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./lore"`.

- [ ] **Step 3: Écrire `lib/lore.ts`**

```ts
/**
 * Source unique du lore Nebula Command.
 *
 * Le texte narratif ne doit vivre nulle part ailleurs : quand il était écrit
 * en dur dans le JSX, le crawl et les scènes d'intro ont fini par nommer
 * différemment le même antagoniste. `lib/lore.test.ts` verrouille ça.
 *
 * Le nom canonique de la menace est SPECTRE.
 */

export interface LoreSection {
  /** Ancre stable pour les liens profonds vers le Codex. */
  id: string;
  title: string;
  /** Paragraphes. */
  body: string[];
}

export interface CrawlLine {
  /** "title" est rendu en gros, "body" en texte courant. */
  kind: "title" | "body";
  text: string;
}

/** Budget de mots du crawl : au-delà, les 15 s d'animation ne suffisent plus. */
export const CRAWL_WORD_BUDGET = 130;

/** Version condensée, lue par l'overlay d'arrivée (~15 s). */
export const CRAWL_LINES: CrawlLine[] = [
  { kind: "title", text: "I. La Coalition Nebula" },
  {
    kind: "body",
    text: "Au 23ᵉ siècle, les stations orbitales de la Coalition ne tiennent que par leurs Protocoles Systèmes : HTML pour leur structure, CSS pour leurs boucliers, JavaScript pour leurs réacteurs.",
  },
  { kind: "title", text: "II. Spectre" },
  {
    kind: "body",
    text: "Une entité cybernétique nommée Spectre se propage dans les réseaux et corrompt le code des stations. Une station corrompue perd son oxygène, puis dérive dans le vide.",
  },
  { kind: "title", text: "III. Ton rôle" },
  {
    kind: "body",
    text: "Tu es Cadet-Ingénieur. Ta console de programmation pour seule arme, tu vas réécrire les protocoles et repousser Spectre, station après station.",
  },
];

/** Version complète, rendue par la page /codex. */
export const LORE_SECTIONS: LoreSection[] = [
  {
    id: "coalition",
    title: "La Coalition Nebula",
    body: [
      "Au 23ᵉ siècle, l'humanité a essaimé dans la galaxie et bâti un réseau de stations orbitales reliées par la Coalition Nebula.",
      "Cette infrastructure géante ne tient que grâce à un ensemble de technologies logicielles ancestrales et hautement standardisées : les Protocoles Systèmes. HTML décrit la structure physique des stations, CSS répartit l'énergie et les boucliers, JavaScript automatise les tourelles et les réacteurs.",
      "Un protocole mal écrit, et c'est un module entier qui cesse de répondre.",
    ],
  },
  {
    id: "spectre",
    title: "Spectre",
    body: [
      "Spectre est une entité cybernétique d'origine inconnue. Elle ne détruit pas les stations : elle corrompt leur code, ligne après ligne, jusqu'à ce que les systèmes se retournent contre leur équipage.",
      "Une station dont le code est corrompu perd son oxygène, désactive ses boucliers et dérive dans le vide avant d'être capturée.",
      "Aucune arme conventionnelle n'a d'effet sur Spectre. La seule contre-mesure connue est un code correct.",
    ],
  },
  {
    id: "cadet",
    title: "Le Cadet en ingénierie",
    body: [
      "Tu sors tout juste de l'Académie Militaire Spatiale. La flotte est paralysée, et tu es l'un des derniers Cadets-Ingénieurs encore opérationnels.",
      "L'Ingénieure en Chef Kira Vesper, assistée de l'I.A. H.E.L.P., guidera chacun de tes pas depuis le poste de commandement.",
      "Ta mission : voyager de station en station, nettoyer le code corrompu, restaurer les systèmes de survie et programmer les défenses automatiques. Chaque ligne de code valide restaure la station.",
    ],
  },
];
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/lore.test.ts
```

Attendu : PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/lore.ts lib/lore.test.ts
git commit -m "feat(lore): source narrative unique + test d'integrite Spectre"
```

---

## Task 2: Le crawl condensé

**Files:**
- Modify: `components/intro/StarWarsCrawl.tsx`
- Modify: `app/globals.css:845-866`

**Interfaces:**
- Consumes: `CRAWL_LINES` (Task 1)
- Produces: `<StarWarsCrawl onComplete? onSkip? reducedMotion? />`

Trois changements : texte piloté par les données, durée paramétrable (55 s → 15 s), skip immédiat.

- [ ] **Step 1: Rendre la durée pilotable en CSS**

Dans `app/globals.css`, remplacer le bloc `.starwars-crawl-content` :

```css
.starwars-crawl-content {
  transform: rotateX(16deg);
  transform-origin: 50% 100%;
  /* Durée pilotée par le composant via --crawl-duration (défaut : teaser). */
  animation: starwars-crawl var(--crawl-duration, 15s) linear forwards;
}
```

Le reste du bloc (`@keyframes starwars-crawl`, `.starwars-crawl-container`) est inchangé.

- [ ] **Step 2: Réécrire le composant**

Remplacer intégralement `components/intro/StarWarsCrawl.tsx` :

```tsx
"use client";

import { CRAWL_LINES } from "@/lib/lore";

interface StarWarsCrawlProps {
  onComplete?: () => void;
  onSkip?: () => void;
  /** Durée du défilement en secondes. */
  durationSeconds?: number;
  /** Sans mouvement : le texte est affiché d'un bloc, sans défilement. */
  reducedMotion?: boolean;
}

export default function StarWarsCrawl({
  onComplete,
  onSkip,
  durationSeconds = 15,
  reducedMotion = false,
}: StarWarsCrawlProps) {
  const body = (
    <div className="text-center">
      <div className="mb-16 flex flex-col items-center gap-3">
        <span className="font-tech text-sm tracking-[0.45em] uppercase text-nebula-cyan sm:text-base">
          --- TRANSMISSION SPATIALE REÇUE ---
        </span>
        <h1 className="font-tech text-3xl font-bold uppercase tracking-[0.25em] text-yellow-400 drop-shadow-[0_0_20px_rgba(255,230,0,0.4)] sm:text-5xl lg:text-6xl">
          NEBULA COMMAND
        </h1>
      </div>

      {CRAWL_LINES.map((line, i) =>
        line.kind === "title" ? (
          <h2
            key={i}
            className="mb-6 font-tech text-2xl font-bold uppercase tracking-widest text-nebula-orange sm:text-4xl"
          >
            {line.text}
          </h2>
        ) : (
          <p
            key={i}
            className="mb-14 font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl"
          >
            {line.text}
          </p>
        )
      )}
    </div>
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-nebula-bg-darkest font-tech text-yellow-400">
      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-85" />
      <div className="pointer-events-none absolute top-0 z-20 h-28 w-full bg-gradient-to-b from-nebula-bg-darkest via-nebula-bg-darkest/95 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 z-20 h-28 w-full bg-gradient-to-t from-nebula-bg-darkest via-nebula-bg-darkest/90 to-transparent" />

      {reducedMotion ? (
        <div className="z-10 max-h-[78vh] w-[92vw] max-w-3xl overflow-y-auto px-4 sm:px-8">
          {body}
        </div>
      ) : (
        <div className="starwars-crawl-container z-10 flex h-[78vh] w-[92vw] max-w-5xl items-center justify-center px-4 sm:px-8">
          <div
            className="starwars-crawl-content"
            style={{ "--crawl-duration": `${durationSeconds}s` } as React.CSSProperties}
            onAnimationEnd={onComplete}
          >
            {body}
          </div>
        </div>
      )}

      {/* Toujours visible, dès la première seconde : un skip caché transforme
          la curiosité en agacement. */}
      <div className="z-30 mt-2 flex items-center gap-4">
        <button
          onClick={onSkip ?? onComplete}
          className="rounded-sm bg-nebula-cyan px-6 py-2.5 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110 sm:text-sm"
        >
          {reducedMotion ? "Continuer →" : "Passer →"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier le typage**

```bash
pnpm typecheck
```

Attendu : aucune erreur.

- [ ] **Step 4: Vérifier que le test d'intégrité passe toujours**

```bash
pnpm vitest run lib/lore.test.ts
```

Attendu : PASS.

- [ ] **Step 5: Commit**

```bash
git add components/intro/StarWarsCrawl.tsx app/globals.css
git commit -m "feat(intro): crawl condense pilote par lib/lore, duree parametrable, skip immediat"
```

---

## Task 3: La page Codex

**Files:**
- Create: `app/codex/page.tsx`
- Modify: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `LORE_SECTIONS` (Task 1)
- Produces: route publique `/codex`

Server component statique, aucun accès DB : le lore complet devient du texte réel indexable au lieu d'être enfermé dans une animation.

- [ ] **Step 1: Écrire le test e2e qui échoue**

Ajouter à la fin de `e2e/smoke.spec.ts` :

```ts
test("le codex est public et rend le lore", async ({ page }) => {
  const response = await page.goto("/codex");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/codex/i);
  await expect(page.getByRole("heading", { name: /spectre/i })).toBeVisible();
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm exec playwright test e2e/smoke.spec.ts -g "codex"
```

Attendu : ÉCHEC — la page renvoie 404.

- [ ] **Step 3: Créer la page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LORE_SECTIONS } from "@/lib/lore";
import BrandLogo from "@/components/ui/BrandLogo";

export const metadata: Metadata = {
  title: "Codex — Nebula Command",
  description:
    "L'univers de Nebula Command : la Coalition, la menace Spectre et le rôle du Cadet-Ingénieur.",
};

export default function CodexPage() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 bg-nebula-bg" />
      <div className="fixed inset-0 z-0 bg-nebula-stars opacity-30" />

      <header className="relative z-50 flex h-16 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/80 px-4 backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size={40} />
          <span className="font-tech text-sm tracking-widest text-nebula-cyan sm:text-base">
            NEBULA COMMAND
          </span>
        </Link>
        <Link
          href="/learn/html/chapitre-1"
          className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest sm:text-sm"
        >
          Essayer sans compte
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="mb-3 font-display text-2xl tracking-[0.06em] text-nebula-cyan sm:text-4xl">
          CODEX
        </h1>
        <p className="mb-12 font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-dim sm:text-xs">
          [ Archives de la Coalition Nebula ]
        </p>

        {LORE_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <h2 className="mb-4 font-tech text-xl uppercase tracking-widest text-nebula-orange sm:text-2xl">
              {section.title}
            </h2>
            {section.body.map((paragraph, i) => (
              <p
                key={i}
                className="mb-4 font-body text-base leading-relaxed text-nebula-text-secondary sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-16 border-t border-nebula-border/70 pt-8 text-center">
          <p className="mb-5 font-body text-base text-nebula-text-secondary">
            La flotte a besoin d&apos;ingénieurs.
          </p>
          <Link
            href="/learn/html/chapitre-1"
            className="inline-block rounded-sm bg-nebula-cyan px-8 py-4 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)]"
          >
            {"> "}Première mission
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm exec playwright test e2e/smoke.spec.ts -g "codex"
```

Attendu : PASS.

- [ ] **Step 5: Commit**

```bash
git add app/codex/page.tsx e2e/smoke.spec.ts
git commit -m "feat(codex): page publique du lore, indexable"
```

---

## Task 4: Métadonnées et images OG dynamiques

**Files:**
- Modify: `app/layout.tsx:35-39`
- Create: `app/opengraph-image.tsx`
- Create: `app/codex/opengraph-image.tsx`

**Interfaces:**
- Consumes: `env.APP_URL` (via `process.env.APP_URL`)
- Produces: balises OG sur `/` et `/codex`

Aujourd'hui `app/layout.tsx` n'a ni `metadataBase`, ni `openGraph` : un lien partagé sur Discord ou Reddit s'affiche en texte nu.

- [ ] **Step 1: Étendre les métadonnées globales**

Dans `app/layout.tsx`, remplacer le bloc `export const metadata` :

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "CodeForge — Nebula Command",
  description:
    "Plateforme d'apprentissage du code gamifiée — Univers Nebula Command",
  openGraph: {
    type: "website",
    siteName: "Nebula Command",
    locale: "fr_FR",
    title: "CodeForge — Nebula Command",
    description:
      "Apprends à coder dans un univers spatial gamifié. HTML, CSS, JavaScript, React.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeForge — Nebula Command",
    description:
      "Apprends à coder dans un univers spatial gamifié. HTML, CSS, JavaScript, React.",
  },
};
```

- [ ] **Step 2: Créer l'image OG de la landing**

`app/opengraph-image.tsx` :

```tsx
import { ImageResponse } from "next/og";

export const alt = "CodeForge — Nebula Command";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#03060d",
          color: "#00f0ff",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: 6 }}>
          NEBULA COMMAND
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: "#9fb3c8",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Apprends à coder dans un univers spatial gamifié
        </div>
        <div style={{ marginTop: 44, fontSize: 24, color: "#ff6b2c", letterSpacing: 8 }}>
          HTML · CSS · JAVASCRIPT · REACT
        </div>
      </div>
    ),
    size
  );
}
```

**Note :** Satori (le moteur de `next/og`) ne supporte ni `image-rendering: pixelated`, ni les polices locales sans les charger en `ArrayBuffer`. On vise ici la lisibilité, pas la fidélité pixel-art. Ne pas ajouter de police custom sans la charger explicitement — la génération échouerait en production.

- [ ] **Step 3: Créer l'image OG du Codex**

`app/codex/opengraph-image.tsx` :

```tsx
import { ImageResponse } from "next/og";

export const alt = "Codex — Nebula Command";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#03060d",
          color: "#ff6b2c",
        }}
      >
        <div style={{ fontSize: 30, color: "#00f0ff", letterSpacing: 10 }}>
          ARCHIVES DE LA COALITION
        </div>
        <div style={{ marginTop: 24, fontSize: 92, fontWeight: 700, letterSpacing: 8 }}>
          CODEX
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#9fb3c8" }}>
          La Coalition · Spectre · Le Cadet
        </div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 4: Vérifier que les images se génèrent**

```bash
pnpm build
```

Attendu : build vert, avec `/opengraph-image` et `/codex/opengraph-image` dans la liste des routes.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/opengraph-image.tsx app/codex/opengraph-image.tsx
git commit -m "feat(seo): metadonnees OpenGraph + images OG generees par route"
```

---

## Task 5: La brèche dans le mur

**Files:**
- Create: `lib/public-routes.ts`
- Test: `lib/public-routes.test.ts`
- Modify: `proxy.ts:8-30`

**Interfaces:**
- Consumes: rien
- Produces: `PUBLIC_TRIAL_ROUTES: readonly string[]`, `isPublicRoute(pathname: string): boolean`, `TRIAL_COURSE: string`, `TRIAL_CHAPTER: string`

C'est la tâche critique du plan : une erreur ici ouvre le cursus entier.

- [ ] **Step 1: Écrire le test qui échoue**

`lib/public-routes.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { TRIAL_CHAPTER, TRIAL_COURSE, isPublicRoute } from "./public-routes";

describe("isPublicRoute", () => {
  it("ouvre le chapitre d'essai", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
  });

  it("tolère un slash final", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/")).toBe(true);
  });

  it("ferme le chapitre suivant", () => {
    expect(isPublicRoute("/learn/html/chapitre-2")).toBe(false);
  });

  // Le piège : un match par préfixe ouvrirait chapitre-10 le jour où HTML
  // dépassera 9 chapitres. CSS en a déjà 10, JavaScript 12.
  it("ferme chapitre-10 (pas de match par préfixe)", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-11")).toBe(false);
  });

  it("ferme le même numéro de chapitre dans un autre cursus", () => {
    expect(isPublicRoute("/learn/css/chapitre-1")).toBe(false);
    expect(isPublicRoute("/learn/javascript/chapitre-1")).toBe(false);
  });

  it("ferme les sous-chemins du chapitre d'essai", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/solution")).toBe(false);
  });

  it("ferme la liste des cursus", () => {
    expect(isPublicRoute("/learn")).toBe(false);
    expect(isPublicRoute("/learn/html")).toBe(false);
  });

  it("expose le cursus et le chapitre d'essai", () => {
    expect(TRIAL_COURSE).toBe("html");
    expect(TRIAL_CHAPTER).toBe("chapitre-1");
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/public-routes.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./public-routes"`.

- [ ] **Step 3: Écrire l'implémentation**

`lib/public-routes.ts` :

```ts
/**
 * Les exceptions au mur d'authentification.
 *
 * Un visiteur non connecté peut atteindre exactement ces chemins dans /learn.
 * Le reste est protégé par `proxy.ts`.
 */

/** Cursus et chapitre ouverts à l'essai. */
export const TRIAL_COURSE = "html";
export const TRIAL_CHAPTER = "chapitre-1";

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}/${TRIAL_CHAPTER}`,
];

/**
 * Égalité exacte, jamais `startsWith`.
 *
 * Avec un match par préfixe, "/learn/html/chapitre-1" ouvrirait aussi
 * "chapitre-10" le jour où HTML dépassera 9 chapitres — CSS en a déjà 10,
 * JavaScript 12. Le bug serait silencieux et n'apparaîtrait qu'à l'ajout
 * d'un chapitre, des mois plus tard.
 */
export function isPublicRoute(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PUBLIC_TRIAL_ROUTES.includes(normalized);
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/public-routes.test.ts
```

Attendu : PASS, 8 tests.

- [ ] **Step 5: Brancher le middleware**

Dans `proxy.ts`, ajouter l'import et la condition. Remplacer le bloc de garde :

```ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { isPublicRoute } from "@/lib/public-routes";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/learn", "/profil", "/leaderboard", "/avatar"];
const AUTH_PAGES = new Set(["/login", "/signup"]);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAuthed = !!req.auth;

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !isPublicRoute(pathname);

  if (isProtected && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname + search);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.has(pathname) && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});
```

Le reste du fichier (`export const config`) est inchangé.

- [ ] **Step 6: Vérifier manuellement l'ouverture**

```bash
pnpm dev
```

Déconnecté, visiter `http://localhost:3000/learn/html/chapitre-1` → la page s'affiche.
Visiter `http://localhost:3000/learn/html/chapitre-2` → redirection vers `/login`.

- [ ] **Step 7: Commit**

```bash
git add lib/public-routes.ts lib/public-routes.test.ts proxy.ts
git commit -m "feat(trial): ouvre html/chapitre-1 aux visiteurs, allowlist en egalite exacte"
```

---

## Task 6: L'état d'essai (logique pure)

**Files:**
- Create: `lib/trial-user.ts`
- Test: `lib/trial-user.test.ts`

**Interfaces:**
- Consumes: `UserState`, `DEFAULT_USER` (`lib/user-store.ts`) · `xpForStep` (`lib/xp.ts`) · `TRIAL_COURSE`, `TRIAL_CHAPTER` (Task 5)
- Produces: `TRIAL_STORAGE_KEY`, `TrialState`, `parseTrialState(raw)`, `readTrialState()`, `writeTrialState(s)`, `clearTrialState()`, `applyTrialStep(state, stepIndex, objectivesCount)`, `trialStateToUserState(s)`, `trialCompletedSteps(s)`

Aucune dépendance React ici : la logique doit être testable en environnement node, comme le reste de `lib/`.

**Décision de pré-vol (contrôleur).** La version initiale de cette tâche faisait basculer Vitest en `jsdom` pour tester `readTrialState`. C'est disproportionné : `vitest.config.ts` fixe `environment: "node"` avec le commentaire « Aucune dépendance à la base ni au navigateur », et ça changerait l'environnement des 290 tests existants pour quelques assertions de storage.

À la place, toute la logique de décodage vit dans `parseTrialState(raw: string | null): TrialState`, une fonction pure testée en node. `readTrialState` et `writeTrialState` deviennent des enveloppes triviales autour de `localStorage`, sans logique propre à tester. **Ne pas installer `jsdom`. Ne pas modifier `vitest.config.ts`.**

- [ ] **Step 1: Écrire le test qui échoue**

`lib/trial-user.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  applyTrialStep,
  parseTrialState,
  trialCompletedSteps,
  trialStateToUserState,
} from "./trial-user";
import { xpForStep } from "./xp";
import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";

describe("applyTrialStep", () => {
  it("ajoute une étape et attribue l'XP de lib/xp", () => {
    const next = applyTrialStep({ completedSteps: [], xp: 0 }, 0, 3);
    expect(next.state.completedSteps).toEqual([0]);
    expect(next.state.xp).toBe(xpForStep(3));
    expect(next.awardedXp).toBe(xpForStep(3));
    expect(next.alreadyDone).toBe(false);
  });

  it("est idempotent : rejouer une étape n'attribue rien", () => {
    const first = applyTrialStep({ completedSteps: [], xp: 0 }, 0, 3);
    const second = applyTrialStep(first.state, 0, 3);
    expect(second.state.completedSteps).toEqual([0]);
    expect(second.state.xp).toBe(first.state.xp);
    expect(second.awardedXp).toBe(0);
    expect(second.alreadyDone).toBe(true);
  });

  it("garde les étapes triées", () => {
    let s = { completedSteps: [] as number[], xp: 0 };
    s = applyTrialStep(s, 2, 1).state;
    s = applyTrialStep(s, 0, 1).state;
    expect(s.completedSteps).toEqual([0, 2]);
  });

  it("rejette un index d'étape négatif", () => {
    expect(() => applyTrialStep({ completedSteps: [], xp: 0 }, -1, 1)).toThrow();
  });
});

describe("parseTrialState", () => {
  const EMPTY = { completedSteps: [], xp: 0 };

  it("retourne l'état par défaut quand rien n'est stocké", () => {
    expect(parseTrialState(null)).toEqual(EMPTY);
    expect(parseTrialState("")).toEqual(EMPTY);
  });

  it("décode un état valide", () => {
    expect(parseTrialState(JSON.stringify({ completedSteps: [0, 1], xp: 66 }))).toEqual({
      completedSteps: [0, 1],
      xp: 66,
    });
  });

  it("retombe sur l'état par défaut si le JSON est corrompu", () => {
    expect(parseTrialState("{ pas du json")).toEqual(EMPTY);
  });

  it("retombe sur l'état par défaut si la forme est invalide", () => {
    expect(parseTrialState(JSON.stringify({ xp: "beaucoup" }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ completedSteps: "0", xp: 1 }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify({ completedSteps: [0, "1"], xp: 1 }))).toEqual(EMPTY);
    expect(parseTrialState(JSON.stringify([1, 2, 3]))).toEqual(EMPTY);
    expect(parseTrialState("null")).toEqual(EMPTY);
  });

  it("ne partage pas la référence du tableau décodé", () => {
    const parsed = parseTrialState(JSON.stringify({ completedSteps: [0], xp: 25 }));
    parsed.completedSteps.push(99);
    expect(parseTrialState(JSON.stringify({ completedSteps: [0], xp: 25 })).completedSteps).toEqual([0]);
  });
});

describe("trialStateToUserState", () => {
  it("projette dans la forme UserState attendue par les composants", () => {
    const user = trialStateToUserState({ completedSteps: [0, 1], xp: 80 });
    expect(user.totalXp).toBe(80);
    expect(user.completedSteps[`${TRIAL_COURSE}/${TRIAL_CHAPTER}`]).toEqual([0, 1]);
    expect(user.username).toBe("Cadet");
  });
});

describe("trialCompletedSteps", () => {
  it("liste les étapes au format attendu par l'import", () => {
    expect(trialCompletedSteps({ completedSteps: [0, 2], xp: 0 })).toEqual([
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex: 0 },
      { course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex: 2 },
    ]);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/trial-user.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./trial-user"`.

- [ ] **Step 4: Écrire l'implémentation**

`lib/trial-user.ts` :

```ts
/**
 * État de progression du mode essai (visiteur sans compte).
 *
 * Logique pure : aucune dépendance React, les accès storage sont gardés par
 * `typeof window` — même contrat que `lib/intro.ts`.
 *
 * Le mode essai ne couvre qu'un seul chapitre (cf. lib/public-routes.ts),
 * l'état n'a donc pas besoin d'être indexé par cursus.
 */

import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER, type UserState } from "./user-store";
import { xpForStep } from "./xp";

export const TRIAL_STORAGE_KEY = "nc_trial_state";

export interface TrialState {
  /** Index des étapes validées, triés. */
  completedSteps: number[];
  xp: number;
}

export interface TrialStepResult {
  state: TrialState;
  awardedXp: number;
  alreadyDone: boolean;
}

export interface TrialStepRef {
  course: string;
  chapter: string;
  stepIndex: number;
}

const EMPTY: TrialState = { completedSteps: [], xp: 0 };

function isTrialState(value: unknown): value is TrialState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.completedSteps) &&
    v.completedSteps.every((n) => typeof n === "number") &&
    typeof v.xp === "number"
  );
}

/**
 * Décode l'état d'essai depuis sa forme stockée.
 *
 * Toute la logique de décodage vit ici, en pur, pour être testable en
 * environnement node : `readTrialState` n'est qu'une enveloppe autour de
 * `localStorage`. Retourne l'état vide si l'entrée est absente, corrompue ou
 * de forme invalide — jamais d'exception.
 */
export function parseTrialState(raw: string | null): TrialState {
  if (!raw) return { ...EMPTY };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isTrialState(parsed)) return { ...EMPTY };
    return { completedSteps: [...parsed.completedSteps], xp: parsed.xp };
  } catch {
    return { ...EMPTY };
  }
}

/** Lit l'état d'essai ; état vide si le storage est indisponible. */
export function readTrialState(): TrialState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    return parseTrialState(window.localStorage.getItem(TRIAL_STORAGE_KEY));
  } catch {
    return { ...EMPTY };
  }
}

/** Persiste l'état ; no-op silencieux si le storage est indisponible ou plein. */
export function writeTrialState(state: TrialState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* navigation privée ou quota dépassé : l'essai continue en mémoire */
  }
}

export function clearTrialState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Applique une validation d'étape. Même calcul d'XP que `me-server.ts`
 * (`xpForStep`), pour que les chiffres du mode essai soient exactement ceux
 * d'un compte réel.
 */
export function applyTrialStep(
  state: TrialState,
  stepIndex: number,
  objectivesCount: number
): TrialStepResult {
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new Error("Index d'étape invalide");
  }

  if (state.completedSteps.includes(stepIndex)) {
    return { state, awardedXp: 0, alreadyDone: true };
  }

  const awardedXp = xpForStep(objectivesCount);
  return {
    state: {
      completedSteps: [...state.completedSteps, stepIndex].sort((a, b) => a - b),
      xp: state.xp + awardedXp,
    },
    awardedXp,
    alreadyDone: false,
  };
}

/** Projette l'état d'essai dans la forme `UserState` consommée par l'UI. */
export function trialStateToUserState(state: TrialState): UserState {
  return {
    ...DEFAULT_USER,
    username: "Cadet",
    totalXp: state.xp,
    lastVisitedCourse: TRIAL_COURSE,
    completedSteps: {
      [`${TRIAL_COURSE}/${TRIAL_CHAPTER}`]: [...state.completedSteps],
    },
  };
}

/** Liste les étapes validées, au format attendu par /api/me/trial-import. */
export function trialCompletedSteps(state: TrialState): TrialStepRef[] {
  return state.completedSteps.map((stepIndex) => ({
    course: TRIAL_COURSE,
    chapter: TRIAL_CHAPTER,
    stepIndex,
  }));
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/trial-user.test.ts
```

Attendu : PASS, 12 tests.

- [ ] **Step 5: Vérifier qu'aucun test existant n'a cassé**

```bash
pnpm test:run
```

Attendu : PASS pour les 300 tests existants + les nouveaux.

- [ ] **Step 6: Commit**

```bash
git add lib/trial-user.ts lib/trial-user.test.ts
git commit -m "feat(trial): etat de progression local du mode essai (logique pure)"
```

---

## Task 7: Le provider et son branchement

**Files:**
- Create: `lib/use-trial-user.ts`
- Create: `lib/user-context.tsx`
- Create: `app/learn/layout.tsx`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx:19,38`

**Interfaces:**
- Consumes: `UseUserReturn`, `useUser` (`lib/use-user.ts`) · Task 6 · `chapitre1` (`@/data/courses/html/chapitre-1`)
- Produces: `AccountRequiredError`, `useTrialUser(): UseUserReturn`, `UserProvider`, `useUserContext(): UseUserReturn & { isTrial: boolean }`

`useTrialUser` importe **uniquement le chapitre d'essai**, pas `lib/courses-registry.ts` : celui-ci importe les 30+ chapitres et les ferait entrer dans le bundle client. L'import direct rend aussi structurellement impossible de valider une étape hors du chapitre d'essai.

- [ ] **Step 1: Écrire le hook d'essai**

`lib/use-trial-user.ts` :

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { chapitre1 as trialChapter } from "@/data/courses/html/chapitre-1";
import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";
import {
  applyTrialStep,
  readTrialState,
  trialStateToUserState,
  writeTrialState,
  type TrialState,
} from "./trial-user";
import type { CompleteStepResponse, UseUserReturn } from "./use-user";
import { DEFAULT_USER } from "./user-store";

/** Levée par les actions qui n'ont aucun sens sans compte. */
export class AccountRequiredError extends Error {
  constructor(message = "Crée ton compte pour débloquer cette fonctionnalité.") {
    super(message);
    this.name = "AccountRequiredError";
  }
}

const rejectWithAccountRequired = async (): Promise<never> => {
  throw new AccountRequiredError();
};

/**
 * Implémentation `UseUserReturn` pour un visiteur sans compte.
 * La progression vit dans localStorage et ne couvre que le chapitre d'essai.
 */
export function useTrialUser(): UseUserReturn {
  const [trial, setTrial] = useState<TrialState>({ completedSteps: [], xp: 0 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle du storage au montage
    setTrial(readTrialState());
    setHydrated(true);
  }, []);

  const completeStep = useCallback(
    async (
      course: string,
      chapter: string,
      stepIndex: number
    ): Promise<CompleteStepResponse> => {
      if (course !== TRIAL_COURSE || chapter !== TRIAL_CHAPTER) {
        throw new AccountRequiredError(
          "Ce chapitre nécessite un compte. Crée le tien pour continuer."
        );
      }

      const step = trialChapter.steps[stepIndex];
      if (!step) throw new Error("Index d'étape invalide");

      const result = applyTrialStep(trial, stepIndex, step.objectives.length);
      setTrial(result.state);
      writeTrialState(result.state);

      return {
        state: trialStateToUserState(result.state),
        awardedXp: result.awardedXp,
        newBadge: null,
        alreadyDone: result.alreadyDone,
      };
    },
    [trial]
  );

  return {
    state: hydrated ? trialStateToUserState(trial) : DEFAULT_USER,
    hydrated,
    refresh: async () => {},
    // Fire-and-forget côté appelant : sans compte, il n'y a rien à mémoriser.
    markCourseVisited: async () => {},
    claimDailyMission: rejectWithAccountRequired,
    renameUser: rejectWithAccountRequired,
    reset: rejectWithAccountRequired,
    markOnboarded: rejectWithAccountRequired,
    setAvatar: rejectWithAccountRequired,
    completeStep,
  };
}
```

- [ ] **Step 2: Écrire le provider**

`lib/user-context.tsx` :

```tsx
"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

import { useTrialUser } from "./use-trial-user";
import { useUser, type UseUserReturn } from "./use-user";

export type UserContextValue = UseUserReturn & {
  /** Vrai quand la progression est locale (visiteur sans compte). */
  isTrial: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Choisit la source de progression selon la session.
 *
 * Monté uniquement sur le sous-arbre /learn : c'est le seul endroit où un
 * visiteur anonyme manipule un UserState. Le dashboard, le profil et l'avatar
 * restent protégés par le middleware et appellent useUser() directement.
 *
 * Les deux hooks sont appelés inconditionnellement (règles des hooks) ; seul
 * le résultat retenu change.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const serverUser = useUser();
  const trialUser = useTrialUser();

  const isTrial = status === "unauthenticated";
  const value: UserContextValue = isTrial
    ? { ...trialUser, isTrial: true }
    : { ...serverUser, isTrial: false };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext doit être utilisé dans un <UserProvider>");
  return ctx;
}
```

- [ ] **Step 3: Monter le provider sur /learn**

`app/learn/layout.tsx` :

```tsx
import { UserProvider } from "@/lib/user-context";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
```

- [ ] **Step 4: Brancher ChapterClient**

Dans `app/learn/[course]/[chapter]/ChapterClient.tsx`, remplacer la ligne 19 :

```ts
import { useUserContext } from "@/lib/user-context";
```

et la ligne 38 :

```ts
const { state, completeStep, markCourseVisited, isTrial } = useUserContext();
```

- [ ] **Step 5: Vérifier le typage et le lint**

```bash
pnpm typecheck && pnpm lint
```

Attendu : aucune erreur. `isTrial` est déclaré mais pas encore utilisé — si le lint s'en plaint, laisser la Task 8 le consommer et enchaîner sans committer ici.

- [ ] **Step 6: Vérifier manuellement**

```bash
pnpm dev
```

Déconnecté sur `/learn/html/chapitre-1` : valider la première étape, recharger la page → l'étape reste validée.

- [ ] **Step 7: Commit**

```bash
git add lib/use-trial-user.ts lib/user-context.tsx app/learn/layout.tsx "app/learn/[course]/[chapter]/ChapterClient.tsx"
git commit -m "feat(trial): UserProvider choisissant progression serveur ou locale"
```

---

## Task 8: Le parcours visible

**Files:**
- Create: `components/lesson/TrialBanner.tsx`
- Create: `components/lesson/TrialConversion.tsx`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `useUserContext()` (Task 7) · `isChapterComplete` (`lib/user-store.ts`)
- Produces: composants `<TrialBanner />` et `<TrialConversion xp={number} />`

- [ ] **Step 1: Le bandeau**

`components/lesson/TrialBanner.tsx` :

```tsx
"use client";

import Link from "next/link";

export default function TrialBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-nebula-orange/40 bg-nebula-orange/10 px-4 py-2 text-center">
      <span className="font-tech text-[11px] uppercase tracking-widest text-nebula-orange sm:text-xs">
        Mode essai — ta progression est locale
      </span>
      <Link
        href="/signup"
        className="font-tech text-[11px] uppercase tracking-widest text-nebula-cyan underline underline-offset-4 hover:brightness-125 sm:text-xs"
      >
        Créer mon compte
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: L'écran de conversion**

`components/lesson/TrialConversion.tsx` :

```tsx
"use client";

import Link from "next/link";

export default function TrialConversion({ xp }: { xp: number }) {
  return (
    <section className="mx-auto my-8 max-w-xl rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/90 p-6 text-center backdrop-blur-md sm:p-8">
      <p className="mb-2 font-tech text-xs uppercase tracking-[0.35em] text-nebula-cyan">
        Protocole restauré
      </p>
      <p className="mb-6 font-display text-3xl text-nebula-orange sm:text-4xl">
        +{xp} XP
      </p>
      <p className="mb-7 font-body text-base leading-relaxed text-nebula-text-secondary">
        Cette progression n&apos;existe que dans ce navigateur. Crée ton compte
        pour la conserver, débloquer les chapitres suivants et configurer ton
        Cadet.
      </p>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup"
          className="rounded-sm bg-nebula-cyan px-8 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)]"
        >
          {"> "}Garder ma progression
        </Link>
        <Link
          href="/codex"
          className="rounded-sm border border-nebula-cyan-dim px-8 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan"
        >
          Lire le Codex
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Brancher dans ChapterClient**

Ajouter les imports :

```ts
import TrialBanner from "@/components/lesson/TrialBanner";
import TrialConversion from "@/components/lesson/TrialConversion";
import { isChapterComplete } from "@/lib/user-store";
```

Calculer l'état une fois, sous la ligne 38 :

```ts
const chapterDone = isChapterComplete(state, course, chapter.slug, chapter.steps.length);
const showConversion = isTrial && chapterDone;
```

Dans le JSX, en tout premier enfant de l'élément racine retourné par le composant :

```tsx
{isTrial && <TrialBanner />}
```

Et juste après le bloc de l'exercice (la zone qui contient l'éditeur et le bouton de validation) :

```tsx
{showConversion && <TrialConversion xp={state.totalXp} />}
```

Enfin, le lien « chapitre suivant » : en mode essai il doit mener à l'inscription, jamais au chapitre suivant. Le redirect du middleware est un filet de sécurité, pas le chemin nominal. Envelopper la destination existante :

```tsx
<Link href={isTrial ? "/signup" : nextChapterHref}>
  {isTrial ? "Créer mon compte pour continuer" : "Chapitre suivant"}
</Link>
```

Si le composant nomme différemment sa destination de chapitre suivant, garder son nom : seule la condition `isTrial` est à ajouter.

- [ ] **Step 4: Le CTA de la landing**

Dans `app/page.tsx`, remplacer le bloc des deux boutons du hero :

```tsx
<div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
  <Link
    href="/learn/html/chapitre-1"
    className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-8 sm:py-4 sm:text-base"
  >
    {"> "}Essayer sans compte
  </Link>
  <Link
    href="/signup"
    className="rounded-sm border border-nebula-cyan-dim bg-transparent px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint sm:px-8 sm:py-4 sm:text-base"
  >
    S&apos;inscrire
  </Link>
</div>
```

Ajouter un lien « Codex » dans la `<nav>` de l'en-tête, avant « Se connecter » :

```tsx
<Link
  href="/codex"
  className="whitespace-nowrap font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan sm:text-sm"
>
  Codex
</Link>
```

- [ ] **Step 5: Vérifier**

```bash
pnpm typecheck && pnpm lint && pnpm dev
```

Déconnecté : la landing propose « Essayer sans compte », le chapitre affiche le bandeau orange, et la validation de toutes les étapes fait apparaître l'écran de conversion.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/TrialBanner.tsx components/lesson/TrialConversion.tsx "app/learn/[course]/[chapter]/ChapterClient.tsx" app/page.tsx
git commit -m "feat(trial): bandeau mode essai, ecran de conversion, CTA landing"
```

---

## Task 9: Récupération de la progression à l'inscription

**Files:**
- Create: `lib/trial-import.ts`
- Test: `lib/trial-import.test.ts`
- Create: `app/api/me/trial-import/route.ts`
- Modify: `app/avatar/page.tsx`

**Interfaces:**
- Consumes: `PUBLIC_TRIAL_ROUTES`, `TRIAL_COURSE`, `TRIAL_CHAPTER` (Task 5) · `TrialStepRef`, `readTrialState`, `trialCompletedSteps`, `clearTrialState` (Task 6) · `completeStep` (`lib/me-server.ts`)
- Produces: `filterTrialSteps(steps: unknown): TrialStepRef[]`, route `POST /api/me/trial-import`

Sans le filtre, la route deviendrait un « valide-moi tout le cursus » en un appel. C'est la deuxième tâche critique du plan.

- [ ] **Step 1: Écrire le test qui échoue**

`lib/trial-import.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { filterTrialSteps } from "./trial-import";
import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";

const valid = { course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex: 0 };

describe("filterTrialSteps", () => {
  it("garde une étape du chapitre d'essai", () => {
    expect(filterTrialSteps([valid])).toEqual([valid]);
  });

  it("rejette un autre chapitre du même cursus", () => {
    expect(
      filterTrialSteps([{ course: TRIAL_COURSE, chapter: "chapitre-2", stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejette un autre cursus", () => {
    expect(
      filterTrialSteps([{ course: "javascript", chapter: TRIAL_CHAPTER, stepIndex: 0 }])
    ).toEqual([]);
  });

  it("rejette un index négatif ou non entier", () => {
    expect(filterTrialSteps([{ ...valid, stepIndex: -1 }])).toEqual([]);
    expect(filterTrialSteps([{ ...valid, stepIndex: 1.5 }])).toEqual([]);
  });

  it("rejette les entrées malformées sans planter", () => {
    expect(filterTrialSteps([null, 42, "x", {}, { course: TRIAL_COURSE }])).toEqual([]);
  });

  it("rejette une entrée non tableau", () => {
    expect(filterTrialSteps("pas un tableau")).toEqual([]);
    expect(filterTrialSteps(undefined)).toEqual([]);
  });

  it("déduplique", () => {
    expect(filterTrialSteps([valid, valid])).toEqual([valid]);
  });

  it("borne le nombre d'étapes acceptées", () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...valid, stepIndex: i }));
    expect(filterTrialSteps(many).length).toBeLessThanOrEqual(50);
  });

  it("ne garde que ce qui est atteignable par l'allowlist", () => {
    const mixed = [valid, { course: "css", chapter: "chapitre-1", stepIndex: 0 }];
    expect(filterTrialSteps(mixed)).toEqual([valid]);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/trial-import.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./trial-import"`.

- [ ] **Step 3: Écrire le filtre**

`lib/trial-import.ts` :

```ts
/**
 * Filtrage des étapes remontées par le mode essai.
 *
 * Le serveur ne doit accorder que ce que le visiteur pouvait déjà atteindre
 * sans compte : sans ce filtre, /api/me/trial-import deviendrait un
 * « valide-moi tout le cursus » en un appel.
 */

import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";
import type { TrialStepRef } from "./trial-user";

/** Borne défensive : le chapitre d'essai n'a qu'une poignée d'étapes. */
const MAX_STEPS = 50;

export function filterTrialSteps(steps: unknown): TrialStepRef[] {
  if (!Array.isArray(steps)) return [];

  const seen = new Set<number>();
  const kept: TrialStepRef[] = [];

  for (const entry of steps) {
    if (kept.length >= MAX_STEPS) break;
    if (typeof entry !== "object" || entry === null) continue;

    const { course, chapter, stepIndex } = entry as Record<string, unknown>;
    if (course !== TRIAL_COURSE) continue;
    if (chapter !== TRIAL_CHAPTER) continue;
    if (typeof stepIndex !== "number") continue;
    if (!Number.isInteger(stepIndex) || stepIndex < 0) continue;
    if (seen.has(stepIndex)) continue;

    seen.add(stepIndex);
    kept.push({ course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex });
  }

  return kept;
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/trial-import.test.ts
```

Attendu : PASS, 9 tests.

- [ ] **Step 5: Écrire la route**

`app/api/me/trial-import/route.ts` :

```ts
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { InvalidStepError, completeStep } from "@/lib/me-server";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { filterTrialSteps } from "@/lib/trial-import";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limit = await rateLimit(`trial-import:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const steps = filterTrialSteps((raw as { steps?: unknown } | null)?.steps);

  let imported = 0;
  for (const step of steps) {
    try {
      const result = await completeStep(
        session.user.id,
        step.course,
        step.chapter,
        step.stepIndex
      );
      if (!result.alreadyDone) imported += 1;
    } catch (err) {
      // Une étape refusée ne doit pas faire échouer l'onboarding.
      if (err instanceof InvalidStepError) continue;
      throw err;
    }
  }

  logger.info("trial_import", { imported, submitted: steps.length });
  return NextResponse.json({ imported });
}
```

- [ ] **Step 6: Déclencher l'import après l'inscription**

Dans `app/avatar/page.tsx`, ajouter un effet au montage qui envoie l'état d'essai puis le purge. En cas d'échec : on log, on ne bloque pas — la perte maximale est un chapitre d'essai.

```tsx
useEffect(() => {
  const state = readTrialState();
  if (state.completedSteps.length === 0) return;

  void (async () => {
    try {
      const res = await fetch("/api/me/trial-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: trialCompletedSteps(state) }),
      });
      if (res.ok) clearTrialState();
    } catch {
      /* l'onboarding continue : la progression d'essai est perdue, pas le compte */
    }
  })();
}, []);
```

Imports à ajouter :

```ts
import { clearTrialState, readTrialState, trialCompletedSteps } from "@/lib/trial-user";
```

- [ ] **Step 7: Vérifier de bout en bout**

```bash
pnpm dev
```

Déconnecté : valider une étape sur `/learn/html/chapitre-1`, puis s'inscrire. Après la page avatar, le dashboard doit afficher l'XP gagnée pendant l'essai.

- [ ] **Step 8: Commit**

```bash
git add lib/trial-import.ts lib/trial-import.test.ts app/api/me/trial-import/route.ts app/avatar/page.tsx
git commit -m "feat(trial): import de la progression d'essai a l'inscription, filtre sur allowlist"
```

---

## Task 10: Rétablir l'autoplay de l'intro

**Files:**
- Modify: `components/intro/IntroCinematicMount.tsx`
- Modify: `lib/intro.ts`
- Modify: `e2e/intro.spec.ts`

**Interfaces:**
- Consumes: `StarWarsCrawl` (Task 2) · `INTRO_STORAGE_KEY`, `markIntroSeen` (`lib/intro.ts`)
- Produces: `hasSeenIntro(): boolean`

Le drapeau `nc_intro_seen` existe déjà dans `lib/intro.ts` mais n'est plus lu depuis le commit d4649e2 : le verrou localStorage avait été remplacé par un verrou d'authentification. On rétablit le premier.

- [ ] **Step 1: Ajouter le lecteur du drapeau**

Dans `lib/intro.ts`, ajouter après `markIntroSeen` :

```ts
/** L'intro a-t-elle déjà été vue dans ce navigateur ? */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    // Storage indisponible : ne pas imposer l'intro à chaque navigation.
    return true;
  }
}
```

Et corriger le commentaire de `markIntroSeen`, qui affirme aujourd'hui que le drapeau n'est plus lu :

```ts
/**
 * Persiste que l'intro a été vue ; no-op si le storage est indisponible.
 * Lu par `hasSeenIntro()` pour n'auto-jouer le crawl qu'une fois par
 * navigateur.
 */
```

- [ ] **Step 2: Rétablir l'autoplay dans le mount**

Remplacer `components/intro/IntroCinematicMount.tsx` :

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";

import StarWarsCrawl from "./StarWarsCrawl";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro";

/** Évènement window déclenchant une relecture depuis n'importe quel bouton. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

/**
 * Monte le crawl par-dessus la landing.
 *
 * Overlay, jamais redirection : la landing est rendue en HTML dessous, pour
 * que les crawlers et les previews de lien voient la vraie page.
 *
 * Auto-lecture une seule fois par navigateur (drapeau `nc_intro_seen`). Les
 * 5 scènes animées restent au premier login, côté dashboard.
 */
export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleClose = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectures ponctuelles au montage
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!hasSeenIntro()) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <StarWarsCrawl
        reducedMotion={reducedMotion}
        onComplete={handleClose}
        onSkip={handleClose}
      />
    </div>
  );
}
```

- [ ] **Step 3: Mettre à jour le test e2e existant**

`e2e/intro.spec.ts` teste le comportement actuel (pas d'autoplay à l'arrivée) et va casser. Le remplacer :

```ts
import { expect, test } from "@playwright/test";

test.describe("intro d'arrivée", () => {
  test("joue le crawl à la première visite et le laisse passer", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("button", { name: /passer|continuer/i });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(skip).toBeHidden();
    await expect(page.getByRole("link", { name: /essayer sans compte/i })).toBeVisible();
  });

  test("ne rejoue pas le crawl à la visite suivante", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /passer|continuer/i }).click();

    await page.reload();
    await expect(page.getByRole("button", { name: /passer|continuer/i })).toHaveCount(0);
  });
});
```

- [ ] **Step 4: Lancer les tests e2e d'intro**

```bash
pnpm exec playwright test e2e/intro.spec.ts
```

Attendu : PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add components/intro/IntroCinematicMount.tsx lib/intro.ts e2e/intro.spec.ts
git commit -m "feat(intro): auto-lecture du crawl une fois par navigateur via nc_intro_seen"
```

---

## Task 11: Le compteur du tunnel

**Files:**
- Create: `lib/track.ts`
- Test: `lib/track.test.ts`
- Create: `app/api/track/route.ts`
- Modify: `prisma/schema.prisma`
- Modify: `app/page.tsx`
- Modify: `app/api/signup/route.ts`
- Modify: `docs/RGPD.md`

**Interfaces:**
- Consumes: `prisma` (`lib/db.ts`) · `rateLimit`, `getClientIp`, `tooManyRequests` (`lib/rate-limit.ts`)
- Produces: `TRACK_EVENTS`, `TrackEvent`, `isTrackEvent(value: unknown): value is TrackEvent`, route `POST /api/track`

Trois chiffres, aucune donnée personnelle, aucun identifiant de visiteur persistant : on compte des occurrences horodatées, pas des personnes.

- [ ] **Step 1: Écrire le test qui échoue**

`lib/track.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { TRACK_EVENTS, isTrackEvent } from "./track";

describe("isTrackEvent", () => {
  it("accepte les trois évènements du tunnel", () => {
    expect(TRACK_EVENTS).toEqual(["landing_vue", "essai_lance", "inscription"]);
    for (const name of TRACK_EVENTS) {
      expect(isTrackEvent(name)).toBe(true);
    }
  });

  it("rejette tout le reste", () => {
    expect(isTrackEvent("autre_chose")).toBe(false);
    expect(isTrackEvent("")).toBe(false);
    expect(isTrackEvent(null)).toBe(false);
    expect(isTrackEvent(42)).toBe(false);
    expect(isTrackEvent({ name: "landing_vue" })).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/track.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./track"`.

- [ ] **Step 3: Écrire l'allowlist**

`lib/track.ts` :

```ts
/**
 * Comptage minimal du tunnel d'acquisition.
 *
 * Aucune donnée personnelle, aucun identifiant de visiteur persistant : on
 * compte des occurrences horodatées, pas des personnes. Pas de cookie, pas de
 * sous-traitant tiers — cf. docs/RGPD.md.
 */

export const TRACK_EVENTS = ["landing_vue", "essai_lance", "inscription"] as const;

export type TrackEvent = (typeof TRACK_EVENTS)[number];

export function isTrackEvent(value: unknown): value is TrackEvent {
  return typeof value === "string" && (TRACK_EVENTS as readonly string[]).includes(value);
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/track.test.ts
```

Attendu : PASS, 2 tests.

- [ ] **Step 5: Ajouter le modèle Prisma**

À la fin de `prisma/schema.prisma` :

```prisma
/// Comptage agrégé du tunnel d'acquisition. Aucune donnée personnelle :
/// pas d'IP, pas d'identifiant de visiteur, seulement un nom d'évènement
/// et une date.
model TrackEvent {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  @@index([name, createdAt])
}
```

Générer puis appliquer la migration.

⚠️ **`DATABASE_URL` pointe sur la base Supabase de production.** Ne jamais lancer `prisma migrate dev` sans `--create-only` : sur détection de dérive il propose un reset complet de la base. La séquence ci-dessous génère le SQL sans l'appliquer, puis l'applique en avant seulement.

```bash
pnpm prisma migrate dev --name add_track_event --create-only
```

Relire le SQL généré dans `prisma/migrations/<timestamp>_add_track_event/migration.sql` : il doit contenir uniquement un `CREATE TABLE "TrackEvent"` et un `CREATE INDEX`. S'il contient le moindre `DROP`, s'arrêter et signaler.

```bash
pnpm prisma migrate deploy
```

- [ ] **Step 6: Écrire la route**

`app/api/track/route.ts` :

```ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { isTrackEvent } from "@/lib/track";

export async function POST(req: Request) {
  // Sans limite, le compteur est trivialement falsifiable.
  const limit = await rateLimit(`track:${getClientIp(req)}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const name = (raw as { name?: unknown } | null)?.name;
  if (!isTrackEvent(name)) {
    return NextResponse.json({ error: "Évènement inconnu" }, { status: 400 });
  }

  try {
    await prisma.trackEvent.create({ data: { name } });
  } catch (err) {
    // Le comptage ne doit jamais dégrader l'expérience.
    logger.warn("track_write_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 7: Émettre les évènements**

Dans `app/page.tsx`, ajouter un composant client qui ping au montage. Créer `components/ui/TrackLandingView.tsx` :

```tsx
"use client";

import { useEffect } from "react";

export default function TrackLandingView() {
  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "landing_vue" }),
      keepalive: true,
    }).catch(() => {
      /* le comptage ne doit jamais casser la page */
    });
  }, []);

  return null;
}
```

Le monter dans `app/page.tsx` à côté de `<IntroCinematicMount />`.

Pour `essai_lance`, le CTA doit devenir client. Créer `components/ui/TrialCtaLink.tsx` :

```tsx
"use client";

import Link from "next/link";

export default function TrialCtaLink({ className }: { className?: string }) {
  const ping = () => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "essai_lance" }),
      keepalive: true,
    }).catch(() => {
      /* le comptage ne doit jamais bloquer la navigation */
    });
  };

  return (
    <Link href="/learn/html/chapitre-1" onClick={ping} className={className}>
      {"> "}Essayer sans compte
    </Link>
  );
}
```

`keepalive: true` compte : sans lui, la navigation annule la requête avant qu'elle parte.

Dans `app/page.tsx`, remplacer le `<Link href="/learn/html/chapitre-1">` du hero (posé en Task 8) par `<TrialCtaLink className="..." />` en lui passant les mêmes classes.

Dans `app/api/signup/route.ts`, après la création réussie du compte :

```ts
await prisma.trackEvent.create({ data: { name: "inscription" } }).catch(() => {});
```

`landing_vue` et `essai_lance` sont émis côté client volontairement : comptés côté serveur, ils incluraient bots et crawlers et rendraient le taux de conversion illisible. `inscription` est émis côté serveur parce qu'il doit être exact.

- [ ] **Step 8: Documenter dans le RGPD**

Dans `docs/RGPD.md`, section 8 (Cookies), ajouter :

```markdown
Un **comptage interne** enregistre trois évènements agrégés (`landing_vue`,
`essai_lance`, `inscription`) : un nom et un horodatage, sans adresse IP, sans
cookie et sans identifiant de visiteur. Il ne permet pas de reconstituer un
parcours individuel et n'implique aucun sous-traitant tiers.
```

- [ ] **Step 9: Vérifier**

```bash
pnpm typecheck && pnpm test:run
```

Attendu : tout vert.

- [ ] **Step 10: Commit**

```bash
git add lib/track.ts lib/track.test.ts app/api/track/route.ts prisma/schema.prisma prisma/migrations components/ui/TrackLandingView.tsx app/page.tsx app/api/signup/route.ts docs/RGPD.md
git commit -m "feat(track): comptage minimal du tunnel sans cookie ni tiers"
```

---

## Task 12: Le parcours d'essai de bout en bout

**Files:**
- Create: `e2e/trial.spec.ts`

**Interfaces:**
- Consumes: tout ce qui précède
- Produces: rien

- [ ] **Step 1: Écrire le test**

`e2e/trial.spec.ts` :

```ts
import { expect, test } from "@playwright/test";

/** Passe l'overlay du crawl s'il est présent. */
async function skipIntro(page: import("@playwright/test").Page) {
  const skip = page.getByRole("button", { name: /passer|continuer/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

test.describe("essai sans compte", () => {
  test("un visiteur atteint le chapitre d'essai depuis la landing", async ({ page }) => {
    await page.goto("/");
    await skipIntro(page);

    await page.getByRole("link", { name: /essayer sans compte/i }).click();
    await expect(page).toHaveURL(/\/learn\/html\/chapitre-1/);
    await expect(page.getByText(/mode essai/i)).toBeVisible();
  });

  test("le mur tient sur les autres chapitres", async ({ page }) => {
    await page.goto("/learn/html/chapitre-2");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/learn/css/chapitre-1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la progression d'essai survit à un rechargement", async ({ page }) => {
    await page.goto("/learn/html/chapitre-1");
    await expect(page.getByText(/mode essai/i)).toBeVisible();

    const stored = await page.evaluate(() => {
      window.localStorage.setItem(
        "nc_trial_state",
        JSON.stringify({ completedSteps: [0], xp: 25 })
      );
      return window.localStorage.getItem("nc_trial_state");
    });
    expect(stored).toContain("25");

    await page.reload();
    const after = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(after).toContain("25");
  });
});
```

- [ ] **Step 2: Lancer le test**

```bash
pnpm exec playwright test e2e/trial.spec.ts
```

Attendu : PASS, 3 tests.

- [ ] **Step 3: Lancer la vérification complète**

```bash
pnpm lint && pnpm typecheck && pnpm test:run && pnpm build && pnpm test:e2e
```

Attendu : les cinq verts. Si l'un échoue, corriger avant de committer — c'est exactement ce que la CI exécutera.

- [ ] **Step 4: Commit**

```bash
git add e2e/trial.spec.ts
git commit -m "test(e2e): parcours d'essai sans compte et etancheite du mur"
```

---

## Vérification manuelle finale

- [ ] **Rendu OG** — déployer sur une preview, puis coller l'URL dans un validateur de partage (le débogueur de partage de LinkedIn ou l'inspecteur de carte de X). L'image doit s'afficher pour `/` et `/codex`.
- [ ] **Première visite** — en navigation privée, arriver sur `/`, voir le crawl, le passer, arriver sur la landing. Recharger : pas de crawl.
- [ ] **Mouvement réduit** — activer `prefers-reduced-motion` dans les outils de développement, recharger : le texte s'affiche d'un bloc avec « Continuer ».
- [ ] **Parcours complet** — essai → validation → inscription → avatar → dashboard, avec l'XP d'essai présente.
