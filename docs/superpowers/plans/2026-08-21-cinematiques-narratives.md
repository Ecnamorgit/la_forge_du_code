# Cinématiques narratives — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jouer des mini-cinématiques narratives (intro de cursus, outro de chapitre, finale de cursus) dans le thème Nebula Command, avec arc complet pour HTML et repli générique pour les 13 autres cursus.

**Architecture:** Logique pure dans `lib/cinematics/` (types, pool générique, résolveur — testable en node, patron de `lib/intro.ts`), contenu par cursus dans `data/courses/<slug>/cinematics.ts`, lecteur plein écran `<CinematicPlayer>` dérivé de `IntroCinematic`, persistance « vue » côté serveur (modèle Prisma `CinematicView` + route `/api/me/cinematic`), branchée sur la page cursus (intro) et `ChapterClient` (outro/finale).

**Tech Stack:** Next.js App Router, React client components, Tailwind (tokens `nebula-*`), Prisma/PostgreSQL, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-21-cinematiques-narratives-design.md`

## Global Constraints

- Tout texte joueur en français, ton conforme à `docs/conception_storytelling.md` (Kira briefe, H.E.L.P. assiste, le Spectre menace).
- Personnages : uniquement via `CHARACTERS` de `lib/characters.ts` (`kira`, `help`, `spectre`) + voix `system`.
- Durée d'une scène : réutiliser la valeur 4500 ms (constante propre `CINEMATIC_SCENE_DURATION_MS`, même valeur que `INTRO_SCENE_DURATION_MS`).
- Bouton « Passer » toujours visible dans le lecteur ; `prefers-reduced-motion` désactive machine à écrire, auto-défilement et effets.
- Tailles : intro 3-4 scènes, outro de chapitre 2-3 scènes, finale 5-7 scènes.
- ⚠️ `.env` pointe sur la base de PRODUCTION : migration Prisma en deux temps — `pnpm prisma migrate dev --create-only`, relecture du SQL, puis `pnpm prisma migrate deploy`. JAMAIS `migrate dev` seul.
- Mode essai (`isTrial`) : aucun changement de comportement — les cinématiques ne concernent que les utilisateurs connectés (la page `/learn/<course>` est derrière l'auth, et en essai `CompletionScreen` n'est jamais monté ; on ne monte pas non plus les cinématiques).
- Préfixer toutes les commandes shell par `rtk` (ex. `rtk vitest run …`, `rtk git add …`).
- Commits : messages en français, style existant (`feat(...)`, `fix(...)`), avec `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Types, pool générique et résolveur (`lib/cinematics/`)

**Files:**
- Create: `lib/cinematics/types.ts`
- Create: `lib/cinematics/generic.ts`
- Create: `lib/cinematics/resolver.ts`
- Create: `lib/cinematics/resolver.test.ts`

**Interfaces:**
- Consumes: `listChapterSlugs(course)` de `lib/courses-registry.ts`, `COURSES_CATALOG` de `lib/courses-catalog.ts`.
- Produces (utilisé par les Tasks 2, 3, 5, 6) :
  - Types `CinematicScene`, `Cinematic`, `CourseCinematics`, `CinematicMoment`, `CinematicSpeaker`, `CinematicFx`, `CinematicVisual`
  - `CINEMATIC_SCENE_DURATION_MS: number`
  - `cinematicId(course: string, moment: CinematicMoment): string`
  - `getCinematic(course: string, moment: CinematicMoment): Cinematic`
  - `isLastChapter(course: string, chapterSlug: string): boolean`

- [ ] **Step 1: Écrire les types**

`lib/cinematics/types.ts` :

```ts
/**
 * Types des mini-cinématiques narratives (intro de cursus, outro de chapitre,
 * finale). Logique pure, aucune dépendance DOM — même contrainte que
 * lib/intro.ts pour rester testable en node.
 */

import type { CharacterId } from "@/lib/characters";

/** Voix d'une scène : un personnage de la bible, ou le « système » neutre. */
export type CinematicSpeaker = CharacterId | "system";

/** Effet visuel thématique appliqué à la scène. */
export type CinematicFx = "none" | "alert" | "glitch" | "victory";

/** Fond visuel de la scène (composé en CSS, pas d'asset dédié requis). */
export type CinematicVisual = "briefing" | "station" | "spectre" | "victory";

export interface CinematicScene {
  /** Index stable dans la cinématique. */
  id: number;
  speaker: CinematicSpeaker;
  /** Vrai texte (lisible par lecteur d'écran). */
  narration: string;
  visual: CinematicVisual;
  fx?: CinematicFx;
}

export interface Cinematic {
  /** Identifiant persisté : "html:intro", "html:chapter:chapitre-3", "html:finale". */
  id: string;
  scenes: CinematicScene[];
}

/** Cinématiques déclarées par un cursus (data/courses/<slug>/cinematics.ts). */
export interface CourseCinematics {
  courseIntro: Cinematic;
  /** Clé = slug de chapitre. Un chapitre absent retombe sur le générique. */
  chapterOutros: Record<string, Cinematic>;
  courseFinale: Cinematic;
}

export type CinematicMoment =
  | { kind: "intro" }
  | { kind: "chapter"; chapter: string }
  | { kind: "finale" };

/** Durée d'affichage d'une scène avant auto-défilement (alignée sur l'intro). */
export const CINEMATIC_SCENE_DURATION_MS = 4500;

/** Identifiant stable d'une cinématique (clé de persistance CinematicView). */
export function cinematicId(course: string, moment: CinematicMoment): string {
  if (moment.kind === "chapter") return `${course}:chapter:${moment.chapter}`;
  return `${course}:${moment.kind}`;
}
```

- [ ] **Step 2: Écrire le test du résolveur (échec attendu)**

`lib/cinematics/resolver.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { cinematicId } from "./types";
import { getCinematic, isLastChapter } from "./resolver";

describe("cinematicId", () => {
  it("construit des identifiants stables", () => {
    expect(cinematicId("html", { kind: "intro" })).toBe("html:intro");
    expect(cinematicId("html", { kind: "chapter", chapter: "chapitre-3" })).toBe(
      "html:chapter:chapitre-3"
    );
    expect(cinematicId("css", { kind: "finale" })).toBe("css:finale");
  });
});

describe("getCinematic — repli générique", () => {
  it("fournit toujours une cinématique, même pour un cursus sans arc", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.id).toBe("css:intro");
    expect(intro.scenes.length).toBeGreaterThanOrEqual(2);
    // Chaque scène porte un vrai texte.
    for (const s of intro.scenes) expect(s.narration.length).toBeGreaterThan(10);
  });

  it("outro générique : déterministe pour un même chapitre", () => {
    const a = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const b = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    expect(a).toEqual(b);
    expect(a.id).toBe("css:chapter:chapitre-2");
    expect(a.scenes.length).toBeLessThanOrEqual(3);
  });

  it("outro générique : varie d'un chapitre à l'autre (rotation)", () => {
    const c2 = getCinematic("css", { kind: "chapter", chapter: "chapitre-2" });
    const c3 = getCinematic("css", { kind: "chapter", chapter: "chapitre-3" });
    expect(c2.scenes[0].narration).not.toBe(c3.scenes[0].narration);
  });

  it("mentionne le titre du cursus dans l'intro générique", () => {
    const intro = getCinematic("css", { kind: "intro" });
    expect(intro.scenes.map((s) => s.narration).join(" ")).toContain("CSS");
  });
});

describe("isLastChapter", () => {
  it("vrai uniquement pour le dernier chapitre du cursus", () => {
    expect(isLastChapter("html", "chapitre-8")).toBe(true);
    expect(isLastChapter("html", "chapitre-3")).toBe(false);
  });

  it("faux pour un cursus inconnu", () => {
    expect(isLastChapter("inconnu", "chapitre-1")).toBe(false);
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `rtk vitest run lib/cinematics/resolver.test.ts`
Expected: FAIL — `resolver.ts` n'existe pas.

- [ ] **Step 4: Implémenter le pool générique**

`lib/cinematics/generic.ts` :

```ts
/**
 * Cinématiques génériques de repli, utilisées tant qu'un cursus n'a pas son
 * arc écrit (data/courses/<slug>/cinematics.ts). Choix déterministe par index
 * de chapitre — même patron que SPECTRE_TAUNTS (narrative-feedback).
 */

import { COURSES_CATALOG } from "@/lib/courses-catalog";
import {
  cinematicId,
  type Cinematic,
  type CinematicScene,
} from "./types";

function courseTitle(course: string): string {
  return COURSES_CATALOG.find((c) => c.slug === course)?.title ?? course.toUpperCase();
}

export function genericIntro(course: string): Cinematic {
  const title = courseTitle(course);
  const scenes: CinematicScene[] = [
    {
      id: 0,
      speaker: "system",
      narration: `ALERTE : corruption détectée dans les protocoles ${title}. Le Spectre gagne du terrain sur ce secteur de la station.`,
      visual: "spectre",
      fx: "alert",
    },
    {
      id: 1,
      speaker: "kira",
      narration: `« Cadet, ta mission : restaurer les protocoles ${title}, module par module. Je te briefe à chaque étape. »`,
      visual: "briefing",
    },
    {
      id: 2,
      speaker: "help",
      narration: "« Systèmes d'assistance en ligne. À nous de jouer, Cadet ! »",
      visual: "station",
    },
  ];
  return { id: cinematicId(course, { kind: "intro" }), scenes };
}

/**
 * Paires de scènes d'outro génériques. La rotation est indexée sur le numéro
 * du chapitre pour rester déterministe et éviter la répétition immédiate.
 */
const GENERIC_OUTROS: ReadonlyArray<readonly [string, string]> = [
  [
    "SECTEUR RESTAURÉ. Les systèmes répondent de nouveau.",
    "« Beau travail, Cadet. On ne relâche pas : secteur suivant. »",
  ],
  [
    "MODULE STABILISÉ. La corruption recule.",
    "« Le Spectre n'a qu'à bien se tenir. En route, Cadet. »",
  ],
  [
    "PROTOCOLE VALIDÉ. Transmission relayée à la Flotte.",
    "« Kira sera fière de ce rapport. On continue ! »",
  ],
];

/** Rang du chapitre extrait de son slug ("chapitre-3" → 3), 0 si inconnu. */
function chapterRank(chapterSlug: string): number {
  const m = /(\d+)$/.exec(chapterSlug);
  return m ? Number(m[1]) : 0;
}

export function genericChapterOutro(course: string, chapterSlug: string): Cinematic {
  const [systemLine, helpLine] =
    GENERIC_OUTROS[chapterRank(chapterSlug) % GENERIC_OUTROS.length];
  const scenes: CinematicScene[] = [
    { id: 0, speaker: "system", narration: systemLine, visual: "station", fx: "victory" },
    { id: 1, speaker: "help", narration: `« ${helpLine} »`, visual: "briefing" },
  ];
  return { id: cinematicId(course, { kind: "chapter", chapter: chapterSlug }), scenes };
}

export function genericFinale(course: string): Cinematic {
  const title = courseTitle(course);
  const scenes: CinematicScene[] = [
    {
      id: 0,
      speaker: "system",
      narration: `PROTOCOLES ${title.toUpperCase()} : 100 % RESTAURÉS. Le secteur repasse sous contrôle de la Coalition Nebula.`,
      visual: "victory",
      fx: "victory",
    },
    {
      id: 1,
      speaker: "spectre",
      narration: "« Une anomalie corrigée. Il en reste tant d'autres, Cadet... »",
      visual: "spectre",
      fx: "glitch",
    },
    {
      id: 2,
      speaker: "kira",
      narration: `« Mission accomplie, Cadet. Tu viens de rendre les protocoles ${title} à la Flotte. Repos mérité — puis nouveau déploiement. »`,
      visual: "briefing",
    },
    {
      id: 3,
      speaker: "help",
      narration: "« Statistiques archivées. Un autre cursus t'attend au hangar. À nous de jouer, encore ! »",
      visual: "victory",
      fx: "victory",
    },
  ];
  return { id: cinematicId(course, { kind: "finale" }), scenes };
}
```

- [ ] **Step 5: Implémenter le résolveur**

`lib/cinematics/resolver.ts` :

```ts
/**
 * Résolution d'une cinématique : arc écrit du cursus si présent (registre),
 * sinon repli générique. Garantit de toujours renvoyer une cinématique —
 * jamais de trou, jamais de crash (spec §6).
 */

import { listChapterSlugs } from "@/lib/courses-registry";
import { genericChapterOutro, genericFinale, genericIntro } from "./generic";
import type { Cinematic, CinematicMoment, CourseCinematics } from "./types";

/**
 * Registre des arcs écrits. La Task 2 y branche l'arc HTML ; ajouter un arc =
 * une entrée ici + un fichier data/courses/<slug>/cinematics.ts.
 */
const ARCS: Record<string, CourseCinematics> = {};

export function getCinematic(course: string, moment: CinematicMoment): Cinematic {
  const arc = ARCS[course];
  if (arc) {
    if (moment.kind === "intro") return arc.courseIntro;
    if (moment.kind === "finale") return arc.courseFinale;
    const outro = arc.chapterOutros[moment.chapter];
    if (outro) return outro;
  }
  if (moment.kind === "intro") return genericIntro(course);
  if (moment.kind === "finale") return genericFinale(course);
  return genericChapterOutro(course, moment.chapter);
}

/** Le chapitre est-il le dernier du cursus (→ finale au lieu d'outro) ? */
export function isLastChapter(course: string, chapterSlug: string): boolean {
  const slugs = listChapterSlugs(course);
  return slugs.length > 0 && slugs[slugs.length - 1] === chapterSlug;
}
```

- [ ] **Step 6: Vérifier le passage**

Run: `rtk vitest run lib/cinematics/resolver.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
rtk git add lib/cinematics && rtk git commit -m "feat(cinematics): types, pool generique et resolveur avec repli

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Arc narratif du cursus HTML

**Files:**
- Create: `data/courses/html/cinematics.ts`
- Modify: `lib/cinematics/resolver.ts` (brancher l'arc dans `ARCS`)
- Create: `lib/cinematics/html-arc.test.ts`

**Interfaces:**
- Consumes: types et `cinematicId` de `lib/cinematics/types.ts` (Task 1).
- Produces: `HTML_CINEMATICS: CourseCinematics` exporté de `data/courses/html/cinematics.ts`, branché dans `ARCS` du résolveur.

Contexte narratif (bible + résumés réels des chapitres HTML) : le cursus HTML = reconstruire la **base lunaire Selene** et son dock d'amarrage. Chapitres : 1 ÉTABLISSEMENT DE LA BASE LUNAIRE, 2 SYSTÈMES DE NAVIGATION, 3 BASE DE DONNÉES VISUELLE, 4 ARSENAL TACTIQUE, 5 CENTRE DE COMMANDEMENT, 6 STRUCTURE SÉMANTIQUE, 7 MÉTA-DONNÉES, 8 MÉDIAS AVANCÉS. Arc : montée en puissance, contre-attaque du Spectre à mi-parcours (ch. 4-5), victoire finale.

- [ ] **Step 1: Écrire le test de structure (échec attendu)**

`lib/cinematics/html-arc.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { HTML_CINEMATICS } from "@/data/courses/html/cinematics";
import { listChapterSlugs } from "@/lib/courses-registry";
import { getCinematic } from "./resolver";

describe("arc HTML", () => {
  it("chaque chapitre du cursus a une outro déclarée (pas de clé orpheline)", () => {
    const slugs = listChapterSlugs("html");
    expect(Object.keys(HTML_CINEMATICS.chapterOutros).sort()).toEqual([...slugs].sort());
  });

  it("respecte les tailles de la spec", () => {
    expect(HTML_CINEMATICS.courseIntro.scenes.length).toBeGreaterThanOrEqual(3);
    expect(HTML_CINEMATICS.courseIntro.scenes.length).toBeLessThanOrEqual(4);
    for (const outro of Object.values(HTML_CINEMATICS.chapterOutros)) {
      expect(outro.scenes.length).toBeGreaterThanOrEqual(2);
      expect(outro.scenes.length).toBeLessThanOrEqual(3);
    }
    expect(HTML_CINEMATICS.courseFinale.scenes.length).toBeGreaterThanOrEqual(5);
    expect(HTML_CINEMATICS.courseFinale.scenes.length).toBeLessThanOrEqual(7);
  });

  it("le résolveur sert l'arc HTML, pas le générique", () => {
    expect(getCinematic("html", { kind: "intro" })).toBe(HTML_CINEMATICS.courseIntro);
    expect(getCinematic("html", { kind: "chapter", chapter: "chapitre-4" })).toBe(
      HTML_CINEMATICS.chapterOutros["chapitre-4"]
    );
    expect(getCinematic("html", { kind: "finale" })).toBe(HTML_CINEMATICS.courseFinale);
  });

  it("ids stables et scènes numérotées séquentiellement", () => {
    expect(HTML_CINEMATICS.courseIntro.id).toBe("html:intro");
    expect(HTML_CINEMATICS.courseFinale.id).toBe("html:finale");
    for (const cine of [
      HTML_CINEMATICS.courseIntro,
      HTML_CINEMATICS.courseFinale,
      ...Object.values(HTML_CINEMATICS.chapterOutros),
    ]) {
      cine.scenes.forEach((s, i) => expect(s.id).toBe(i));
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/cinematics/html-arc.test.ts`
Expected: FAIL — `data/courses/html/cinematics.ts` n'existe pas.

- [ ] **Step 3: Écrire le contenu de l'arc**

`data/courses/html/cinematics.ts` — contenu complet (les textes ci-dessous sont le livrable, à reprendre tels quels) :

```ts
/**
 * Arc narratif du cursus HTML — reconstruction de la base lunaire Selene.
 * Bible : docs/conception_storytelling.md. Tailles imposées par la spec
 * (intro 3-4, outro 2-3, finale 5-7) et vérifiées par html-arc.test.ts.
 */

import { cinematicId, type CourseCinematics } from "@/lib/cinematics/types";

const course = "html";

export const HTML_CINEMATICS: CourseCinematics = {
  courseIntro: {
    id: cinematicId(course, { kind: "intro" }),
    scenes: [
      {
        id: 0,
        speaker: "system",
        narration:
          "ALERTE INTRUSION — Base lunaire Selene. Le Spectre a effacé les plans de structure : balises corrompues, dock d'amarrage hors ligne.",
        visual: "spectre",
        fx: "alert",
      },
      {
        id: 1,
        speaker: "kira",
        narration:
          "« Cadet, écoute-moi bien. Sans structure HTML, Selene n'est qu'une coquille vide dans le noir. Tu vas la reconstruire, balise par balise. »",
        visual: "briefing",
      },
      {
        id: 2,
        speaker: "help",
        narration:
          "« Console d'ingénierie déverrouillée. Huit secteurs à restaurer, Cadet. À nous de jouer ! »",
        visual: "station",
      },
    ],
  },

  chapterOutros: {
    "chapitre-1": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-1" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "FONDATIONS EN LIGNE. Le squelette de Selene tient : doctype, tête, corps. La base respire de nouveau.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Première pierre posée, Cadet. Une base sans navigation reste une prison : au secteur suivant. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-2": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-2" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "SYSTÈMES DE NAVIGATION RÉTABLIS. Les liens relient de nouveau les modules de Selene entre eux.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Les équipes peuvent circuler ! Prochaine étape : rallumer les écrans de la base de données visuelle. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-3": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-3" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "BANQUE VISUELLE RESTAURÉE. Images et archives s'affichent sur tous les écrans de Selene.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« On y voit clair, enfin. Mais les senseurs captent une activité du Spectre près de l'arsenal... Reste sur tes gardes. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-4": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-4" }),
      scenes: [
        {
          id: 0,
          speaker: "spectre",
          narration:
            "« Tu ranges tes listes, tu alignes tes tableaux... Tu crois structurer. Tu ne fais que retarder l'effacement. »",
          visual: "spectre",
          fx: "glitch",
        },
        {
          id: 1,
          speaker: "system",
          narration:
            "ARSENAL TACTIQUE SÉCURISÉ. L'intrusion du Spectre a été repoussée — l'inventaire est de nouveau lisible.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 2,
          speaker: "kira",
          narration:
            "« Il est venu en personne. C'est qu'on le gêne, Cadet. Le centre de commandement est notre prochaine cible. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-5": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-5" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "CENTRE DE COMMANDEMENT OPÉRATIONNEL. Les formulaires relaient les ordres de la Flotte sans erreur.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Mi-parcours franchi, Cadet ! Selene répond aux commandes. Il reste à consolider sa charpente sémantique. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-6": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-6" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "STRUCTURE SÉMANTIQUE CONSOLIDÉE. Chaque section de Selene annonce désormais sa fonction — plus rien n'est ambigu pour les machines de la Flotte.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Du travail d'ingénieur, pas de bricoleur. Le Spectre déteste l'ordre — continue de lui en donner. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-7": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-7" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "MÉTA-DONNÉES DIFFUSÉES. Selene est identifiable par toutes les balises de la Coalition — la base existe de nouveau sur les cartes.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Un dernier secteur, Cadet : les médias avancés. Après ça, le dock d'amarrage rouvre. Tiens bon ! »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-8": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-8" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "MÉDIAS AVANCÉS EN LIGNE. Sons et vidéos circulent dans toute la base — Selene a retrouvé sa voix.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Tous les secteurs répondent. Prépare-toi, Cadet : ouverture du dock d'amarrage imminente. »",
          visual: "briefing",
        },
      ],
    },
  },

  courseFinale: {
    id: cinematicId(course, { kind: "finale" }),
    scenes: [
      {
        id: 0,
        speaker: "system",
        narration:
          "PROTOCOLES HTML : 100 % RESTAURÉS. Base lunaire Selene entièrement opérationnelle.",
        visual: "victory",
        fx: "victory",
      },
      {
        id: 1,
        speaker: "system",
        narration:
          "Le dock d'amarrage s'ouvre. Les premiers vaisseaux de la Coalition Nebula se posent sur Selene depuis le début de l'invasion.",
        visual: "station",
      },
      {
        id: 2,
        speaker: "spectre",
        narration:
          "« Une base... reconstruite. Amusant. La structure sans style n'est qu'un squelette, Cadet. Je t'attends dans les consoles graphiques. »",
        visual: "spectre",
        fx: "glitch",
      },
      {
        id: 3,
        speaker: "kira",
        narration:
          "« Ne l'écoute pas. Ce que tu as fait ici, aucun protocole automatique n'aurait pu le faire. Selene te doit sa structure, Cadet. »",
        visual: "briefing",
      },
      {
        id: 4,
        speaker: "help",
        narration:
          "« Rapport transmis à la Flotte : mission HTML accomplie ! Le cursus CSS est déverrouillé au hangar — le Spectre nous y attend. À nous de jouer ! »",
        visual: "victory",
        fx: "victory",
      },
    ],
  },
};
```

- [ ] **Step 4: Brancher l'arc dans le résolveur**

Dans `lib/cinematics/resolver.ts`, remplacer :

```ts
const ARCS: Record<string, CourseCinematics> = {};
```

par :

```ts
import { HTML_CINEMATICS } from "@/data/courses/html/cinematics";

const ARCS: Record<string, CourseCinematics> = {
  html: HTML_CINEMATICS,
};
```

(l'import se place en tête de fichier avec les autres).

- [ ] **Step 5: Vérifier le passage de tous les tests cinematics**

Run: `rtk vitest run lib/cinematics`
Expected: PASS — `html-arc.test.ts` ET `resolver.test.ts` (les tests génériques de Task 1 utilisent le cursus `css`, sans arc, donc toujours valides).

- [ ] **Step 6: Commit**

```bash
rtk git add data/courses/html/cinematics.ts lib/cinematics && rtk git commit -m "feat(cinematics): arc narratif complet du cursus HTML (base Selene)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Lecteur `<CinematicPlayer>`

**Files:**
- Create: `lib/cinematics/typewriter.ts`
- Create: `lib/cinematics/typewriter.test.ts`
- Create: `components/cinematics/CinematicPlayer.tsx`

**Interfaces:**
- Consumes: `Cinematic`, `CinematicScene`, `CINEMATIC_SCENE_DURATION_MS` (Task 1) ; `CHARACTERS` de `lib/characters.ts` ; `useModalOverlay` de `lib/use-modal-overlay.ts` ; `playDeployBip`, `playFanfare` de `lib/audio.ts`.
- Produces (utilisé par Tasks 5 et 6) :

```tsx
interface CinematicPlayerProps {
  cinematic: Cinematic;
  /** Quand false, rien n'est rendu. */
  open: boolean;
  /** Appelé à la fermeture — fin naturelle, « Passer », ou Échap. */
  onClose: () => void;
  /** En reduced-motion : texte affiché d'un bloc, pas d'auto-défilement ni d'effets. */
  reducedMotion?: boolean;
  /** Libellé du bouton final (défaut : "Continuer ->"). */
  finalCtaLabel?: string;
}
export default function CinematicPlayer(props: CinematicPlayerProps): JSX.Element | null;
```

- [ ] **Step 1: Test de la logique machine à écrire (échec attendu)**

`lib/cinematics/typewriter.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { TYPEWRITER_CHARS_PER_SECOND, typewriterSlice } from "./typewriter";

describe("typewriterSlice", () => {
  it("révèle le texte progressivement au rythme configuré", () => {
    const text = "SYSTEME EN LIGNE";
    expect(typewriterSlice(text, 0)).toBe("");
    const after500ms = typewriterSlice(text, 500);
    expect(after500ms.length).toBe(
      Math.min(text.length, Math.floor((500 / 1000) * TYPEWRITER_CHARS_PER_SECOND))
    );
    expect(text.startsWith(after500ms)).toBe(true);
  });

  it("plafonne au texte complet", () => {
    expect(typewriterSlice("abc", 60_000)).toBe("abc");
  });

  it("ne casse jamais sur un temps négatif", () => {
    expect(typewriterSlice("abc", -100)).toBe("");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `rtk vitest run lib/cinematics/typewriter.test.ts`
Expected: FAIL — module absent.

- [ ] **Step 3: Implémenter la logique pure**

`lib/cinematics/typewriter.ts` :

```ts
/** Vitesse de révélation du texte des scènes (caractères/seconde). */
export const TYPEWRITER_CHARS_PER_SECOND = 40;

/** Portion du texte visible après `elapsedMs` — pur, testable en node. */
export function typewriterSlice(text: string, elapsedMs: number): string {
  if (elapsedMs <= 0) return "";
  const chars = Math.floor((elapsedMs / 1000) * TYPEWRITER_CHARS_PER_SECOND);
  return text.slice(0, Math.min(text.length, chars));
}
```

- [ ] **Step 4: Vérifier le passage**

Run: `rtk vitest run lib/cinematics/typewriter.test.ts`
Expected: PASS.

- [ ] **Step 5: Implémenter le composant**

`components/cinematics/CinematicPlayer.tsx` (patron de `IntroCinematic` — mêmes conventions : reset au rendu, timers refs, `useModalOverlay`) :

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CHARACTERS } from "@/lib/characters";
import {
  CINEMATIC_SCENE_DURATION_MS,
  type Cinematic,
  type CinematicScene,
} from "@/lib/cinematics/types";
import { typewriterSlice } from "@/lib/cinematics/typewriter";
import { playDeployBip, playFanfare } from "@/lib/audio";
import { useModalOverlay } from "@/lib/use-modal-overlay";

interface CinematicPlayerProps {
  cinematic: Cinematic;
  open: boolean;
  onClose: () => void;
  reducedMotion?: boolean;
  finalCtaLabel?: string;
}

/** Libellé et glyphe du locuteur ("system" n'est pas dans CHARACTERS). */
function speakerLabel(scene: CinematicScene): { glyph: string; name: string; title: string } {
  if (scene.speaker === "system") {
    return { glyph: "🛰️", name: "SYSTÈME", title: "Station Nebula" };
  }
  const c = CHARACTERS[scene.speaker];
  return { glyph: c.glyph, name: c.name, title: c.title };
}

/** Classes du panneau visuel par variante (fond composé en CSS, pas d'asset). */
const VISUAL_CLASSES: Record<CinematicScene["visual"], string> = {
  briefing: "border-nebula-cyan/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]",
  station: "border-nebula-cyan/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]",
  spectre: "border-red-500/50 shadow-[0_0_30px_rgba(255,40,60,0.3)]",
  victory: "border-amber-400/50 shadow-[0_0_30px_rgba(255,200,60,0.3)]",
};

const FX_CLASSES: Record<NonNullable<CinematicScene["fx"]>, string> = {
  none: "",
  alert: "animate-pulse bg-red-500/10",
  glitch: "bg-red-900/10",
  victory: "bg-amber-400/10",
};

export default function CinematicPlayer({
  cinematic,
  open,
  onClose,
  reducedMotion = false,
  finalCtaLabel = "Continuer ->",
}: CinematicPlayerProps) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset à chaque ouverture (le composant reste monté entre deux ouvertures —
  // même patron que IntroCinematic).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIndex(0);
      setElapsed(0);
    }
  }

  const finish = useCallback(() => onClose(), [onClose]);

  // Auto-défilement (désactivé en reduced-motion). `index` en dep, pas
  // d'updater fonctionnel : appeler finish() (setState parent) dans un updater
  // pur déclencherait « Cannot update a component while rendering… ».
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (index >= cinematic.scenes.length - 1) finish();
      else {
        setIndex(index + 1);
        setElapsed(0);
      }
    }, CINEMATIC_SCENE_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [open, index, reducedMotion, finish, cinematic.scenes.length]);

  // Horloge de la machine à écrire (60 ms ≈ fluide sans surcoût).
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setElapsed((e) => e + 60), 60);
    return () => clearInterval(tickRef.current);
  }, [open, index, reducedMotion]);

  // Cue sonore par scène — no-op tant que le son global n'est pas activé
  // (lib/audio est gardé par setSoundEnabled, déjà piloté ailleurs).
  useEffect(() => {
    if (!open) return;
    if (index === cinematic.scenes.length - 1) playFanfare();
    else playDeployBip();
  }, [open, index, cinematic.scenes.length]);

  useModalOverlay(dialogRef, { open, onClose: finish });

  if (!open) return null;

  const scene = cinematic.scenes[index];
  const isLast = index === cinematic.scenes.length - 1;
  const speaker = speakerLabel(scene);
  const shownText = reducedMotion ? scene.narration : typewriterSlice(scene.narration, elapsed);

  const goNext = () => {
    if (isLast) finish();
    else {
      setIndex(index + 1);
      setElapsed(0);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cinématique de mission"
      tabIndex={-1}
      data-testid="cinematic-player"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula-bg-darkest outline-none"
    >
      {/* Passer : toujours visible (règle de la spec). */}
      <button
        onClick={finish}
        data-testid="cinematic-skip"
        className="absolute right-4 top-4 z-30 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
      >
        Passer ✕
      </button>

      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-50" />
      {scene.fx && scene.fx !== "none" && !reducedMotion && (
        <div className={`pointer-events-none absolute inset-0 ${FX_CLASSES[scene.fx]}`} />
      )}

      {/* Panneau visuel de la scène. */}
      <div
        key={reducedMotion ? "static" : index}
        className={`relative my-2 flex min-h-[160px] w-full max-w-2xl items-center justify-center rounded-md border px-4 py-10 ${
          VISUAL_CLASSES[scene.visual]
        } ${reducedMotion ? "" : "animate-intro-scene-in"}`}
      >
        <span aria-hidden className="text-6xl">{speaker.glyph}</span>
      </div>

      {/* Locuteur + narration. */}
      <p className="mt-4 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
        {speaker.glyph} {speaker.name} — {speaker.title}
      </p>
      <p
        aria-live="polite"
        className="mt-2 min-h-[4rem] max-w-xl px-6 text-center font-tech text-lg tracking-wide text-nebula-cyan sm:text-xl"
      >
        {/* Le texte complet reste dans le DOM pour les lecteurs d'écran. */}
        <span className="sr-only">{scene.narration}</span>
        <span aria-hidden>{shownText}</span>
      </p>

      <div className="mt-4 flex items-center justify-center gap-4 z-20">
        <button
          onClick={goNext}
          className="rounded-sm bg-nebula-cyan px-5 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110"
        >
          {isLast ? finalCtaLabel : "Suivant →"}
        </button>
      </div>

      <div className="mt-6 flex gap-2 z-20">
        {cinematic.scenes.map((s, i) => (
          <span
            key={s.id}
            className={`h-2.5 w-2.5 rounded-full ${
              i === index ? "bg-nebula-cyan scale-125" : "bg-nebula-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Vérifier compilation et lint**

Run: `rtk tsc --noEmit && rtk lint`
Expected: aucune erreur nouvelle.

- [ ] **Step 7: Commit**

```bash
rtk git add lib/cinematics/typewriter.ts lib/cinematics/typewriter.test.ts components/cinematics && rtk git commit -m "feat(cinematics): lecteur plein ecran avec machine a ecrire et bouton Passer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Persistance « cinématique vue » (Prisma + API + hook client)

**Files:**
- Modify: `prisma/schema.prisma` (modèle `CinematicView` + relation sur `User`)
- Create: migration SQL (via `--create-only`)
- Modify: `lib/me-server.ts` (deux fonctions)
- Create: `app/api/me/cinematic/route.ts`
- Create: `lib/cinematics/use-cinematic-seen.ts`

**Interfaces:**
- Consumes: `auth` de `@/auth`, `prisma` de `lib/db.ts`, patron de `app/api/me/visit/route.ts`.
- Produces (utilisé par Tasks 5 et 6) :
  - me-server : `listCinematicViews(userId: string, course: string): Promise<string[]>` et `markCinematicView(userId: string, cinematicId: string): Promise<void>`
  - API : `GET /api/me/cinematic?course=<slug>` → `{ seen: string[] }` ; `POST /api/me/cinematic` body `{ cinematicId: string }` → `{ ok: true }`
  - Hook : `useCinematicSeen(course: string): { loaded: boolean; seen: Set<string>; mark: (id: string) => void }`

- [ ] **Step 1: Ajouter le modèle Prisma**

Dans `prisma/schema.prisma`, sous les modèles de progression (`StepCompletion`), ajouter :

```prisma
model CinematicView {
  id          String   @id @default(cuid())
  userId      String
  cinematicId String
  viewedAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, cinematicId])
  @@index([userId])
}
```

et sur le modèle `User`, ajouter la relation `cinematicViews CinematicView[]` à côté des relations existantes (`stepCompletions`, `badges`, …).

- [ ] **Step 2: Générer la migration SANS l'appliquer**

Run: `rtk pnpm prisma migrate dev --create-only --name cinematic_view`
Expected: un dossier `prisma/migrations/<timestamp>_cinematic_view/` avec `migration.sql`.

- [ ] **Step 3: Relire le SQL généré**

Le SQL doit contenir uniquement : `CREATE TABLE "CinematicView"`, l'index unique `(userId, cinematicId)`, l'index `(userId)`, la FK vers `User` avec `ON DELETE CASCADE`. **Aucun DROP, aucun ALTER sur une autre table.** Si autre chose apparaît, STOP et signaler.

- [ ] **Step 4: Appliquer en production (base du .env) et régénérer le client**

Run: `rtk pnpm prisma migrate deploy && rtk pnpm prisma generate`
Expected: `1 migration applied`.

- [ ] **Step 5: Fonctions me-server**

Dans `lib/me-server.ts`, ajouter (près des autres fonctions de progression) :

```ts
/** Ids des cinématiques déjà vues pour un cursus (préfixe "<course>:"). */
export async function listCinematicViews(
  userId: string,
  course: string
): Promise<string[]> {
  const rows = await prisma.cinematicView.findMany({
    where: { userId, cinematicId: { startsWith: `${course}:` } },
    select: { cinematicId: true },
  });
  return rows.map((r) => r.cinematicId);
}

/** Marque une cinématique vue ; idempotent (revoir ne crée pas de doublon). */
export async function markCinematicView(
  userId: string,
  cinematicId: string
): Promise<void> {
  await prisma.cinematicView.upsert({
    where: { userId_cinematicId: { userId, cinematicId } },
    create: { userId, cinematicId },
    update: {},
  });
}
```

- [ ] **Step 6: Route API**

`app/api/me/cinematic/route.ts` (patron exact de `app/api/me/visit/route.ts`) :

```ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { listCinematicViews, markCinematicView } from "@/lib/me-server";

const postSchema = z.object({
  cinematicId: z.string().min(1).max(128),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const course = new URL(req.url).searchParams.get("course") ?? "";
  if (!course || course.length > 64) {
    return NextResponse.json({ error: "course requis" }, { status: 400 });
  }
  const seen = await listCinematicViews(session.user.id, course);
  return NextResponse.json({ seen });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "cinematicId requis" }, { status: 400 });
  }
  await markCinematicView(session.user.id, parsed.data.cinematicId);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Hook client**

`lib/cinematics/use-cinematic-seen.ts` :

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État « cinématiques vues » d'un cursus, côté client.
 *
 * Politique d'erreur (spec §6) : si la lecture échoue, `loaded` reste false et
 * l'appelant NE joue PAS de cinématique automatiquement — on n'impose jamais
 * une cinématique par excès, on préfère la sauter. `mark` est fire-and-forget :
 * un échec réseau est silencieux (au pire la cinématique se rejouera).
 */
export function useCinematicSeen(course: string): {
  loaded: boolean;
  seen: Set<string>;
  mark: (id: string) => void;
} {
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/me/cinematic?course=${encodeURIComponent(course)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch"))))
      .then((data: { seen: string[] }) => {
        if (cancelled) return;
        setSeen(new Set(data.seen));
        setLoaded(true);
      })
      .catch(() => {
        /* loaded reste false : pas d'auto-play, voir docstring */
      });
    return () => {
      cancelled = true;
    };
  }, [course]);

  const mark = useCallback((id: string) => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    void fetch("/api/me/cinematic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cinematicId: id }),
    }).catch(() => {
      /* silencieux, voir docstring */
    });
  }, []);

  return { loaded, seen, mark };
}
```

- [ ] **Step 8: Vérifier compilation, lint, suite complète**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: aucune erreur ; suite verte.

- [ ] **Step 9: Commit**

```bash
rtk git add prisma app/api/me/cinematic lib/me-server.ts lib/cinematics/use-cinematic-seen.ts && rtk git commit -m "feat(cinematics): persistance des cinematiques vues, liee au compte

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Intro de cursus sur la page carte (`/learn/[course]`)

**Files:**
- Create: `components/cinematics/CourseCinematicsMount.tsx`
- Modify: `app/learn/[course]/page.tsx` (monter le composant)

**Interfaces:**
- Consumes: `CinematicPlayer` (Task 3), `useCinematicSeen` (Task 4), `getCinematic`/`cinematicId` (Task 1).
- Produces: `<CourseCinematicsMount course={string} />` — client component autonome (fetch son propre état), monté depuis la page serveur.

- [ ] **Step 1: Écrire le composant de montage**

`components/cinematics/CourseCinematicsMount.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";

import CinematicPlayer from "@/components/cinematics/CinematicPlayer";
import { getCinematic } from "@/lib/cinematics/resolver";
import { cinematicId } from "@/lib/cinematics/types";
import { useCinematicSeen } from "@/lib/cinematics/use-cinematic-seen";

interface CourseCinematicsMountProps {
  course: string;
}

/**
 * Monte les cinématiques de la page cursus : auto-joue l'intro à la première
 * visite (jamais rejouée automatiquement — règle de la spec §5), et offre
 * « Revoir le briefing » en permanence + « Revoir la finale » une fois le
 * cursus terminé (la finale vue prouve la complétion).
 */
export default function CourseCinematicsMount({ course }: CourseCinematicsMountProps) {
  const { loaded, seen, mark } = useCinematicSeen(course);
  const [playing, setPlaying] = useState<"intro" | "finale" | null>(null);
  const [autoChecked, setAutoChecked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const introId = cinematicId(course, { kind: "intro" });
  const finaleId = cinematicId(course, { kind: "finale" });

  // Auto-play de l'intro, une seule décision par montage, jamais si déjà vue.
  useEffect(() => {
    if (!loaded || autoChecked) return;
    setAutoChecked(true);
    if (!seen.has(introId)) setPlaying("intro");
  }, [loaded, autoChecked, seen, introId]);

  const close = () => {
    if (playing) mark(playing === "intro" ? introId : finaleId);
    setPlaying(null);
  };

  return (
    <>
      <div className="relative z-20 flex justify-end gap-3 px-4 pt-2">
        <button
          onClick={() => setPlaying("intro")}
          data-testid="replay-intro"
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          ▶ Revoir le briefing
        </button>
        {seen.has(finaleId) && (
          <button
            onClick={() => setPlaying("finale")}
            data-testid="replay-finale"
            className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ▶ Revoir la finale
          </button>
        )}
      </div>
      <CinematicPlayer
        cinematic={getCinematic(course, playing === "finale" ? { kind: "finale" } : { kind: "intro" })}
        open={playing !== null}
        onClose={close}
        reducedMotion={reducedMotion}
        finalCtaLabel="Lancer la mission ->"
      />
    </>
  );
}
```

- [ ] **Step 2: Monter dans la page serveur**

Dans `app/learn/[course]/page.tsx` (server component `CourseMapPage`) : importer `CourseCinematicsMount` et le rendre en tête du JSX retourné (juste à l'intérieur du conteneur racine), en lui passant le slug du cursus déjà résolu par la page :

```tsx
import CourseCinematicsMount from "@/components/cinematics/CourseCinematicsMount";
// ... dans le JSX retourné :
<CourseCinematicsMount course={course} />
```

(adapter le nom de la variable locale au code existant de la page ; ne rien changer d'autre à la page).

- [ ] **Step 3: Vérification manuelle en dev**

Lancer le serveur de dev via la config de preview du projet, se connecter avec un compte, visiter `/learn/html` :
- l'intro se joue (texte machine à écrire, « Passer » visible) ;
- après « Passer », recharger la page → l'intro ne rejoue pas ;
- « Revoir le briefing » la rejoue.

- [ ] **Step 4: Compilation + lint**

Run: `rtk tsc --noEmit && rtk lint`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
rtk git add components/cinematics/CourseCinematicsMount.tsx "app/learn/[course]/page.tsx" && rtk git commit -m "feat(cinematics): intro de cursus a la premiere visite, rejouable

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Outro de chapitre et finale dans `ChapterClient`

**Files:**
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`

**Interfaces:**
- Consumes: `CinematicPlayer` (Task 3), `useCinematicSeen` (Task 4), `getCinematic`, `isLastChapter`, `cinematicId` (Tasks 1-2).
- Produces: rien de nouveau — modification de flux interne.

Flux actuel (`goNextStep`, ligne ~255) : dernière étape + connecté → `setShowCompletion(true)`. Flux cible : dernière étape + connecté → jouer l'outro (ou la finale si dernier chapitre) **si non vue**, puis `setShowCompletion(true)` à la fermeture. En essai (`isTrial`) : comportement strictement inchangé (scroll vers la carte de conversion, pas de cinématique).

- [ ] **Step 1: Ajouter l'état et le hook**

Dans `ChapterClient`, ajouter aux imports :

```tsx
import CinematicPlayer from "@/components/cinematics/CinematicPlayer";
import { getCinematic, isLastChapter } from "@/lib/cinematics/resolver";
import { cinematicId, type CinematicMoment } from "@/lib/cinematics/types";
import { useCinematicSeen } from "@/lib/cinematics/use-cinematic-seen";
```

et près des autres `useState` (vers la ligne 107) :

```tsx
  // Cinématique de fin de chapitre (ou finale de cursus sur le dernier
  // chapitre). Jouée entre la dernière bannière d'étape et CompletionScreen,
  // une seule fois (règle : une cinématique enregistrée ne se rejoue jamais
  // automatiquement). Jamais montée en essai — cf. CompletionScreen.
  const [showOutroCinematic, setShowOutroCinematic] = useState(false);
  const { loaded: cineLoaded, seen: cineSeen, mark: markCine } = useCinematicSeen(course);
  const outroMoment: CinematicMoment = isLastChapter(course, chapter.slug)
    ? { kind: "finale" }
    : { kind: "chapter", chapter: chapter.slug };
  const outroId = cinematicId(course, outroMoment);
```

- [ ] **Step 2: Modifier `goNextStep`**

Remplacer dans `goNextStep` :

```tsx
      setShowCompletion(true);
      return;
```

par :

```tsx
      // Cinématique d'abord si elle n'a jamais été vue ; si l'état n'est pas
      // chargé (réseau), on ne bloque pas le joueur : complétion directe.
      if (cineLoaded && !cineSeen.has(outroId)) {
        setShowOutroCinematic(true);
        return;
      }
      setShowCompletion(true);
      return;
```

et compléter le tableau de dépendances du `useCallback` avec `cineLoaded`, `cineSeen`, `outroId`.

- [ ] **Step 3: Monter le lecteur**

Dans le JSX, juste avant `<CompletionScreen`, ajouter :

```tsx
      {!isTrial && (
        <CinematicPlayer
          cinematic={getCinematic(course, outroMoment)}
          open={showOutroCinematic}
          onClose={() => {
            markCine(outroId);
            setShowOutroCinematic(false);
            setShowCompletion(true);
          }}
          finalCtaLabel="Rapport de mission ->"
        />
      )}
```

- [ ] **Step 4: Vérification manuelle en dev**

Avec un compte dont le chapitre 1 HTML n'est pas complété (ou via reset), jouer les 3 étapes du chapitre 1 :
- après « TERMINER LE PROTOCOLE », l'outro du chapitre 1 (« FONDATIONS EN LIGNE… ») se joue ;
- « Passer » ou fin → `CompletionScreen` s'affiche comme avant ;
- re-valider la dernière étape du même chapitre → plus de cinématique (déjà vue), complétion directe.

- [ ] **Step 5: Compilation + lint + suite**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run`
Expected: tout vert.

- [ ] **Step 6: Commit**

```bash
rtk git add "app/learn/[course]/[chapter]/ChapterClient.tsx" && rtk git commit -m "feat(cinematics): outro de chapitre et finale de cursus avant l'ecran de completion

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: E2E et adaptation des parcours existants

**Files:**
- Create: `e2e/cinematics.spec.ts`
- Modify: `e2e/html-parcours.spec.ts` (l'outro s'intercale avant `COMPLÉTÉE`)
- Modify: `e2e/boucle-quotidienne.spec.ts` si (et seulement si) il complète un chapitre en étant connecté — vérifier avec `rtk grep "TERMINER LE PROTOCOLE" e2e/`

**Interfaces:**
- Consumes: `E2E_USER` et le patron `login(page)` de `e2e/html-parcours.spec.ts` ; `data-testid` `cinematic-player`, `cinematic-skip`, `replay-intro` (Tasks 3 et 5).

- [ ] **Step 1: Adapter le parcours HTML existant**

Dans `e2e/html-parcours.spec.ts`, la branche `if (isLast)` du test « chapitre 1 » devient :

```ts
    if (isLast) {
      // L'outro de chapitre s'intercale avant l'écran de complétion —
      // sauf si l'utilisateur E2E l'a déjà vue sur un run précédent.
      const skip = page.getByTestId("cinematic-skip");
      if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await skip.click();
      }
      await expect(page.getByText(/COMPLÉTÉE/)).toBeVisible({ timeout: 10_000 });
    } else {
```

- [ ] **Step 2: Vérifier les autres specs qui complètent un chapitre**

Run: `rtk grep -l "TERMINER LE PROTOCOLE" e2e/`
Pour chaque fichier trouvé autre que `html-parcours.spec.ts` : si le test est connecté (pas en mode essai) et attend un élément post-complétion, appliquer le même patron « skip si visible ». Les specs en mode essai (`trial.spec.ts`) ne changent pas — pas de cinématique en essai.

- [ ] **Step 3: Écrire le nouveau spec**

`e2e/cinematics.spec.ts` :

```ts
import { test, expect, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("intro de cursus : rejouable via le bouton, jamais deux auto-play", async ({
  page,
}) => {
  await login(page);
  await page.goto("/learn/html");

  const player = page.getByTestId("cinematic-player");
  // Premier passage possible (utilisateur E2E neuf) : on skip si présente.
  const skip = page.getByTestId("cinematic-skip");
  if (await skip.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await skip.click();
  }
  await expect(player).toHaveCount(0);

  // Rechargement : plus jamais d'auto-play.
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(player).toHaveCount(0);

  // Relecture volontaire : le lecteur s'ouvre avec la narration de l'arc HTML.
  await page.getByTestId("replay-intro").click();
  await expect(player).toBeVisible();
  await expect(player.getByText(/Selene/).first()).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(player).toHaveCount(0);
});
```

- [ ] **Step 4: Lancer les e2e concernés**

Run: `rtk playwright test e2e/cinematics.spec.ts e2e/html-parcours.spec.ts`
Expected: PASS. (La garde e2e-db existante s'applique — ne pas la contourner.)

- [ ] **Step 5: Suite complète de vérification finale**

Run: `rtk tsc --noEmit && rtk lint && rtk vitest run && rtk playwright test`
Expected: tout vert.

- [ ] **Step 6: Commit**

```bash
rtk git add e2e && rtk git commit -m "test(e2e): parcours des cinematiques et adaptation des specs de completion

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
