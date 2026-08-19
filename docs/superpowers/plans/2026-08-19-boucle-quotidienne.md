# Boucle quotidienne — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le bouton « mission du jour à 50 XP » par une boucle quotidienne complète — briefing de trois ordres ciblés, liaison (streak) à enjeu, et plus de 70 déblocables de personnalisation — afin de donner au cadet une raison d'ouvrir l'onglet demain.

**Architecture:** Toute la décision est en fonctions pures dans `lib/` (tirage des quêtes, machine à états de la liaison, conditions de déblocage, grades), testées sous vitest sans base ni navigateur. Le serveur (`lib/me-server.ts`) appelle ces fonctions avec les lignes Prisma et verse XP, badges et déblocables dans la transaction qui enregistre déjà la complétion d'étape. Le client ne calcule **rien** : il reçoit un objet `briefing` et un objet `liaison` déjà résolus dans la charge utile `/api/me` et se contente de les rendre.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma 7 / PostgreSQL, Auth.js v5, Vitest 4, Playwright 1.61, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-08-19-boucle-quotidienne-design.md`

## Global Constraints

- **Branche de travail :** `feat/boucle-quotidienne` (déjà créée, la spec y est commitée).
- **`.env` pointe sur la base de production.** `prisma migrate dev` seul est **interdit**. Procédure obligatoire : `pnpm prisma migrate dev --create-only`, relecture du SQL, puis `pnpm prisma migrate deploy`.
- **Journée de référence : minuit UTC.** Toute date est une chaîne `yyyy-mm-dd` obtenue par `new Date().toISOString().slice(0, 10)`. Convention déjà en vigueur (`lastVisit`, `lastDailyMission`).
- **Aucune fonction pure ne lit l'horloge.** Le jour courant est toujours un paramètre `todayIso: string`, comme dans `lib/daily-mission.ts`.
- **L'XP n'est jamais calculée côté client.** Le serveur recompte depuis `StepCompletion`.
- **XP du briefing :** reprise 10, effort 20, curiosité 15, clôture 15 — **60 XP par jour maximum**. Ne pas augmenter : au-delà, on paie deux fois les mêmes étapes.
- **Le streak ne donne jamais d'XP.** Il paie en déblocables et en relais de secours.
- **La liaison avance sur la première ÉTAPE validée du jour**, jamais à la simple
  visite — et non sur le premier ordre accompli. Un ordre peut demander
  plusieurs étapes ; un cadet qui n'en boucle qu'une un jour chargé a travaillé
  quand même, et lui rompre sa série serait punir son effort. *(Arbitrage du
  contrôleur en T7 : le concept « le streak compte les journées de travail »
  prime sur le mécanisme « au moins une quête validée » que la spec énonçait.)*
- **Plafond de relais : 2.** Relais offert au 3ᵉ jour, puis un tous les 7 jours.
- **Grades :** Cadet 0 · Aspirant 400 · Enseigne 1 200 · Lieutenant 2 500 · Commandant 4 500 · Capitaine 7 000 · Amiral 10 000.
- **Niveau :** `floor(sqrt(xp / 16)) + 1`.
- **Cursus complet = 9 312 XP**, 51 chapitres, 192 étapes.
- **Ne pas toucher au tableau `BADGES`** de `lib/badges-catalog.ts` : sa position d'index est la frame dans `badges.png`. Les badges de conduite vivent dans un catalogue séparé.
- **Aucune image neuve.** Tous les déblocables sont CSS, texte, ou réutilisent `public/planet-*.png` et `public/sprites/badges.png`.
- Commandes de vérification : `pnpm exec vitest run`, `pnpm exec tsc --noEmit`, `pnpm exec eslint`, `pnpm exec playwright test`.

---

## Structure des fichiers

**Créés — logique pure (aucune dépendance base ou React) :**

| Fichier | Responsabilité |
|---|---|
| `lib/grades.ts` | Seuils de grade, courbe de niveau |
| `lib/streak.ts` | Machine à états de la liaison |
| `lib/quests.ts` | Archétypes, faisabilité, tirage déterministe, progression |
| `lib/conduct-badges.ts` | Catalogue et évaluation des badges de conduite |
| `lib/unlocks.ts` | Catalogue et évaluation des déblocables cosmétiques |

**Créés — interface :**

| Fichier | Responsabilité |
|---|---|
| `components/dashboard/BriefingCard.tsx` | La grande carte : ordre d'effort + reprise de mission fusionnés |
| `components/dashboard/QuestLine.tsx` | Une ligne d'ordre compacte (reprise, curiosité) |
| `components/dashboard/LiaisonBanner.tsx` | Bandeau de liaison : compteur, 7 points, échéance |
| `components/dashboard/CadetCard.tsx` | Remplace `StatsCard` : avatar paré, grade, prochain déblocable |
| `components/avatar/UnlockShelf.tsx` | L'armurerie : obtenus et verrouillés côte à côte |
| `app/api/me/cosmetics/route.ts` | POST des choix cosmétiques |

**Modifiés :**

| Fichier | Nature |
|---|---|
| `prisma/schema.prisma` | 10 colonnes sur `User`, table `UserUnlock`, index sur `StepCompletion` |
| `lib/user-store.ts` | `UserState` s'étend ; `levelFromXp` / `rankFromXp` retirés au profit de `lib/grades.ts` |
| `lib/me-server.ts` | Sélection élargie, calcul du briefing, versement dans `completeStep` |
| `lib/use-user.ts` | `setCosmetics` ajouté |
| `app/api/me/daily/route.ts` | Supprimé (le bouton disparaît) |
| `app/dashboard/page.tsx` | Réorganisation autour du briefing |
| `app/StatsCard.tsx` | Supprimé, remplacé par `CadetCard` |
| `app/profil/page.tsx`, `app/leaderboard/page.tsx`, `app/learn/[course]/[chapter]/ChapterClient.tsx` | Imports de `levelFromXp` / `rankFromXp` redirigés |
| `components/ui/XPBar.tsx` | Niveau réel au lieu de « LVL 1 » |
| `components/ui/CompletionScreen.tsx` | Annonce des ordres accomplis |
| `components/dashboard/DailyMission.tsx` | Supprimé |
| `lib/daily-mission.ts` + son test | Supprimés |

---

### Task 1 : Schéma et migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_boucle_quotidienne/migration.sql` (généré)

**Interfaces:**
- Consumes: rien
- Produces: les colonnes `User.bestStreak`, `User.streakShields`, `User.shieldEverGranted`, `User.questsCompleted`, `User.perfectBriefingRun`, `User.lastPerfectDay`, `User.dailyClaimed`, `User.frame`, `User.title`, `User.emblem`, `User.cardBg` ; le modèle `UserUnlock` ; l'index `StepCompletion(userId, completedAt)`.

- [ ] **Step 1 : Ajouter les colonnes sur `User`**

Dans `prisma/schema.prisma`, sous le bloc « App-specific fields » du modèle `User`, après `onboardedAt` :

```prisma
  // --- Boucle quotidienne -------------------------------------------------
  bestStreak        Int     @default(1) // record permanent de liaison
  streakShields     Int     @default(0) // relais de secours détenus (max 2)
  shieldEverGranted Boolean @default(false) // le relais offert du 3e jour n'est donné qu'une fois
  questsCompleted   Int     @default(0) // total d'ordres validés (badges de conduite)
  perfectBriefingRun Int    @default(0) // briefings complets d'affilée
  lastPerfectDay    String  @default("") // ISO date du dernier briefing complet
  dailyClaimed      Int     @default(0) // masque de bits : 0-2 = les 3 ordres, 3 = clôture

  // Cosmétiques déblocables (null = valeur par défaut du catalogue)
  frame  String?
  title  String?
  emblem String?
  cardBg String?
```

Corriger aussi le commentaire de `lastVisit`, qui change de sens :

```prisma
  lastVisit         String    @default("") // ISO date (yyyy-mm-dd) du dernier jour ACTIF (travail réel, pas visite)
```

- [ ] **Step 2 : Déclarer la relation et le modèle `UserUnlock`**

Dans le bloc de relations du modèle `User`, après `badges          UserBadge[]` :

```prisma
  unlocks         UserUnlock[]
```

Puis, après le modèle `UserBadge` :

```prisma
model UserUnlock {
  id         String   @id @default(cuid())
  userId     String
  itemId     String
  unlockedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, itemId])
}
```

- [ ] **Step 3 : Ajouter l'index sur `StepCompletion`**

Dans le modèle `StepCompletion`, sous la contrainte d'unicité existante :

```prisma
  @@unique([userId, course, chapter, stepIndex])
  @@index([userId, completedAt])
```

- [ ] **Step 4 : Valider le schéma**

Run: `pnpm exec prisma validate`
Expected: `The schema at prisma/schema.prisma is valid`

- [ ] **Step 5 : Générer la migration SANS l'appliquer**

Run: `pnpm exec prisma migrate dev --create-only --name boucle_quotidienne`
Expected: un dossier `prisma/migrations/<timestamp>_boucle_quotidienne/` contenant `migration.sql`.

**ATTENTION : ne jamais lancer `prisma migrate dev` sans `--create-only` sur ce dépôt.** `DATABASE_URL` pointe sur la base de production.

- [ ] **Step 6 : Ajouter l'initialisation de `bestStreak` au SQL généré**

Ouvrir le `migration.sql` généré et ajouter à la fin :

```sql
-- Les comptes existants ne doivent pas perdre leur historique de streak :
-- leur record de départ est leur streak courant.
UPDATE "User" SET "bestStreak" = "streak" WHERE "streak" > 1;
```

- [ ] **Step 7 : Régénérer le client Prisma et vérifier les types**

Run: `pnpm exec prisma generate && pnpm exec tsc --noEmit`
Expected: aucune erreur. Le client généré (`lib/generated/prisma`) expose les nouveaux champs.

- [ ] **Step 8 : Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/generated
git commit -m "feat(db): les colonnes de la boucle quotidienne, migration non appliquee

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2 : `lib/grades.ts` — grades et courbe de niveau

**Files:**
- Create: `lib/grades.ts`
- Test: `lib/grades.test.ts`
- Modify: `lib/user-store.ts` (retirer `levelFromXp` et `rankFromXp`)
- Modify: `app/dashboard/page.tsx:22-23,76-77`, `app/profil/page.tsx:16-17,77-78`, `app/leaderboard/page.tsx:8,109-110`, `app/learn/[course]/[chapter]/ChapterClient.tsx:20,113,160`

**Interfaces:**
- Consumes: rien
- Produces:
  - `interface Grade { id: string; label: string; threshold: number }`
  - `GRADES: Grade[]`
  - `gradeFromXp(xp: number): Grade`
  - `nextGrade(xp: number): Grade | null`
  - `xpIntoGrade(xp: number): { current: number; span: number }`
  - `levelFromXp(xp: number): number`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/grades.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import {
  GRADES,
  gradeFromXp,
  levelFromXp,
  nextGrade,
  xpIntoGrade,
} from "./grades";

describe("gradeFromXp", () => {
  it("démarre au grade Cadet", () => {
    expect(gradeFromXp(0).id).toBe("cadet");
    expect(gradeFromXp(399).id).toBe("cadet");
  });

  it("passe Aspirant au seuil exact", () => {
    expect(gradeFromXp(400).id).toBe("aspirant");
  });

  it("continue à progresser au-delà de 1000 XP, contrairement à l'ancien rang Or", () => {
    expect(gradeFromXp(1000).id).toBe("aspirant");
    expect(gradeFromXp(2500).id).toBe("lieutenant");
    expect(gradeFromXp(7000).id).toBe("capitaine");
  });

  it("atteint Amiral seulement au-delà des 9312 XP du cursus", () => {
    expect(gradeFromXp(9312).id).not.toBe("amiral");
    expect(gradeFromXp(10000).id).toBe("amiral");
  });
});

describe("nextGrade", () => {
  it("annonce le grade suivant", () => {
    expect(nextGrade(0)?.id).toBe("aspirant");
  });

  it("retourne null au dernier grade", () => {
    expect(nextGrade(10000)).toBeNull();
  });
});

describe("xpIntoGrade", () => {
  it("mesure l'avancée dans le grade courant", () => {
    expect(xpIntoGrade(600)).toEqual({ current: 200, span: 800 });
  });

  it("rend une barre pleine au dernier grade", () => {
    const { current, span } = xpIntoGrade(12000);
    expect(current).toBe(span);
  });
});

describe("levelFromXp", () => {
  it("démarre au niveau 1", () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it("monte vite au début", () => {
    expect(levelFromXp(16)).toBe(2);
    expect(levelFromXp(64)).toBe(3);
  });

  it("plafonne à 25 au bout du cursus, pas à 94", () => {
    expect(levelFromXp(9312)).toBe(25);
  });

  it("ne recule jamais quand l'XP monte", () => {
    let prev = 0;
    for (let xp = 0; xp <= 12000; xp += 137) {
      const lvl = levelFromXp(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});

describe("GRADES", () => {
  it("est trié par seuil croissant", () => {
    const seuils = GRADES.map((g) => g.threshold);
    expect([...seuils].sort((a, b) => a - b)).toEqual(seuils);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec vitest run lib/grades.test.ts`
Expected: FAIL — `Failed to resolve import "./grades"`

- [ ] **Step 3 : Écrire l'implémentation minimale**

Créer `lib/grades.ts` :

```ts
/**
 * Échelle de progression de la Coalition. Remplace l'ancien couple
 * levelFromXp / rankFromXp de lib/user-store.ts, qui plafonnait à « Or » dès
 * 1 000 XP (11 % du parcours) et menait au niveau 94 en fin de cursus.
 *
 * Les seuils sont calibrés sur les 9 312 XP réels du cursus complet
 * (51 chapitres, 192 étapes, mesurés sur data/courses/). Amiral est
 * volontairement placé au-dessus : le dernier grade demande d'avoir tout
 * terminé ET d'avoir été régulier.
 */

export interface Grade {
  id: string;
  label: string;
  threshold: number;
}

export const GRADES: Grade[] = [
  { id: "cadet", label: "Cadet", threshold: 0 },
  { id: "aspirant", label: "Aspirant", threshold: 400 },
  { id: "enseigne", label: "Enseigne", threshold: 1200 },
  { id: "lieutenant", label: "Lieutenant", threshold: 2500 },
  { id: "commandant", label: "Commandant", threshold: 4500 },
  { id: "capitaine", label: "Capitaine", threshold: 7000 },
  { id: "amiral", label: "Amiral", threshold: 10000 },
];

/** Grade courant pour un total d'XP. Jamais null : Cadet est à 0. */
export function gradeFromXp(xp: number): Grade {
  let found = GRADES[0];
  for (const g of GRADES) {
    if (xp >= g.threshold) found = g;
    else break;
  }
  return found;
}

/** Grade suivant, ou null si le cadet est au sommet. */
export function nextGrade(xp: number): Grade | null {
  return GRADES.find((g) => g.threshold > xp) ?? null;
}

/**
 * Avancée dans le grade courant, pour une barre de progression.
 * Au dernier grade, current === span (barre pleine).
 */
export function xpIntoGrade(xp: number): { current: number; span: number } {
  const grade = gradeFromXp(xp);
  const next = nextGrade(xp);
  if (!next) return { current: 1, span: 1 };
  return { current: xp - grade.threshold, span: next.threshold - grade.threshold };
}

/**
 * Niveau chiffré, courbé. Monte vite au début, ralentit ensuite, culmine à 25
 * au bout du cursus. L'ancienne formule linéaire (xp/100 + 1) menait à 94.
 */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 16)) + 1;
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec vitest run lib/grades.test.ts`
Expected: PASS — 12 tests

- [ ] **Step 5 : Retirer les anciennes fonctions de `lib/user-store.ts`**

Supprimer ces deux blocs (`lib/user-store.ts:45-55`) :

```ts
/** Compute level from XP (every 100 XP = 1 level) */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/** Compute rank label from XP */
export function rankFromXp(xp: number): string {
  if (xp >= 1000) return "Or";
  if (xp >= 500) return "Argent";
  return "Bronze";
}
```

- [ ] **Step 6 : Rediriger les quatre sites d'appel**

`app/dashboard/page.tsx` — retirer `levelFromXp` et `rankFromXp` de l'import `@/lib/user-store`, ajouter :

```ts
import { gradeFromXp, levelFromXp } from "@/lib/grades";
```

et remplacer les lignes 76-77 :

```ts
  const level = levelFromXp(totalXp);
  const rank = gradeFromXp(totalXp).label;
```

Appliquer exactement le même remplacement dans `app/profil/page.tsx` (lignes 16-17 et 77-78) et `app/leaderboard/page.tsx` (lignes 8 et 109-110).

Dans `app/learn/[course]/[chapter]/ChapterClient.tsx`, seul `levelFromXp` est utilisé — ligne 20, le retirer de l'import `@/lib/user-store` et ajouter :

```ts
import { levelFromXp } from "@/lib/grades";
```

- [ ] **Step 7 : Vérifier types et suite complète**

Run: `pnpm exec tsc --noEmit && pnpm exec vitest run`
Expected: PASS, aucune erreur de type.

- [ ] **Step 8 : Commit**

```bash
git add lib/grades.ts lib/grades.test.ts lib/user-store.ts app/dashboard/page.tsx app/profil/page.tsx app/leaderboard/page.tsx "app/learn/[course]/[chapter]/ChapterClient.tsx"
git commit -m "feat(grades): le rang ne meurt plus a 1000 XP

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3 : `lib/streak.ts` — la machine à états de la liaison

**Files:**
- Create: `lib/streak.ts`
- Test: `lib/streak.test.ts`

**Interfaces:**
- Consumes: rien
- Produces:
  - `MAX_SHIELDS = 2`
  - `interface LiaisonState { streak: number; bestStreak: number; shields: number; shieldEverGranted: boolean; lastActiveDay: string }`
  - `interface LiaisonTransition { next: LiaisonState; changed: boolean; shieldsConsumed: number; broken: boolean; earnedReturn: boolean; shieldEarned: boolean }`
  - `daysBetweenIso(fromIso: string, toIso: string): number`
  - `advanceLiaison(current: LiaisonState, todayIso: string): LiaisonTransition`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/streak.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { advanceLiaison, daysBetweenIso, MAX_SHIELDS, type LiaisonState } from "./streak";

function etat(p: Partial<LiaisonState> = {}): LiaisonState {
  return {
    streak: 1,
    bestStreak: 1,
    shields: 0,
    shieldEverGranted: false,
    lastActiveDay: "2026-08-18",
    ...p,
  };
}

describe("daysBetweenIso", () => {
  it("compte les jours entre deux dates ISO", () => {
    expect(daysBetweenIso("2026-08-18", "2026-08-19")).toBe(1);
    expect(daysBetweenIso("2026-08-01", "2026-08-19")).toBe(18);
  });
});

describe("advanceLiaison", () => {
  it("ne fait rien si le jour est déjà compté", () => {
    const t = advanceLiaison(etat({ streak: 5, lastActiveDay: "2026-08-19" }), "2026-08-19");
    expect(t.changed).toBe(false);
    expect(t.next.streak).toBe(5);
  });

  it("incrémente au lendemain", () => {
    const t = advanceLiaison(etat({ streak: 5 }), "2026-08-19");
    expect(t.next.streak).toBe(6);
    expect(t.broken).toBe(false);
  });

  it("démarre à 1 pour un cadet jamais actif", () => {
    const t = advanceLiaison(etat({ lastActiveDay: "", streak: 1 }), "2026-08-19");
    expect(t.next.streak).toBe(1);
    expect(t.next.lastActiveDay).toBe("2026-08-19");
  });

  it("consomme un relais pour couvrir un jour manqué", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 1, lastActiveDay: "2026-08-17" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(1);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
    expect(t.broken).toBe(false);
  });

  it("consomme deux relais pour couvrir deux jours manqués", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 2, lastActiveDay: "2026-08-16" }),
      "2026-08-19"
    );
    expect(t.shieldsConsumed).toBe(2);
    expect(t.next.shields).toBe(0);
    expect(t.next.streak).toBe(10);
  });

  it("rompt la liaison quand les relais ne suffisent pas", () => {
    const t = advanceLiaison(
      etat({ streak: 9, shields: 1, lastActiveDay: "2026-08-10" }),
      "2026-08-19"
    );
    expect(t.broken).toBe(true);
    expect(t.next.streak).toBe(1);
    expect(t.shieldsConsumed).toBe(0);
    expect(t.next.shields).toBe(1);
  });

  it("conserve le record quand la liaison est rompue", () => {
    const t = advanceLiaison(
      etat({ streak: 20, bestStreak: 20, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(1);
    expect(t.next.bestStreak).toBe(20);
  });

  it("attribue Le Retour seulement si la série rompue valait 7 jours ou plus", () => {
    const gros = advanceLiaison(
      etat({ streak: 7, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(gros.earnedReturn).toBe(true);

    const petit = advanceLiaison(
      etat({ streak: 6, lastActiveDay: "2026-08-01" }),
      "2026-08-19"
    );
    expect(petit.earnedReturn).toBe(false);
  });

  it("offre le premier relais au 3e jour, une seule fois", () => {
    const t = advanceLiaison(etat({ streak: 2 }), "2026-08-19");
    expect(t.next.streak).toBe(3);
    expect(t.next.shields).toBe(1);
    expect(t.next.shieldEverGranted).toBe(true);

    const rejoue = advanceLiaison(
      etat({ streak: 2, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(rejoue.next.shields).toBe(0);
  });

  it("donne un relais tous les 7 jours", () => {
    const t = advanceLiaison(
      etat({ streak: 6, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(7);
    expect(t.shieldEarned).toBe(true);
    expect(t.next.shields).toBe(1);
  });

  it("ne dépasse jamais le plafond de relais", () => {
    const t = advanceLiaison(
      etat({ streak: 13, shields: MAX_SHIELDS, shieldEverGranted: true }),
      "2026-08-19"
    );
    expect(t.next.streak).toBe(14);
    expect(t.next.shields).toBe(MAX_SHIELDS);
  });

  it("met à jour le record quand la série dépasse l'ancien", () => {
    const t = advanceLiaison(etat({ streak: 9, bestStreak: 9 }), "2026-08-19");
    expect(t.next.bestStreak).toBe(10);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec vitest run lib/streak.test.ts`
Expected: FAIL — `Failed to resolve import "./streak"`

- [ ] **Step 3 : Écrire l'implémentation minimale**

Créer `lib/streak.ts` :

```ts
/**
 * La liaison — le streak, devenu objet de jeu.
 *
 * Deux différences avec l'ancien compteur de lib/me-server.ts :
 *  - elle n'avance QUE sur travail réel (première ÉTAPE validée du jour),
 *    plus à la simple ouverture d'un onglet ;
 *  - un jour manqué ne la rompt pas si le cadet détient un relais de secours.
 *
 * Fonction pure : le jour courant est un paramètre, jamais l'horloge.
 */

/** Plafond de relais détenus. Au-delà, l'absence n'aurait plus aucun coût. */
export const MAX_SHIELDS = 2;

/** Série rompue à partir de laquelle le badge « Le Retour » est mérité. */
const RETURN_THRESHOLD = 7;

/** Jour de liaison auquel le premier relais est offert. */
const FIRST_SHIELD_AT = 3;

export interface LiaisonState {
  streak: number;
  bestStreak: number;
  shields: number;
  shieldEverGranted: boolean;
  /** ISO yyyy-mm-dd du dernier jour actif ; "" si jamais actif. */
  lastActiveDay: string;
}

export interface LiaisonTransition {
  next: LiaisonState;
  /** Faux quand la journée était déjà comptée (rien à écrire en base). */
  changed: boolean;
  shieldsConsumed: number;
  broken: boolean;
  /** Rupture d'une série d'au moins 7 jours → badge « Le Retour ». */
  earnedReturn: boolean;
  shieldEarned: boolean;
}

/** Nombre de jours calendaires entre deux dates ISO yyyy-mm-dd. */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/**
 * Fait avancer la liaison. À appeler au moment où le cadet valide sa première
 * ÉTAPE de la journée — jamais à la simple visite.
 *
 * Le déclencheur est l'étape et non l'ordre accompli : un ordre peut demander
 * plusieurs étapes, et un cadet qui n'en boucle qu'une un jour chargé a
 * travaillé quand même. Cette fonction n'en sait rien — sa machine à états est
 * inchangée, seul son appelant choisit le déclencheur.
 */
export function advanceLiaison(
  current: LiaisonState,
  todayIso: string
): LiaisonTransition {
  const inchange: LiaisonTransition = {
    next: current,
    changed: false,
    shieldsConsumed: 0,
    broken: false,
    earnedReturn: false,
    shieldEarned: false,
  };

  if (!todayIso) return inchange;
  if (current.lastActiveDay === todayIso) return inchange;

  let streak: number;
  let shields = current.shields;
  let shieldsConsumed = 0;
  let broken = false;
  let earnedReturn = false;

  if (!current.lastActiveDay) {
    streak = 1;
  } else {
    const gap = daysBetweenIso(current.lastActiveDay, todayIso);
    if (gap <= 0) return inchange; // horloge incohérente : ne rien casser
    if (gap === 1) {
      streak = current.streak + 1;
    } else {
      const manques = gap - 1;
      if (manques <= shields) {
        shields -= manques;
        shieldsConsumed = manques;
        streak = current.streak + 1;
      } else {
        broken = true;
        earnedReturn = current.streak >= RETURN_THRESHOLD;
        streak = 1;
      }
    }
  }

  // Relais offert au 3e jour, une seule fois dans la vie du compte.
  let shieldEverGranted = current.shieldEverGranted;
  let shieldEarned = false;
  if (streak === FIRST_SHIELD_AT && !shieldEverGranted) {
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEverGranted = true;
    shieldEarned = true;
  } else if (streak > 0 && streak % 7 === 0) {
    const avant = shields;
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEarned = shields > avant;
  }

  return {
    next: {
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      shields,
      shieldEverGranted,
      lastActiveDay: todayIso,
    },
    changed: true,
    shieldsConsumed,
    broken,
    earnedReturn,
    shieldEarned,
  };
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec vitest run lib/streak.test.ts`
Expected: PASS — 14 tests

- [ ] **Step 5 : Commit**

```bash
git add lib/streak.ts lib/streak.test.ts
git commit -m "feat(liaison): un jour manque ne rompt plus tout

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4 : `lib/quests.ts` — archétypes, faisabilité, tirage

**Files:**
- Create: `lib/quests.ts`
- Test: `lib/quests.test.ts`

**Interfaces:**
- Consumes: `ChapterMeta` de `lib/user-store.ts`
- Produces:
  - `QUEST_XP: Record<QuestSlot, number>`, `CLOSING_XP: number`
  - `type QuestSlot = "reprise" | "effort" | "curiosite"`
  - `interface CompletionRecord { course: string; chapter: string; stepIndex: number; completedAt: string }`
  - `interface QuestContext { userId: string; todayIso: string; past: CompletionRecord[]; today: CompletionRecord[]; chaptersByCourse: Record<string, ChapterMeta[]> }`
  - `interface Quest { id: string; slot: QuestSlot; label: string; progress: number; target: number; done: boolean; course: string | null; chapter: string | null; xp: number }`
  - `interface Briefing { dateIso: string; quests: Quest[]; complete: boolean }`
  - `buildBriefing(ctx: QuestContext): Briefing`
  - `splitCompletions(all: CompletionRecord[], todayIso: string): { past: CompletionRecord[]; today: CompletionRecord[] }`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/quests.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import {
  buildBriefing,
  splitCompletions,
  CLOSING_XP,
  QUEST_XP,
  type CompletionRecord,
  type QuestContext,
} from "./quests";

const CHAPITRES = {
  html: [
    { slug: "chapitre-1", totalSteps: 4 },
    { slug: "chapitre-2", totalSteps: 4 },
  ],
  css: [{ slug: "chapitre-1", totalSteps: 4 }],
  javascript: [{ slug: "chapitre-1", totalSteps: 4 }],
};

function step(
  course: string,
  chapter: string,
  stepIndex: number,
  jour: string
): CompletionRecord {
  return { course, chapter, stepIndex, completedAt: `${jour}T10:00:00.000Z` };
}

function ctx(p: Partial<QuestContext> = {}): QuestContext {
  return {
    userId: "cadet-1",
    todayIso: "2026-08-19",
    past: [],
    today: [],
    chaptersByCourse: CHAPITRES,
    ...p,
  };
}

describe("splitCompletions", () => {
  it("sépare le passé strict du jour courant", () => {
    const all = [
      step("html", "chapitre-1", 0, "2026-08-18"),
      step("html", "chapitre-1", 1, "2026-08-19"),
    ];
    const { past, today } = splitCompletions(all, "2026-08-19");
    expect(past).toHaveLength(1);
    expect(today).toHaveLength(1);
    expect(today[0].stepIndex).toBe(1);
  });
});

/**
 * Passé « riche » : chaque emplacement a plusieurs archétypes faisables, donc
 * le tirage a réellement de quoi varier. Avec un passé vide, l'emplacement
 * effort n'aurait qu'un seul candidat et les tests de variété seraient vrais
 * par accident.
 *   - html/chapitre-1 à 3/4  → boucler-chapitre faisable (≥ 50 %)
 *   - html/chapitre-2 à 1/4  → serie-chapitre faisable (≥ 3 restantes)
 *   - css touché le 2026-08-01 → cursus-dormant faisable (≥ 7 jours)
 *   - javascript jamais touché → premiere-fois faisable
 *   - 2 cursus touchés        → second-front faisable
 */
const PASSE_RICHE: CompletionRecord[] = [
  step("html", "chapitre-1", 0, "2026-08-18"),
  step("html", "chapitre-1", 1, "2026-08-18"),
  step("html", "chapitre-1", 2, "2026-08-18"),
  step("html", "chapitre-2", 0, "2026-08-18"),
  step("css", "chapitre-1", 0, "2026-08-01"),
];

describe("buildBriefing — déterminisme", () => {
  it("rend le même briefing pour le même cadet le même jour", () => {
    const a = buildBriefing(ctx({ past: PASSE_RICHE }));
    const b = buildBriefing(ctx({ past: PASSE_RICHE }));
    expect(a.quests.map((q) => q.id)).toEqual(b.quests.map((q) => q.id));
  });

  it("rend un briefing différent d'un jour à l'autre", () => {
    const jours = [
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
    ];
    const ids = jours.map((j) =>
      buildBriefing(ctx({ past: PASSE_RICHE, todayIso: j }))
        .quests.map((q) => q.id)
        .join("|")
    );
    expect(new Set(ids).size).toBeGreaterThan(1);
  });

  it("rend un briefing différent d'un cadet à l'autre", () => {
    const ids = ["cadet-1", "cadet-2", "cadet-3", "cadet-4"].map((u) =>
      buildBriefing(ctx({ past: PASSE_RICHE, userId: u }))
        .quests.map((q) => q.id)
        .join("|")
    );
    expect(new Set(ids).size).toBeGreaterThan(1);
  });
});

describe("buildBriefing — le piège de la faisabilité", () => {
  it("ne change pas le tirage quand le cadet travaille dans la journée", () => {
    const past = [
      step("html", "chapitre-1", 0, "2026-08-01"),
      step("html", "chapitre-1", 1, "2026-08-01"),
      step("html", "chapitre-1", 2, "2026-08-01"),
    ];
    const avant = buildBriefing(ctx({ past }));
    const apres = buildBriefing(
      ctx({ past, today: [step("html", "chapitre-1", 3, "2026-08-19")] })
    );
    expect(apres.quests.map((q) => q.id)).toEqual(avant.quests.map((q) => q.id));
  });
});

describe("buildBriefing — progression", () => {
  it("compte les étapes du jour pour l'ordre de reprise", () => {
    const b = buildBriefing(
      ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] })
    );
    const reprise = b.quests.find((q) => q.slot === "reprise");
    expect(reprise?.progress).toBe(1);
  });

  it("ne compte jamais les étapes d'hier", () => {
    const b = buildBriefing(
      ctx({ past: [step("html", "chapitre-1", 0, "2026-08-18")] })
    );
    const reprise = b.quests.find((q) => q.slot === "reprise");
    expect(reprise?.progress).toBe(0);
  });

  it("marque le briefing complet quand tous les ordres sont atteints", () => {
    // Passé vide → reprise (1 ou 2 étapes), effort (5 étapes), curiosité
    // (ouvrir le premier cursus vierge par ordre alphabétique : css).
    const today = [
      ...Array.from({ length: 6 }, (_, i) => step("html", "chapitre-1", i % 4, "2026-08-19")),
      ...Array.from({ length: 6 }, (_, i) => step("css", "chapitre-1", i % 4, "2026-08-19")),
    ];
    const b = buildBriefing(ctx({ today }));
    expect(b.quests.every((q) => q.done)).toBe(true);
    expect(b.complete).toBe(true);
  });

  it("n'est pas complet tant qu'un ordre manque", () => {
    const b = buildBriefing(ctx({ today: [step("html", "chapitre-1", 0, "2026-08-19")] }));
    expect(b.complete).toBe(false);
  });
});

describe("buildBriefing — faisabilité", () => {
  it("émet au plus un ordre par emplacement", () => {
    const b = buildBriefing(ctx());
    const slots = b.quests.map((q) => q.slot);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("donne un briefing complet dès le premier jour", () => {
    const b = buildBriefing(ctx());
    expect(b.quests.length).toBe(3);
  });

  it("ne propose jamais de boucler un chapitre déjà bouclé", () => {
    const past = [0, 1, 2, 3].map((i) => step("html", "chapitre-1", i, "2026-08-01"));
    for (const jour of ["2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"]) {
      const b = buildBriefing(ctx({ past, todayIso: jour }));
      const boucle = b.quests.find((q) => q.id === "boucler-chapitre");
      if (boucle) {
        expect(`${boucle.course}/${boucle.chapter}`).not.toBe("html/chapitre-1");
      }
    }
  });

  it("ne propose pas d'ouvrir un cursus quand tous sont entamés", () => {
    const past = ["html", "css", "javascript"].map((c) =>
      step(c, "chapitre-1", 0, "2026-08-01")
    );
    for (const jour of ["2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22"]) {
      const b = buildBriefing(ctx({ past, todayIso: jour }));
      expect(b.quests.some((q) => q.id === "premiere-fois")).toBe(false);
    }
  });

  it("émet moins de trois ordres quand un emplacement n'a rien de faisable", () => {
    // Un seul cursus, déjà entamé hier : aucun archétype de curiosité ne tient.
    // second-front veut 2 cursus, cursus-dormant veut 7 jours d'oubli,
    // premiere-fois veut un cursus vierge.
    const b = buildBriefing(
      ctx({
        chaptersByCourse: { html: CHAPITRES.html },
        past: [step("html", "chapitre-1", 0, "2026-08-18")],
      })
    );
    expect(b.quests.some((q) => q.slot === "curiosite")).toBe(false);
    expect(b.quests).toHaveLength(2);
  });
});

describe("barème", () => {
  it("plafonne la journée à 60 XP", () => {
    const total = QUEST_XP.reprise + QUEST_XP.effort + QUEST_XP.curiosite + CLOSING_XP;
    expect(total).toBe(60);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec vitest run lib/quests.test.ts`
Expected: FAIL — `Failed to resolve import "./quests"`

- [ ] **Step 3 : Écrire l'implémentation**

Créer `lib/quests.ts` :

```ts
/**
 * Le briefing du jour — trois ordres de mission tirés chaque jour.
 *
 * Deux invariants gouvernent ce module :
 *
 *  1. Le tirage est DÉTERMINISTE : graine = userId + date. Stable toute la
 *     journée sans être stocké, non rejouable en rechargeant la page.
 *
 *  2. La faisabilité est évaluée sur l'état d'AVANT aujourd'hui (`past`), jamais
 *     sur le travail du jour (`today`). Sinon un ordre peut cesser d'être
 *     éligible à cause du travail qu'il demandait : le cadet le réussirait et le
 *     verrait disparaître. `today` ne sert QU'À la progression.
 *
 * Tout est calculable depuis StepCompletion : aucune télémétrie nouvelle.
 */

import type { ChapterMeta } from "./user-store";

export type QuestSlot = "reprise" | "effort" | "curiosite";

/** Barème. Total journalier plafonné à 60 XP — voir la spec, section « XP du briefing ». */
export const QUEST_XP: Record<QuestSlot, number> = {
  reprise: 10,
  effort: 20,
  curiosite: 15,
};

/** Bonus versé quand tous les ordres émis sont accomplis. */
export const CLOSING_XP = 15;

/** Jours d'inactivité au-delà desquels un cursus est « dormant ». */
const DORMANT_DAYS = 7;

export interface CompletionRecord {
  course: string;
  chapter: string;
  stepIndex: number;
  /** ISO 8601 complet (avec l'heure). */
  completedAt: string;
}

export interface QuestContext {
  userId: string;
  todayIso: string;
  /** Complétions strictement antérieures à aujourd'hui 00:00 UTC. */
  past: CompletionRecord[];
  /** Complétions du jour courant. */
  today: CompletionRecord[];
  chaptersByCourse: Record<string, ChapterMeta[]>;
}

export interface Quest {
  id: string;
  slot: QuestSlot;
  label: string;
  progress: number;
  target: number;
  done: boolean;
  /** Cursus visé, pour le lien « aller y faire ». Null si l'ordre est global. */
  course: string | null;
  chapter: string | null;
  xp: number;
}

export interface Briefing {
  dateIso: string;
  quests: Quest[];
  /** Vrai quand tous les ordres émis sont accomplis (bonus de clôture dû). */
  complete: boolean;
}

/** Découpe une liste de complétions en « avant aujourd'hui » / « aujourd'hui ». */
export function splitCompletions(
  all: CompletionRecord[],
  todayIso: string
): { past: CompletionRecord[]; today: CompletionRecord[] } {
  const past: CompletionRecord[] = [];
  const today: CompletionRecord[] = [];
  for (const c of all) {
    if (c.completedAt.slice(0, 10) === todayIso) today.push(c);
    else past.push(c);
  }
  return { past, today };
}

// --- Utilitaires d'état, tous fondés sur `past` uniquement ----------------

interface Params {
  course: string | null;
  chapter: string | null;
  target: number;
  /** Fragment inséré dans le libellé. */
  name: string;
}

function stepsDone(records: CompletionRecord[], course: string, chapter: string): number {
  return records.filter((r) => r.course === course && r.chapter === chapter).length;
}

function coursesTouched(records: CompletionRecord[]): Set<string> {
  return new Set(records.map((r) => r.course));
}

function lastDayOfCourse(records: CompletionRecord[], course: string): string | null {
  let latest: string | null = null;
  for (const r of records) {
    if (r.course !== course) continue;
    const day = r.completedAt.slice(0, 10);
    if (!latest || day > latest) latest = day;
  }
  return latest;
}

function daysSince(dayIso: string, todayIso: string): number {
  const from = Date.parse(`${dayIso}T00:00:00Z`);
  const to = Date.parse(`${todayIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** Chapitres entamés mais non terminés, triés pour un ordre stable. */
function chaptersInProgress(
  ctx: QuestContext
): { course: string; chapter: string; done: number; total: number }[] {
  const out: { course: string; chapter: string; done: number; total: number }[] = [];
  for (const [course, chapitres] of Object.entries(ctx.chaptersByCourse)) {
    for (const ch of chapitres) {
      const done = stepsDone(ctx.past, course, ch.slug);
      if (done > 0 && done < ch.totalSteps) {
        out.push({ course, chapter: ch.slug, done, total: ch.totalSteps });
      }
    }
  }
  out.sort((a, b) => `${a.course}/${a.chapter}`.localeCompare(`${b.course}/${b.chapter}`));
  return out;
}

// --- Archétypes -----------------------------------------------------------

interface Archetype {
  id: string;
  slot: QuestSlot;
  /** Retourne les paramètres si l'ordre est faisable aujourd'hui, sinon null. */
  feasible(ctx: QuestContext): Params | null;
  label(p: Params): string;
  progress(p: Params, today: CompletionRecord[]): number;
}

const ARCHETYPES: Archetype[] = [
  {
    id: "deux-etapes",
    slot: "reprise",
    feasible: () => ({ course: null, chapter: null, target: 2, name: "" }),
    label: () => "Valide 2 étapes",
    progress: (_p, today) => today.length,
  },
  {
    id: "une-etape",
    slot: "reprise",
    feasible: () => ({ course: null, chapter: null, target: 1, name: "" }),
    label: () => "Valide une étape",
    progress: (_p, today) => today.length,
  },
  {
    id: "boucler-chapitre",
    slot: "effort",
    feasible: (ctx) => {
      const cible = chaptersInProgress(ctx).find((c) => c.done / c.total >= 0.5);
      if (!cible) return null;
      return {
        course: cible.course,
        chapter: cible.chapter,
        target: cible.total - cible.done,
        name: cible.chapter.replace("chapitre-", "chapitre "),
      };
    },
    label: (p) => `Boucle le ${p.name} de ${p.course?.toUpperCase()}`,
    progress: (p, today) =>
      today.filter((r) => r.course === p.course && r.chapter === p.chapter).length,
  },
  {
    id: "cinq-etapes",
    slot: "effort",
    feasible: () => ({ course: null, chapter: null, target: 5, name: "" }),
    label: () => "Valide 5 étapes",
    progress: (_p, today) => today.length,
  },
  {
    id: "serie-chapitre",
    slot: "effort",
    feasible: (ctx) => {
      const cible = chaptersInProgress(ctx).find((c) => c.total - c.done >= 3);
      if (!cible) return null;
      return {
        course: cible.course,
        chapter: cible.chapter,
        target: 3,
        name: cible.chapter.replace("chapitre-", "chapitre "),
      };
    },
    label: (p) => `3 étapes dans le ${p.name} de ${p.course?.toUpperCase()}`,
    progress: (p, today) =>
      today.filter((r) => r.course === p.course && r.chapter === p.chapter).length,
  },
  {
    id: "second-front",
    slot: "curiosite",
    feasible: (ctx) =>
      coursesTouched(ctx.past).size >= 2
        ? { course: null, chapter: null, target: 2, name: "" }
        : null,
    label: () => "Progresse dans 2 cursus différents",
    progress: (_p, today) => coursesTouched(today).size,
  },
  {
    id: "cursus-dormant",
    slot: "curiosite",
    feasible: (ctx) => {
      const dormants = [...coursesTouched(ctx.past)]
        .map((course) => ({ course, last: lastDayOfCourse(ctx.past, course) }))
        .filter((c) => c.last !== null && daysSince(c.last, ctx.todayIso) >= DORMANT_DAYS)
        .sort((a, b) => a.course.localeCompare(b.course));
      const cible = dormants[0];
      if (!cible) return null;
      return { course: cible.course, chapter: null, target: 1, name: cible.course.toUpperCase() };
    },
    label: (p) => `Reprends ${p.name}, délaissé depuis une semaine`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
  {
    id: "premiere-fois",
    slot: "curiosite",
    feasible: (ctx) => {
      const touches = coursesTouched(ctx.past);
      const vierge = Object.keys(ctx.chaptersByCourse)
        .filter((c) => !touches.has(c))
        .sort()[0];
      if (!vierge) return null;
      return { course: vierge, chapter: null, target: 1, name: vierge.toUpperCase() };
    },
    label: (p) => `Ouvre le cursus ${p.name}`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
];

// --- Tirage déterministe --------------------------------------------------

/** FNV-1a 32 bits. Suffisant pour choisir un index, sans dépendance. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const SLOTS: QuestSlot[] = ["reprise", "effort", "curiosite"];

/**
 * Construit le briefing du jour. Peut rendre moins de trois ordres si un
 * emplacement n'a aucun archétype faisable — c'est correct, et documenté.
 */
export function buildBriefing(ctx: QuestContext): Briefing {
  const quests: Quest[] = [];

  for (const slot of SLOTS) {
    const candidats = ARCHETYPES.filter((a) => a.slot === slot)
      .map((a) => ({ a, p: a.feasible(ctx) }))
      .filter((c): c is { a: Archetype; p: Params } => c.p !== null);

    if (candidats.length === 0) continue;

    const index = hash(`${ctx.userId}:${ctx.todayIso}:${slot}`) % candidats.length;
    const { a, p } = candidats[index];
    const progress = Math.min(a.progress(p, ctx.today), p.target);

    quests.push({
      id: a.id,
      slot,
      label: a.label(p),
      progress,
      target: p.target,
      done: progress >= p.target,
      course: p.course,
      chapter: p.chapter,
      xp: QUEST_XP[slot],
    });
  }

  return {
    dateIso: ctx.todayIso,
    quests,
    complete: quests.length > 0 && quests.every((q) => q.done),
  };
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec vitest run lib/quests.test.ts`
Expected: PASS — 13 tests

- [ ] **Step 5 : Commit**

```bash
git add lib/quests.ts lib/quests.test.ts
git commit -m "feat(briefing): trois ordres tires chaque jour, cibles sur l'etat reel

Le tirage lit l'etat d'avant aujourd'hui, jamais le travail du jour :
sinon un ordre disparait au moment ou le cadet le reussit.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5 : `lib/conduct-badges.ts` — badges de conduite

**Files:**
- Create: `lib/conduct-badges.ts`
- Test: `lib/conduct-badges.test.ts`

**Interfaces:**
- Consumes: `CompletionRecord` de `lib/quests.ts`
- Produces:
  - `interface ConductBadgeDef { id: string; icon: string; label: string; description: string }`
  - `CONDUCT_BADGES: ConductBadgeDef[]`
  - `interface ConductContext { streak: number; questsCompleted: number; perfectBriefingRun: number; completions: CompletionRecord[]; justReturned: boolean }`
  - `evaluateConductBadges(ctx: ConductContext): string[]`
  - `getConductBadge(id: string): ConductBadgeDef | undefined`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/conduct-badges.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { BADGES } from "./badges-catalog";
import {
  CONDUCT_BADGES,
  evaluateConductBadges,
  getConductBadge,
  type ConductContext,
} from "./conduct-badges";
import type { CompletionRecord } from "./quests";

function step(course: string, jour: string, heure = "10"): CompletionRecord {
  return {
    course,
    chapter: "chapitre-1",
    stepIndex: 0,
    completedAt: `${jour}T${heure}:00:00.000Z`,
  };
}

function ctx(p: Partial<ConductContext> = {}): ConductContext {
  return {
    streak: 1,
    questsCompleted: 0,
    perfectBriefingRun: 0,
    completions: [],
    justReturned: false,
    ...p,
  };
}

describe("CONDUCT_BADGES", () => {
  it("n'entre jamais en collision avec les badges de cursus", () => {
    const cursus = new Set(BADGES.map((b) => b.id));
    for (const c of CONDUCT_BADGES) {
      expect(cursus.has(c.id)).toBe(false);
    }
  });

  it("a des identifiants uniques", () => {
    const ids = CONDUCT_BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("donne une icône emoji à chacun, faute de planche de sprites", () => {
    for (const b of CONDUCT_BADGES) expect(b.icon.length).toBeGreaterThan(0);
  });
});

describe("evaluateConductBadges", () => {
  it("ne donne rien à un cadet neuf", () => {
    expect(evaluateConductBadges(ctx())).toEqual([]);
  });

  it("attribue les paliers de liaison", () => {
    expect(evaluateConductBadges(ctx({ streak: 7 }))).toContain("liaison-7");
    expect(evaluateConductBadges(ctx({ streak: 30 }))).toContain("liaison-30");
    expect(evaluateConductBadges(ctx({ streak: 100 }))).toContain("liaison-100");
  });

  it("n'attribue pas un palier non atteint", () => {
    expect(evaluateConductBadges(ctx({ streak: 6 }))).not.toContain("liaison-7");
  });

  it("attribue les paliers d'ordres validés", () => {
    expect(evaluateConductBadges(ctx({ questsCompleted: 50 }))).toContain("quetes-50");
    expect(evaluateConductBadges(ctx({ questsCompleted: 49 }))).not.toContain("quetes-50");
  });

  it("attribue Sans faute à 5 briefings complets d'affilée", () => {
    expect(evaluateConductBadges(ctx({ perfectBriefingRun: 5 }))).toContain("briefing-5");
  });

  it("attribue Polyglotte à 5 cursus distincts", () => {
    const c = ["html", "css", "javascript", "react", "git"].map((x) => step(x, "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("polyglotte");
  });

  it("attribue Sprinteur à 10 étapes dans la même journée", () => {
    const c = Array.from({ length: 10 }, () => step("html", "2026-08-19"));
    expect(evaluateConductBadges(ctx({ completions: c }))).toContain("sprint");
  });

  it("ne confond pas 10 étapes réparties sur deux jours avec un sprint", () => {
    const c = [
      ...Array.from({ length: 5 }, () => step("html", "2026-08-18")),
      ...Array.from({ length: 5 }, () => step("html", "2026-08-19")),
    ];
    expect(evaluateConductBadges(ctx({ completions: c }))).not.toContain("sprint");
  });

  it("attribue Veilleur pour une étape validée avant 5 h UTC", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "03")] }))
    ).toContain("veilleur");
  });

  it("n'attribue pas Veilleur en pleine journée", () => {
    expect(
      evaluateConductBadges(ctx({ completions: [step("html", "2026-08-19", "14")] }))
    ).not.toContain("veilleur");
  });

  it("attribue Le Retour au moment exact de la rupture", () => {
    expect(evaluateConductBadges(ctx({ justReturned: true }))).toContain("retour");
    expect(evaluateConductBadges(ctx({ justReturned: false }))).not.toContain("retour");
  });
});

describe("getConductBadge", () => {
  it("retrouve une définition par id", () => {
    expect(getConductBadge("liaison-7")?.label).toBeTruthy();
  });

  it("retourne undefined pour un id inconnu", () => {
    expect(getConductBadge("inexistant")).toBeUndefined();
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec vitest run lib/conduct-badges.test.ts`
Expected: FAIL — `Failed to resolve import "./conduct-badges"`

- [ ] **Step 3 : Écrire l'implémentation**

Créer `lib/conduct-badges.ts` :

```ts
/**
 * Badges de conduite — ils prouvent COMMENT le cadet travaille, là où les 48
 * badges de lib/badges-catalog.ts prouvent CE QU'IL SAIT.
 *
 * Catalogue volontairement séparé de BADGES : là-bas, la position dans le
 * tableau est l'index de frame dans /sprites/badges.png (8x6 = 48). Y ajouter
 * des entrées casserait la correspondance et exigerait une planche neuve.
 * Ici, icône emoji jusqu'à ce qu'une planche dédiée existe.
 */

import type { CompletionRecord } from "./quests";

export interface ConductBadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
}

export const CONDUCT_BADGES: ConductBadgeDef[] = [
  { id: "liaison-7", icon: "📶", label: "Signal stable", description: "7 jours de liaison" },
  { id: "liaison-30", icon: "🎖", label: "Vétéran de la Coalition", description: "30 jours de liaison" },
  { id: "liaison-100", icon: "🏅", label: "Increvable", description: "100 jours de liaison" },
  { id: "quetes-10", icon: "📄", label: "Exécutant", description: "10 ordres validés" },
  { id: "quetes-50", icon: "📚", label: "Assidu", description: "50 ordres validés" },
  { id: "quetes-200", icon: "🏛", label: "Pilier de la station", description: "200 ordres validés" },
  { id: "briefing-5", icon: "✨", label: "Sans faute", description: "5 briefings complets d'affilée" },
  { id: "polyglotte", icon: "🗣", label: "Polyglotte", description: "Au moins une étape dans 5 cursus" },
  { id: "confins", icon: "🔭", label: "Explorateur des Confins", description: "Au moins une étape dans 10 cursus" },
  { id: "sprint", icon: "⚡", label: "Sprinteur", description: "10 étapes en une seule journée" },
  { id: "veilleur", icon: "🌙", label: "Veilleur", description: "Une étape validée avant 5 h" },
  { id: "retour", icon: "🔄", label: "Le Retour", description: "Revenu après une liaison rompue" },
];

const BY_ID = new Map(CONDUCT_BADGES.map((b) => [b.id, b]));

export function getConductBadge(id: string): ConductBadgeDef | undefined {
  return BY_ID.get(id);
}

export interface ConductContext {
  streak: number;
  questsCompleted: number;
  perfectBriefingRun: number;
  /** Toutes les complétions du cadet, horodatées. */
  completions: CompletionRecord[];
  /**
   * Vrai à l'instant précis où la machine à états signale une rupture d'une
   * série d'au moins 7 jours (LiaisonTransition.earnedReturn).
   */
  justReturned: boolean;
}

/** Nombre maximal d'étapes validées dans une même journée UTC. */
function maxStepsInOneDay(completions: CompletionRecord[]): number {
  const parJour = new Map<string, number>();
  for (const c of completions) {
    const jour = c.completedAt.slice(0, 10);
    parJour.set(jour, (parJour.get(jour) ?? 0) + 1);
  }
  let max = 0;
  for (const n of parJour.values()) if (n > max) max = n;
  return max;
}

/** Une étape a-t-elle été validée entre 00 h et 05 h UTC ? */
function hasNightStep(completions: CompletionRecord[]): boolean {
  return completions.some((c) => {
    const heure = Number(c.completedAt.slice(11, 13));
    return heure >= 0 && heure < 5;
  });
}

/**
 * Liste des badges de conduite mérités par l'état courant. Idempotente : le
 * serveur ne crée que ceux qui manquent en base.
 */
export function evaluateConductBadges(ctx: ConductContext): string[] {
  const merites: string[] = [];
  const cursus = new Set(ctx.completions.map((c) => c.course)).size;

  if (ctx.streak >= 7) merites.push("liaison-7");
  if (ctx.streak >= 30) merites.push("liaison-30");
  if (ctx.streak >= 100) merites.push("liaison-100");

  if (ctx.questsCompleted >= 10) merites.push("quetes-10");
  if (ctx.questsCompleted >= 50) merites.push("quetes-50");
  if (ctx.questsCompleted >= 200) merites.push("quetes-200");

  if (ctx.perfectBriefingRun >= 5) merites.push("briefing-5");
  if (cursus >= 5) merites.push("polyglotte");
  if (cursus >= 10) merites.push("confins");
  if (maxStepsInOneDay(ctx.completions) >= 10) merites.push("sprint");
  if (hasNightStep(ctx.completions)) merites.push("veilleur");
  if (ctx.justReturned) merites.push("retour");

  return merites;
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec vitest run lib/conduct-badges.test.ts`
Expected: PASS — 15 tests

- [ ] **Step 5 : Commit**

```bash
git add lib/conduct-badges.ts lib/conduct-badges.test.ts
git commit -m "feat(badges): une seconde famille, gagnee par la conduite

Catalogue separe de BADGES : la-bas, la position est l'index de frame
dans badges.png. Y ajouter des entrees casserait le mapping.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6 : `lib/unlocks.ts` — le catalogue de déblocables

**Files:**
- Create: `lib/unlocks.ts`
- Test: `lib/unlocks.test.ts`

**Interfaces:**
- Consumes: `gradeFromXp`, `GRADES` de `lib/grades.ts`
- Produces:
  - `type UnlockAxis = "frame" | "title" | "uniform" | "cardBg"`
  - `type UnlockCondition` (union discriminée, voir le code)
  - `interface UnlockDef { id: string; axis: UnlockAxis; label: string; condition: UnlockCondition }`
  - `UNLOCKS: UnlockDef[]`
  - `interface UnlockContext { streak: number; questsCompleted: number; totalXp: number; badges: string[]; coursesComplete: number; chaptersComplete: number }`
  - `interface UnlockStatus { def: UnlockDef; unlocked: boolean; remaining: string | null }`
  - `evaluateUnlocks(ctx: UnlockContext): UnlockStatus[]`
  - `nextUnlock(ctx: UnlockContext): UnlockStatus | null`
  - `defaultFor(axis: UnlockAxis): UnlockDef`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `lib/unlocks.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import {
  UNLOCKS,
  defaultFor,
  evaluateUnlocks,
  nextUnlock,
  type UnlockContext,
} from "./unlocks";

function ctx(p: Partial<UnlockContext> = {}): UnlockContext {
  return {
    streak: 1,
    questsCompleted: 0,
    totalXp: 0,
    badges: [],
    coursesComplete: 0,
    chaptersComplete: 0,
    ...p,
  };
}

describe("UNLOCKS", () => {
  it("a des identifiants uniques", () => {
    const ids = UNLOCKS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expose exactement un défaut par axe", () => {
    for (const axe of ["frame", "title", "uniform", "cardBg"] as const) {
      const defauts = UNLOCKS.filter((u) => u.axis === axe && u.condition.kind === "default");
      expect(defauts).toHaveLength(1);
    }
  });

  it("compte au moins 25 objets", () => {
    expect(UNLOCKS.length).toBeGreaterThanOrEqual(25);
  });
});

describe("evaluateUnlocks", () => {
  it("donne les défauts à un cadet neuf, et rien d'autre", () => {
    const debloque = evaluateUnlocks(ctx()).filter((u) => u.unlocked);
    expect(debloque).toHaveLength(4);
    expect(debloque.every((u) => u.def.condition.kind === "default")).toBe(true);
  });

  it("débloque sur palier de liaison", () => {
    const statuts = evaluateUnlocks(ctx({ streak: 7 }));
    expect(statuts.find((u) => u.def.id === "orbital")?.unlocked).toBe(true);
    expect(statuts.find((u) => u.def.id === "blanc-glacier")?.unlocked).toBe(false);
  });

  it("débloque sur grade", () => {
    const statuts = evaluateUnlocks(ctx({ totalXp: 10000 }));
    expect(statuts.find((u) => u.def.id === "frame-amiral")?.unlocked).toBe(true);
  });

  it("débloque sur badge possédé", () => {
    const statuts = evaluateUnlocks(ctx({ badges: ["security-shield"] }));
    expect(statuts.find((u) => u.def.id === "corrompu")?.unlocked).toBe(true);
    expect(statuts.find((u) => u.def.id === "rouge-spectre")?.unlocked).toBe(true);
  });

  it("annonce la distance restante d'un objet verrouillé", () => {
    const statut = evaluateUnlocks(ctx({ streak: 4 })).find((u) => u.def.id === "orbital");
    expect(statut?.unlocked).toBe(false);
    expect(statut?.remaining).toContain("3");
  });

  it("n'annonce aucune distance sur un objet obtenu", () => {
    const statut = evaluateUnlocks(ctx({ streak: 7 })).find((u) => u.def.id === "orbital");
    expect(statut?.remaining).toBeNull();
  });
});

describe("nextUnlock", () => {
  it("désigne l'objet verrouillé le plus proche", () => {
    const suivant = nextUnlock(ctx({ streak: 4 }));
    expect(suivant).not.toBeNull();
    expect(suivant?.unlocked).toBe(false);
  });

  it("retourne null quand tout est obtenu", () => {
    // Tous les badges dont dépend un titre doivent figurer ici, sinon les
    // titres correspondants restent verrouillés et nextUnlock n'est pas null.
    const tout = ctx({
      streak: 100,
      questsCompleted: 500,
      totalXp: 20000,
      badges: [
        "security-shield",
        "veilleur",
        "sprint",
        "polyglotte",
        "confins",
        "quetes-50",
        "quetes-200",
        "liaison-30",
        "liaison-100",
        "retour",
      ],
      coursesComplete: 14,
      chaptersComplete: 51,
    });
    expect(nextUnlock(tout)).toBeNull();
  });
});

describe("defaultFor", () => {
  it("donne le défaut de chaque axe", () => {
    expect(defaultFor("frame").id).toBe("standard");
    expect(defaultFor("title").id).toBe("cadet");
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec vitest run lib/unlocks.test.ts`
Expected: FAIL — `Failed to resolve import "./unlocks"`

- [ ] **Step 3 : Écrire l'implémentation**

Créer `lib/unlocks.ts` :

```ts
/**
 * Les déblocables cosmétiques.
 *
 * Contrainte fondatrice : AUCUNE image neuve. L'avatar est un médaillon rond
 * non composé (components/avatar/AvatarBadge.tsx) — une « tenue » demanderait
 * de régénérer 5 images par tenue. Tous les axes retenus ici sont donc du CSS,
 * du texte, ou réutilisent des fichiers déjà présents dans public/.
 */

import { GRADES, gradeFromXp } from "./grades";

export type UnlockAxis = "frame" | "title" | "uniform" | "cardBg";

export type UnlockCondition =
  | { kind: "default" }
  | { kind: "streak"; days: number }
  | { kind: "quests"; count: number }
  | { kind: "grade"; gradeId: string }
  | { kind: "badge"; badgeId: string }
  | { kind: "xp"; amount: number }
  | { kind: "coursesComplete"; count: number }
  | { kind: "chaptersComplete"; count: number };

export interface UnlockDef {
  id: string;
  axis: UnlockAxis;
  label: string;
  condition: UnlockCondition;
}

export const UNLOCKS: UnlockDef[] = [
  // --- Cadres d'avatar (CSS pur) ---
  { id: "standard", axis: "frame", label: "Standard", condition: { kind: "default" } },
  { id: "double", axis: "frame", label: "Double anneau", condition: { kind: "streak", days: 5 } },
  { id: "pulse", axis: "frame", label: "Pulsé", condition: { kind: "quests", count: 10 } },
  { id: "orbital", axis: "frame", label: "Orbital", condition: { kind: "streak", days: 7 } },
  { id: "hex", axis: "frame", label: "Hexagonal", condition: { kind: "grade", gradeId: "lieutenant" } },
  { id: "corrompu", axis: "frame", label: "Corrompu", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "frame-amiral", axis: "frame", label: "Insigne d'Amiral", condition: { kind: "grade", gradeId: "amiral" } },

  // --- Titres (texte pur) ---
  { id: "cadet", axis: "title", label: "Cadet", condition: { kind: "default" } },
  { id: "cadet-ingenieur", axis: "title", label: "Cadet-Ingénieur", condition: { kind: "chaptersComplete", count: 1 } },
  { id: "titre-veilleur", axis: "title", label: "Veilleur", condition: { kind: "badge", badgeId: "veilleur" } },
  { id: "titre-sprinteur", axis: "title", label: "Sprinteur", condition: { kind: "badge", badgeId: "sprint" } },
  { id: "titre-polyglotte", axis: "title", label: "Polyglotte", condition: { kind: "badge", badgeId: "polyglotte" } },
  { id: "titre-confins", axis: "title", label: "Explorateur des Confins", condition: { kind: "badge", badgeId: "confins" } },
  { id: "titre-assidu", axis: "title", label: "Assidu", condition: { kind: "badge", badgeId: "quetes-50" } },
  { id: "titre-pilier", axis: "title", label: "Pilier de la station", condition: { kind: "badge", badgeId: "quetes-200" } },
  { id: "titre-veteran", axis: "title", label: "Vétéran de la Coalition", condition: { kind: "badge", badgeId: "liaison-30" } },
  { id: "titre-increvable", axis: "title", label: "Increvable", condition: { kind: "badge", badgeId: "liaison-100" } },
  { id: "titre-revenant", axis: "title", label: "Revenant", condition: { kind: "badge", badgeId: "retour" } },
  { id: "titre-amiral", axis: "title", label: "Amiral de la Coalition", condition: { kind: "grade", gradeId: "amiral" } },

  // --- Couleurs d'uniforme (CSS pur, au-delà des 5 de lib/avatar.ts) ---
  // Identifiants alignes sur UNIFORM_COLORS (lib/avatar.ts) : la colonne ecrite
  // est uniformColor. Arbitrage du controleur en T7, ronde 1.
  { id: "cyan", axis: "uniform", label: "Cyan", condition: { kind: "default" } },
  { id: "rouge-spectre", axis: "uniform", label: "Rouge Spectre", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "blanc-glacier", axis: "uniform", label: "Blanc glacier", condition: { kind: "streak", days: 14 } },
  { id: "rose-neon", axis: "uniform", label: "Rose néon", condition: { kind: "quests", count: 25 } },
  { id: "nebuleuse", axis: "uniform", label: "Dégradé nébuleuse", condition: { kind: "grade", gradeId: "capitaine" } },

  // --- Fonds de carte (fichiers déjà dans public/) ---
  { id: "planet-green", axis: "cardBg", label: "Monde vert", condition: { kind: "default" } },
  { id: "planet-red", axis: "cardBg", label: "Monde rouge", condition: { kind: "coursesComplete", count: 1 } },
  { id: "planet-gas", axis: "cardBg", label: "Géante gazeuse", condition: { kind: "coursesComplete", count: 3 } },
  { id: "planet-ring", axis: "cardBg", label: "Monde à anneaux", condition: { kind: "grade", gradeId: "commandant" } },
  { id: "planet-dry", axis: "cardBg", label: "Monde aride", condition: { kind: "xp", amount: 2500 } },
  { id: "space-orange", axis: "cardBg", label: "Nébuleuse orange", condition: { kind: "grade", gradeId: "amiral" } },
];

export interface UnlockContext {
  streak: number;
  questsCompleted: number;
  totalXp: number;
  /** Ids de badges possédés, cursus ET conduite confondus. */
  badges: string[];
  coursesComplete: number;
  chaptersComplete: number;
}

export interface UnlockStatus {
  def: UnlockDef;
  unlocked: boolean;
  /** Distance restante, prête à afficher. Null quand l'objet est obtenu. */
  remaining: string | null;
}

function gradeIndex(id: string): number {
  return GRADES.findIndex((g) => g.id === id);
}

/** Évalue une condition et, si elle n'est pas remplie, dit ce qui manque. */
function check(
  condition: UnlockCondition,
  ctx: UnlockContext
): { ok: boolean; remaining: string | null } {
  switch (condition.kind) {
    case "default":
      return { ok: true, remaining: null };
    case "streak": {
      const manque = condition.days - ctx.streak;
      return manque <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${manque} jour${manque > 1 ? "s" : ""} de liaison` };
    }
    case "quests": {
      const manque = condition.count - ctx.questsCompleted;
      return manque <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${manque} ordre${manque > 1 ? "s" : ""}` };
    }
    case "grade": {
      const atteint = gradeIndex(gradeFromXp(ctx.totalXp).id);
      const vise = gradeIndex(condition.gradeId);
      if (atteint >= vise) return { ok: true, remaining: null };
      const seuil = GRADES[vise];
      return { ok: false, remaining: `grade ${seuil.label} (${seuil.threshold - ctx.totalXp} XP)` };
    }
    case "badge":
      return ctx.badges.includes(condition.badgeId)
        ? { ok: true, remaining: null }
        : { ok: false, remaining: "badge requis non obtenu" };
    case "xp": {
      const manque = condition.amount - ctx.totalXp;
      return manque <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${manque} XP` };
    }
    case "coursesComplete": {
      const manque = condition.count - ctx.coursesComplete;
      return manque <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${manque} cursus à terminer` };
    }
    case "chaptersComplete": {
      const manque = condition.count - ctx.chaptersComplete;
      return manque <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${manque} chapitre${manque > 1 ? "s" : ""}` };
    }
  }
}

/**
 * Statut de tous les déblocables. Les verrouillés portent leur distance :
 * un rayon qu'on voit est une feuille de route, un rayon caché n'existe pas.
 */
export function evaluateUnlocks(ctx: UnlockContext): UnlockStatus[] {
  return UNLOCKS.map((def) => {
    const { ok, remaining } = check(def.condition, ctx);
    return { def, unlocked: ok, remaining: ok ? null : remaining };
  });
}

/**
 * Le prochain objet à portée, pour la ligne permanente de la carte de cadet.
 * Ordonné par proximité : liaison d'abord, puis ordres, puis XP.
 */
export function nextUnlock(ctx: UnlockContext): UnlockStatus | null {
  const distance = (c: UnlockCondition): number => {
    switch (c.kind) {
      case "streak":
        return c.days - ctx.streak;
      case "quests":
        return c.count - ctx.questsCompleted;
      case "xp":
        return (c.amount - ctx.totalXp) / 100;
      case "grade": {
        const seuil = GRADES[gradeIndex(c.gradeId)];
        return (seuil.threshold - ctx.totalXp) / 100;
      }
      case "chaptersComplete":
        return (c.count - ctx.chaptersComplete) * 3;
      case "coursesComplete":
        return (c.count - ctx.coursesComplete) * 20;
      default:
        return Number.POSITIVE_INFINITY;
    }
  };

  const verrouilles = evaluateUnlocks(ctx).filter((u) => !u.unlocked);
  if (verrouilles.length === 0) return null;

  return verrouilles.reduce((meilleur, courant) =>
    distance(courant.def.condition) < distance(meilleur.def.condition) ? courant : meilleur
  );
}

/** L'objet par défaut d'un axe, porté tant que rien n'a été choisi. */
export function defaultFor(axis: UnlockAxis): UnlockDef {
  const def = UNLOCKS.find((u) => u.axis === axis && u.condition.kind === "default");
  if (!def) throw new Error(`Aucun défaut déclaré pour l'axe ${axis}`);
  return def;
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec vitest run lib/unlocks.test.ts`
Expected: PASS — 12 tests

- [ ] **Step 5 : Commit**

```bash
git add lib/unlocks.ts lib/unlocks.test.ts
git commit -m "feat(unlocks): 30 objets deblocables, zero image neuve

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7 : Le serveur — calcul du briefing et versement

**Files:**
- Modify: `lib/user-store.ts` (étendre `UserState` et `DEFAULT_USER`)
- Modify: `lib/me-server.ts`
- Delete: `lib/daily-mission.ts`, `lib/daily-mission.test.ts`, `app/api/me/daily/route.ts`
- Test: `lib/me-server` n'est pas testable sous vitest (il importe `server-only` et Prisma). La couverture vient des tests purs des tâches 2 à 6 et de l'e2e de la tâche 12.

**Interfaces:**
- Consumes: `advanceLiaison` (T3), `buildBriefing` / `splitCompletions` / `QUEST_XP` / `CLOSING_XP` (T4), `evaluateConductBadges` (T5), `evaluateUnlocks` (T6)
- Produces: `UserState` étendu de `briefing: Briefing | null`, `liaison: LiaisonPublic`, `unlocks: string[]`, `frame`, `title`, `emblem`, `cardBg`, `questsCompleted` ; `setCosmetics(userId, choices)`

- [ ] **Step 1 : Étendre `UserState` dans `lib/user-store.ts`**

Ajouter les imports en tête du fichier :

```ts
import type { Briefing } from "./quests";
```

Ajouter à l'interface `UserState`, après `role: string | null;` :

```ts
  // --- Boucle quotidienne ---------------------------------------------
  /** Briefing du jour, calculé serveur. Null en mode essai (visiteur local). */
  briefing: Briefing | null;
  liaison: LiaisonPublic;
  /** Ids des cosmétiques débloqués. */
  unlocks: string[];
  /** Total d'ordres validés (progression des badges de conduite). */
  questsCompleted: number;
  frame: string | null;
  title: string | null;
  emblem: string | null;
  cardBg: string | null;
```

Et déclarer le type public de la liaison juste au-dessus de `UserState` :

```ts
/** Vue client de la liaison. Le serveur en est seul maître. */
export interface LiaisonPublic {
  streak: number;
  bestStreak: number;
  shields: number;
  /** Les 7 derniers jours, du plus ancien au plus récent. */
  week: boolean[];
}
```

Pas de champ `notice` ici, volontairement : la liaison n'avance que dans
`completeStep`, donc un message « relais consommé » ne peut naître qu'à cet
instant. Il voyage dans `CompleteStepResult.notice` et s'affiche sur l'écran de
fin d'étape (tâche 11). Le poser aussi sur `LiaisonPublic` en ferait un champ
toujours nul.

Compléter `DEFAULT_USER` :

```ts
  briefing: null,
  liaison: { streak: 1, bestStreak: 1, shields: 0, week: [false, false, false, false, false, false, false] },
  unlocks: [],
  questsCompleted: 0,
  frame: null,
  title: null,
  emblem: null,
  cardBg: null,
```

- [ ] **Step 2 : Vérifier que le typecheck échoue là où c'est attendu**

Run: `pnpm exec tsc --noEmit`
Expected: FAIL — `lib/me-server.ts` : la fonction `shape()` ne renvoie plus un `UserState` complet. C'est le point d'entrée de l'étape suivante. `lib/trial-user.ts` peut aussi remonter : il sera traité à l'étape 6.

- [ ] **Step 3 : Élargir la sélection Prisma dans `lib/me-server.ts`**

Remplacer `USER_BUNDLE_SELECT` :

```ts
const USER_BUNDLE_SELECT = {
  username: true,
  totalXp: true,
  streak: true,
  bestStreak: true,
  streakShields: true,
  shieldEverGranted: true,
  questsCompleted: true,
  perfectBriefingRun: true,
  lastPerfectDay: true,
  dailyClaimed: true,
  lastVisit: true,
  lastDailyMission: true,
  lastVisitedCourse: true,
  joinedAt: true,
  onboardedAt: true,
  species: true,
  uniformColor: true,
  role: true,
  frame: true,
  title: true,
  emblem: true,
  cardBg: true,
  badges: { select: { badgeId: true } },
  unlocks: { select: { itemId: true } },
  stepCompletions: {
    select: { course: true, chapter: true, stepIndex: true, completedAt: true },
  },
} as const;
```

Et étendre `RawUserBundle` en miroir (mêmes noms, `completedAt: Date` pour les complétions, `unlocks: { itemId: string }[]`).

- [ ] **Step 4 : Calculer le briefing et la liaison dans `shape()`**

Remplacer la fonction `shape` par :

```ts
import { buildBriefing, splitCompletions, type CompletionRecord } from "@/lib/quests";
import { getChaptersMeta } from "@/lib/courses-meta";
import { COURSES_CATALOG } from "@/lib/courses-catalog";
import type { LiaisonPublic, UserState } from "@/lib/user-store";
import { daysBetweenIso } from "@/lib/streak";

/** Métadonnées de chapitres par cursus — constante, calculée une fois. */
const CHAPTERS_BY_COURSE: Record<string, { slug: string; totalSteps: number }[]> =
  Object.fromEntries(
    COURSES_CATALOG.map((c) => [
      c.slug,
      getChaptersMeta(c.slug).map((ch) => ({ slug: ch.slug, totalSteps: ch.totalSteps })),
    ])
  );

/** Les 7 derniers jours : un booléen par jour, du plus ancien au plus récent. */
function weekDots(records: CompletionRecord[], todayIso: string): boolean[] {
  const jours = new Set(records.map((r) => r.completedAt.slice(0, 10)));
  const dots: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const t = Date.parse(`${todayIso}T00:00:00Z`) - i * 86_400_000;
    dots.push(jours.has(new Date(t).toISOString().slice(0, 10)));
  }
  return dots;
}

function shape(bundle: RawUserBundle): UserState {
  const completedSteps: Record<string, number[]> = {};
  const records: CompletionRecord[] = bundle.stepCompletions.map((sc) => ({
    course: sc.course,
    chapter: sc.chapter,
    stepIndex: sc.stepIndex,
    completedAt: sc.completedAt.toISOString(),
  }));

  for (const sc of records) {
    const key = `${sc.course}/${sc.chapter}`;
    (completedSteps[key] ??= []).push(sc.stepIndex);
  }
  for (const k of Object.keys(completedSteps)) {
    completedSteps[k].sort((a, b) => a - b);
  }

  const today = todayIso();
  const { past, today: todayRecords } = splitCompletions(records, today);

  const liaison: LiaisonPublic = {
    streak: bundle.streak,
    bestStreak: bundle.bestStreak,
    shields: bundle.streakShields,
    week: weekDots(records, today),
  };

  return {
    username: bundle.username,
    totalXp: bundle.totalXp,
    streak: bundle.streak,
    lastVisit: bundle.lastVisit,
    lastDailyMission: bundle.lastDailyMission,
    lastVisitedCourse: bundle.lastVisitedCourse,
    badges: bundle.badges.map((b) => b.badgeId),
    completedSteps,
    joinedAt: bundle.joinedAt.toISOString().slice(0, 10),
    onboardedAt: bundle.onboardedAt ? bundle.onboardedAt.toISOString() : null,
    species: bundle.species,
    uniformColor: bundle.uniformColor,
    role: bundle.role,
    briefing: buildBriefing({
      userId: bundle.username,
      todayIso: today,
      past,
      today: todayRecords,
      chaptersByCourse: CHAPTERS_BY_COURSE,
    }),
    liaison,
    unlocks: bundle.unlocks.map((u) => u.itemId),
    questsCompleted: bundle.questsCompleted,
    frame: bundle.frame,
    title: bundle.title,
    emblem: bundle.emblem,
    cardBg: bundle.cardBg,
  };
}
```

Note : la graine du tirage utilise `bundle.username` plutôt que l'id — il est déjà dans la sélection, unique en base (`@unique`), et stable.

**Bloc d'imports complet à poser en tête de `lib/me-server.ts`** (les étapes 6 et 7 en consomment la totalité) :

```ts
import { COURSES_CATALOG } from "@/lib/courses-catalog";
import { getChaptersMeta } from "@/lib/courses-meta";
import { evaluateConductBadges } from "@/lib/conduct-badges";
import {
  buildBriefing,
  splitCompletions,
  CLOSING_XP,
  type CompletionRecord,
} from "@/lib/quests";
import { advanceLiaison, daysBetweenIso } from "@/lib/streak";
import { evaluateUnlocks, UNLOCKS } from "@/lib/unlocks";
import type { LiaisonPublic, UserState } from "@/lib/user-store";
```

L'import `DAILY_MISSION_XP, canClaimDailyMission` de `@/lib/daily-mission` disparaît (étape 8).

- [ ] **Step 5 : Retirer l'avancée de streak de `getUserState`**

`getUserState` ne doit plus toucher au streak : la liaison n'avance que sur travail réel, dans `completeStep`. Remplacer le corps par :

```ts
export async function getUserState(userId: string): Promise<UserState | null> {
  const bundle = await fetchBundle(userId);
  if (!bundle) return null;
  return shape(bundle);
}
```

Supprimer aussi la fonction locale `daysBetween`, devenue morte (remplacée par `daysBetweenIso` de `lib/streak.ts`).

- [ ] **Step 6 : Écrire le versement dans `completeStep`**

Dans la transaction de `completeStep`, après le bloc « Chapter completion → badge », insérer :

```ts
    // --- Boucle quotidienne : liaison, ordres, badges de conduite ---------
    const jour = todayIso();

    const brut = await tx.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        streak: true,
        bestStreak: true,
        streakShields: true,
        shieldEverGranted: true,
        questsCompleted: true,
        perfectBriefingRun: true,
        lastPerfectDay: true,
        lastVisit: true,
        lastDailyMission: true,
        dailyClaimed: true,
        username: true,
      },
    });
    if (!brut) throw new UserNotFoundError();

    // Remise à zéro du masque au changement de journée.
    const masque = brut.lastDailyMission === jour ? brut.dailyClaimed : 0;

    const toutes = await tx.stepCompletion.findMany({
      where: { userId },
      select: { course: true, chapter: true, stepIndex: true, completedAt: true },
    });
    const records: CompletionRecord[] = toutes.map((r) => ({
      course: r.course,
      chapter: r.chapter,
      stepIndex: r.stepIndex,
      completedAt: r.completedAt.toISOString(),
    }));
    const { past, today: todayRecords } = splitCompletions(records, jour);

    const briefing = buildBriefing({
      userId: brut.username,
      todayIso: jour,
      past,
      today: todayRecords,
      chaptersByCourse: CHAPTERS_BY_COURSE,
    });

    // XP des ordres accomplis non encore payés + bonus de clôture.
    let bonusXp = 0;
    let nouveauMasque = masque;
    let ordresPayes = 0;
    briefing.quests.forEach((q, i) => {
      const bit = 1 << i;
      if (q.done && (nouveauMasque & bit) === 0) {
        bonusXp += q.xp;
        nouveauMasque |= bit;
        ordresPayes += 1;
      }
    });

    let serieParfaite = brut.perfectBriefingRun;
    let dernierParfait = brut.lastPerfectDay;
    if (briefing.complete && (nouveauMasque & 0b1000) === 0) {
      bonusXp += CLOSING_XP;
      nouveauMasque |= 0b1000;
      serieParfaite =
        dernierParfait && daysBetweenIso(dernierParfait, jour) === 1 ? serieParfaite + 1 : 1;
      dernierParfait = jour;
    }

    // La liaison avance ici, sans condition : on n'atteint ce point que pour
    // une étape RÉELLEMENT NEUVE — la transaction est sortie plus haut quand
    // l'étape était déjà validée (`alreadyDone`). Une étape validée est du
    // travail réel, et c'est la seule chose que la liaison compte ; une simple
    // visite n'en est pas, et ne passe plus par ici depuis que `getUserState`
    // ne touche plus au streak.
    //
    // Le déclencheur est délibérément l'étape et non l'ordre accompli : un
    // ordre peut demander plusieurs étapes, et un cadet qui n'en boucle qu'une
    // un jour chargé a travaillé quand même — lui rompre sa série serait le
    // punir de son effort.
    //
    // `advanceLiaison` est idempotente sur la journée : si `lastActiveDay`
    // vaut déjà `jour`, elle rend l'état inchangé.
    const transition = advanceLiaison(
      {
        streak: brut.streak,
        bestStreak: brut.bestStreak,
        shields: brut.streakShields,
        shieldEverGranted: brut.shieldEverGranted,
        lastActiveDay: brut.lastVisit,
      },
      jour
    );

    const liaisonApres = transition.next;

    const questsCompletedApres = brut.questsCompleted + ordresPayes;
    const xpApres = Math.min(brut.totalXp + bonusXp, MAX_XP);

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: xpApres,
        dailyClaimed: nouveauMasque,
        lastDailyMission: jour,
        questsCompleted: questsCompletedApres,
        perfectBriefingRun: serieParfaite,
        lastPerfectDay: dernierParfait,
        streak: liaisonApres.streak,
        bestStreak: liaisonApres.bestStreak,
        streakShields: liaisonApres.shields,
        shieldEverGranted: liaisonApres.shieldEverGranted,
        lastVisit: liaisonApres.lastActiveDay,
      },
    });

    awardedXp += xpApres - brut.totalXp;
    questXp = xpApres - brut.totalXp;
    completedQuests = briefing.quests.filter((q) => q.done).map((q) => q.label);

    if (transition.shieldsConsumed) {
      notice = `Un relais de secours a couvert ton absence. Il t'en reste ${liaisonApres.shields}.`;
    } else if (transition.broken) {
      notice = `Liaison rompue. Ton record de ${liaisonApres.bestStreak} jours reste acquis.`;
    }

    // Badges de conduite mérités mais non encore attribués.
    const merites = evaluateConductBadges({
      streak: liaisonApres.streak,
      questsCompleted: questsCompletedApres,
      perfectBriefingRun: serieParfaite,
      completions: records,
      justReturned: transition.earnedReturn,
    });
    const dejaLa = new Set(
      (await tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map(
        (b) => b.badgeId
      )
    );
    for (const id of merites) {
      if (dejaLa.has(id)) continue;
      await tx.userBadge.create({ data: { userId, badgeId: id } });
      newConductBadges.push(id);
    }

    // Déblocables cosmétiques nouvellement atteints.
    const chapitresFinis = Object.entries(CHAPTERS_BY_COURSE).reduce(
      (n, [course, chapitres]) =>
        n +
        chapitres.filter(
          (ch) =>
            records.filter((r) => r.course === course && r.chapter === ch.slug).length >=
            ch.totalSteps
        ).length,
      0
    );
    const cursusFinis = Object.entries(CHAPTERS_BY_COURSE).filter(([course, chapitres]) =>
      chapitres.every(
        (ch) =>
          records.filter((r) => r.course === course && r.chapter === ch.slug).length >=
          ch.totalSteps
      )
    ).length;

    const statuts = evaluateUnlocks({
      streak: liaisonApres.streak,
      questsCompleted: questsCompletedApres,
      totalXp: xpApres,
      badges: [...dejaLa, ...merites],
      coursesComplete: cursusFinis,
      chaptersComplete: chapitresFinis,
    });
    const dejaDebloques = new Set(
      (await tx.userUnlock.findMany({ where: { userId }, select: { itemId: true } })).map(
        (u) => u.itemId
      )
    );
    for (const s of statuts) {
      if (!s.unlocked || dejaDebloques.has(s.def.id)) continue;
      await tx.userUnlock.create({ data: { userId, itemId: s.def.id } });
      newUnlocks.push(s.def.id);
    }
```

Déclarer en tête de `completeStep`, à côté de `let awardedXp = 0;` :

```ts
  let questXp = 0;
  let completedQuests: string[] = [];
  const newConductBadges: string[] = [];
  const newUnlocks: string[] = [];
  let notice: string | null = null;
```

Et élargir le type de retour :

```ts
export interface CompleteStepResult {
  state: UserState;
  awardedXp: number;
  newBadge: string | null;
  alreadyDone: boolean;
  /** XP versée par les ordres du jour, incluse dans awardedXp. */
  questXp: number;
  completedQuests: string[];
  newConductBadges: string[];
  newUnlocks: string[];
  /** Message de liaison à afficher une fois (relais consommé, rupture). */
  notice: string | null;
}
```

Le `return` final devient :

```ts
  return { state, awardedXp, newBadge, alreadyDone, questXp, completedQuests, newConductBadges, newUnlocks, notice };
```

- [ ] **Step 7 : Ajouter `setCosmetics` à `lib/me-server.ts`**

À la suite de `setAvatar` :

```ts
export class InvalidCosmeticError extends Error {}

/**
 * Enregistre les cosmétiques portés. Refuse tout objet que le cadet n'a pas
 * débloqué — la validation est serveur, le client n'est pas cru sur parole.
 */
export async function setCosmetics(
  userId: string,
  choices: { frame?: string; title?: string; emblem?: string; cardBg?: string }
): Promise<UserState> {
  await assertUserExists(userId);

  const [unlocks, badges] = await Promise.all([
    prisma.userUnlock.findMany({ where: { userId }, select: { itemId: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const possede = new Set(unlocks.map((u) => u.itemId));
  const badgesPossedes = new Set(badges.map((b) => b.badgeId));

  for (const [axe, id] of Object.entries(choices)) {
    if (id === undefined) continue;
    if (axe === "emblem") {
      if (!badgesPossedes.has(id)) {
        throw new InvalidCosmeticError("Ce badge n'est pas obtenu");
      }
      continue;
    }
    const def = UNLOCKS.find((u) => u.id === id);
    if (!def) throw new InvalidCosmeticError("Objet inconnu");
    if (def.condition.kind !== "default" && !possede.has(id)) {
      throw new InvalidCosmeticError("Cet objet n'est pas débloqué");
    }
  }

  await prisma.user.update({ where: { id: userId }, data: choices });

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}
```

- [ ] **Step 8 : Nettoyer `resetProgress` et supprimer l'ancienne mission du jour**

Dans `resetProgress`, ajouter la suppression des déblocables et la remise à zéro des nouveaux compteurs :

```ts
  await prisma.$transaction([
    prisma.stepCompletion.deleteMany({ where: { userId } }),
    prisma.userBadge.deleteMany({ where: { userId } }),
    prisma.userUnlock.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: 0,
        streak: 1,
        bestStreak: 1,
        streakShields: 0,
        shieldEverGranted: false,
        questsCompleted: 0,
        perfectBriefingRun: 0,
        lastPerfectDay: "",
        dailyClaimed: 0,
        lastVisit: "",
        lastDailyMission: "",
        lastVisitedCourse: null,
        frame: null,
        title: null,
        emblem: null,
        cardBg: null,
      },
    }),
  ]);
```

Puis supprimer `claimDailyMission` et `ClaimDailyResult` de `lib/me-server.ts`, et les fichiers devenus morts :

```bash
git rm lib/daily-mission.ts lib/daily-mission.test.ts app/api/me/daily/route.ts
```

Ajouter enfin les champs de la boucle à `exportUserData` (RGPD — l'export doit rester complet) : `bestStreak`, `streakShields`, `questsCompleted`, `perfectBriefingRun`, `frame`, `title`, `emblem`, `cardBg`, et `unlocks: { select: { itemId: true, unlockedAt: true } }`.

- [ ] **Step 9 : Réparer le mode essai**

`lib/trial-user.ts` construit un `UserState` local. Lui ajouter les champs manquants en réutilisant `DEFAULT_USER` comme base, avec `briefing: null` — le dashboard est derrière le middleware, un visiteur anonyme n'y accède pas.

Run: `pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 10 : Lancer la suite complète**

Run: `pnpm exec vitest run && pnpm exec tsc --noEmit && pnpm exec eslint`
Expected: PASS

- [ ] **Step 11 : Commit**

```bash
git add -A
git commit -m "feat(server): l'XP du briefing tombe la ou le travail a lieu

La liaison n'avance plus a la visite : elle attend une etape validee.
claimDailyMission et sa route disparaissent avec le bouton.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8 : La route et le hook cosmétiques

**Files:**
- Create: `app/api/me/cosmetics/route.ts`
- Modify: `lib/use-user.ts`

**Interfaces:**
- Consumes: `setCosmetics`, `InvalidCosmeticError` (T7)
- Produces: `useUser().setCosmetics(choices) => Promise<UserState>` ; `CompleteStepResponse` étendu des champs de T7

- [ ] **Step 1 : Créer la route**

Créer `app/api/me/cosmetics/route.ts`, sur le modèle exact de `app/api/me/avatar/route.ts` :

```ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  InvalidCosmeticError,
  UserNotFoundError,
  setCosmetics,
} from "@/lib/me-server";

const bodySchema = z.object({
  frame: z.string().min(1).max(48).optional(),
  title: z.string().min(1).max(48).optional(),
  emblem: z.string().min(1).max(48).optional(),
  cardBg: z.string().min(1).max(48).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  try {
    const state = await setCosmetics(session.user.id, parsed.data);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof InvalidCosmeticError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
```

- [ ] **Step 2 : Étendre `lib/use-user.ts`**

Étendre `CompleteStepResponse` des champs produits par T7 :

```ts
export interface CompleteStepResponse {
  state: UserState;
  awardedXp: number;
  newBadge: string | null;
  alreadyDone: boolean;
  questXp: number;
  completedQuests: string[];
  newConductBadges: string[];
  newUnlocks: string[];
  notice: string | null;
}
```

Supprimer `ClaimDailyResponse` et `claimDailyMission` de l'interface `UseUserReturn` et du corps du hook (le bouton disparaît), et ajouter :

```ts
  /** Enregistre les cosmétiques portés. Le serveur refuse ce qui n'est pas débloqué. */
  setCosmetics: (choices: {
    frame?: string;
    title?: string;
    emblem?: string;
    cardBg?: string;
  }) => Promise<UserState>;
```

Implémentation, calquée sur `setAvatar` :

```ts
  const setCosmetics = useCallback(
    async (choices: { frame?: string; title?: string; emblem?: string; cardBg?: string }) => {
      let res: Response;
      try {
        res = await fetch("/api/me/cosmetics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(choices),
        });
      } catch {
        throw new Error(toNetworkMessage());
      }
      if (res.status === 401) {
        void signOut({ callbackUrl: "/login" });
        throw new Error("Session expiree. Reconnecte-toi.");
      }
      if (!res.ok) {
        const err = await readJson<{ error?: string }>(res);
        throw new Error(err.error ?? "Sauvegarde impossible");
      }
      const next = await readJson<UserState>(res);
      setState(next);
      return next;
    },
    []
  );
```

Ne pas oublier `setCosmetics` dans l'objet retourné.

- [ ] **Step 3 : Réparer `lib/use-trial-user.ts`**

Le mode essai doit exposer la même forme. Ajouter un `setCosmetics` qui rejette :

```ts
  setCosmetics: async () => {
    throw new Error("Crée un compte pour personnaliser ton cadet");
  },
```

et retirer `claimDailyMission` de la même manière.

- [ ] **Step 4 : Vérifier**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint`
Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat(api): la route cosmetiques refuse ce qui n'est pas debloque

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9 : Le dashboard

**Files:**
- Create: `components/dashboard/BriefingCard.tsx`, `components/dashboard/QuestLine.tsx`, `components/dashboard/LiaisonBanner.tsx`, `components/dashboard/CadetCard.tsx`
- Modify: `app/dashboard/page.tsx`
- Delete: `components/dashboard/DailyMission.tsx`, `app/StatsCard.tsx`
- Modify: `components/ui/XPBar.tsx`

**Interfaces:**
- Consumes: `UserState.briefing`, `UserState.liaison`, `gradeFromXp`, `levelFromXp`, `nextUnlock`
- Produces: composants d'affichage sans logique métier

- [ ] **Step 1 : `QuestLine.tsx` — une ligne d'ordre**

```tsx
"use client";

import Link from "next/link";
import type { Quest } from "@/lib/quests";

/** Un ordre compact : libellé, barre de progression, lien vers l'endroit visé. */
export default function QuestLine({ quest, href }: { quest: Quest; href: string }) {
  const pct = Math.round((quest.progress / quest.target) * 100);
  return (
    <div className="rounded-sm border border-nebula-border/70 bg-nebula-bg-darkest/50 px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span
          className={`font-tech text-xs uppercase tracking-wider ${
            quest.done ? "text-nebula-green" : "text-nebula-text-secondary"
          }`}
        >
          {quest.done ? "✓ " : "› "}
          {quest.label}
        </span>
        <span className="shrink-0 font-tech text-[11px] tracking-wider text-nebula-text-dim">
          +{quest.xp} XP
        </span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-nebula-bg-editor/80">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            quest.done ? "bg-nebula-green" : "bg-nebula-cyan"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
          {quest.progress} / {quest.target}
        </span>
        {!quest.done && (
          <Link
            href={href}
            className="font-tech text-[10px] uppercase tracking-widest text-nebula-cyan hover:underline"
          >
            Y aller →
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : `LiaisonBanner.tsx` — compteur, semaine, échéance**

```tsx
"use client";

import { useEffect, useState } from "react";
import type { LiaisonPublic } from "@/lib/user-store";

/** Temps restant avant minuit UTC, format « 4 h 12 ». */
function tempsRestant(): string {
  const maintenant = new Date();
  const finJour = Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate() + 1
  );
  const reste = finJour - maintenant.getTime();
  const h = Math.floor(reste / 3_600_000);
  const m = Math.floor((reste % 3_600_000) / 60_000);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export default function LiaisonBanner({ liaison }: { liaison: LiaisonPublic }) {
  const [reste, setReste] = useState<string | null>(null);

  // Calculé après montage : l'heure diffère entre serveur et client, la rendre
  // au premier rendu provoquerait une erreur d'hydratation.
  useEffect(() => {
    setReste(tempsRestant());
    const id = setInterval(() => setReste(tempsRestant()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-6 rounded-md border border-nebula-cyan/40 bg-nebula-bg-panel/85 px-5 py-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-tech text-2xl text-nebula-cyan">
            {liaison.streak}
            <span className="ml-1 text-xs uppercase tracking-widest">
              jour{liaison.streak > 1 ? "s" : ""} de liaison
            </span>
          </span>
          {liaison.shields > 0 && (
            <span
              className="font-tech text-[11px] uppercase tracking-widest text-nebula-orange"
              title="Relais de secours : couvrent un jour manqué"
            >
              🛡 ×{liaison.shields}
            </span>
          )}
        </div>
        {reste && (
          <span className="font-tech text-[11px] uppercase tracking-widest text-nebula-text-dim">
            signal perdu dans {reste}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {liaison.week.map((actif, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              actif ? "bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]" : "bg-nebula-border"
            }`}
          />
        ))}
        <span className="ml-2 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
          record {liaison.bestStreak} j
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : `BriefingCard.tsx` — la fusion**

La grande carte porte l'ordre d'effort **et** la reprise de mission : un seul appel à l'action. Elle remplace le contenu de la section « Reprendre la mission » de `app/dashboard/page.tsx:104-190`. Props :

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Briefing } from "@/lib/quests";
import QuestLine from "./QuestLine";

interface BriefingCardProps {
  briefing: Briefing | null;
  courseTitle: string;
  courseProgress: number;
  /** Lien vers l'étape suivante du cursus actif. */
  resumeHref: string;
  resumeLabel: string;
  /** Construit le lien d'un ordre à partir du cursus qu'il vise. */
  hrefForQuest: (course: string | null, chapter: string | null) => string;
}

export default function BriefingCard({
  briefing,
  courseTitle,
  courseProgress,
  resumeHref,
  resumeLabel,
  hrefForQuest,
}: BriefingCardProps) {
  const effort = briefing?.quests.find((q) => q.slot === "effort") ?? null;
  const autres = briefing?.quests.filter((q) => q.slot !== "effort") ?? [];
  const termine = briefing?.complete ?? false;

  return (
    <article className="relative overflow-hidden rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)] lg:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 opacity-25">
        <Image
          src="/planet-green-v2.png"
          alt=""
          width={200}
          height={200}
          className="animate-planet-rotate"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="relative">
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
            <span>Progression du cursus</span>
            <span className="text-nebula-cyan">{courseProgress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-nebula-border bg-nebula-bg-editor/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-nebula-cyan to-nebula-green shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-700"
              style={{ width: `${courseProgress}%` }}
            />
          </div>
        </div>

        <div className="mb-2 font-tech text-xs uppercase tracking-[0.22em] text-nebula-text-dim">
          {termine ? "BRIEFING COMPLET" : "ORDRE DU JOUR"}
        </div>

        {termine ? (
          <>
            <h3 className="mb-3 font-tech text-3xl uppercase tracking-wider text-nebula-green">
              Mission du jour accomplie
            </h3>
            <p className="mb-7 font-body text-base leading-relaxed text-nebula-text-secondary">
              Tous les ordres sont validés, Cadet. Rien ne t'empêche de continuer.
            </p>
          </>
        ) : (
          <>
            <h3 className="mb-3 font-tech text-3xl uppercase tracking-wider text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
              {effort ? effort.label : courseTitle}
            </h3>
            {effort && (
              <p className="mb-5 font-body text-sm text-nebula-text-dim">
                {effort.progress} / {effort.target} · +{effort.xp} XP
              </p>
            )}
          </>
        )}

        <Link
          href={effort && !effort.done ? hrefForQuest(effort.course, effort.chapter) : resumeHref}
          className="inline-block rounded-sm bg-nebula-cyan px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
        >
          {"> "}
          {resumeLabel}
          <span className="terminal-cursor">_</span>
        </Link>

        {autres.length > 0 && (
          <div className="mt-6 space-y-2.5">
            {autres.map((q) => (
              <QuestLine key={q.id} quest={q} href={hrefForQuest(q.course, q.chapter)} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 4 : `CadetCard.tsx` — remplace `StatsCard`**

Reprendre `app/StatsCard.tsx` à l'identique pour la structure (médaillon, grille 2×2, CTA `/profil`), avec trois changements :

1. Le médaillon utilise `AvatarBadge` avec le cadre débloqué, plus le titre porté sous le pseudo et l'emblème choisi en pastille.
2. La case « Rang » affiche `gradeFromXp(totalXp).label` au lieu du Bronze/Argent/Or.
3. Une ligne permanente sous la grille, alimentée par `nextUnlock` :

```tsx
{prochain && (
  <div className="mt-4 rounded-sm border border-nebula-orange/40 bg-nebula-bg-darkest/50 px-3 py-2.5">
    <div className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
      Prochain déblocable
    </div>
    <div className="font-tech text-sm text-nebula-orange">{prochain.def.label}</div>
    <div className="font-tech text-[10px] tracking-wider text-nebula-text-secondary">
      {prochain.remaining}
    </div>
  </div>
)}
```

- [ ] **Step 5 : Câbler `app/dashboard/page.tsx`**

- Remplacer l'import `DailyMission` par `LiaisonBanner`, `BriefingCard`, `CadetCard`.
- Poser `<LiaisonBanner liaison={state.liaison} />` juste au-dessus de la section de bienvenue.
- Remplacer la section « Reprendre la mission » par `<BriefingCard … />`, en passant `hrefForQuest` :

```tsx
const hrefForQuest = (course: string | null, chapter: string | null): string => {
  if (course && chapter) return `/learn/${course}/${chapter}`;
  if (course) return `/learn/${course}`;
  return nextStep ? `/learn/${activeCourseSlug}/${nextStep.chapterSlug}` : "/learn";
};
```

- Remplacer `<StatsCard … />` par `<CadetCard … />` dans la colonne droite, et retirer `<DailyMission />`.

- [ ] **Step 6 : Réparer `components/ui/XPBar.tsx`**

Le composant affiche « LVL 1 » codé en dur. Ajouter la prop et l'utiliser :

```tsx
import { levelFromXp } from "@/lib/grades";

interface XPBarProps {
  xp: number;
  maxXp: number;
}

export default function XPBar({ xp, maxXp }: XPBarProps) {
  const level = levelFromXp(xp);
  // … reste identique, puis :
  //   <div …>LVL {level}</div>
}
```

- [ ] **Step 7 : Supprimer les fichiers morts**

```bash
git rm components/dashboard/DailyMission.tsx app/StatsCard.tsx
```

- [ ] **Step 8 : Vérifier**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint && pnpm exec vitest run`
Expected: PASS

- [ ] **Step 9 : Vérifier visuellement**

Démarrer le serveur de développement via l'outil de prévisualisation (jamais via Bash), ouvrir `/dashboard` connecté, et contrôler : le bandeau de liaison en tête, l'ordre d'effort dans la grande carte, deux lignes d'ordres dessous, la carte de cadet avec le prochain déblocable. Vérifier la console : aucune erreur d'hydratation (`LiaisonBanner` calcule l'heure après montage, c'est le point sensible).

- [ ] **Step 10 : Commit**

```bash
git add -A
git commit -m "feat(dashboard): un seul appel a l'action, et il dit aujourd'hui

La grande carte porte l'ordre d'effort du jour : la quete EST la reprise
de mission. Fini les deux CTA qui se concurrencent.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10 : L'armurerie

**Files:**
- Create: `components/avatar/UnlockShelf.tsx`
- Modify: `app/avatar/page.tsx`

**Interfaces:**
- Consumes: `evaluateUnlocks`, `UNLOCKS`, `BADGES`, `useUser().setCosmetics`
- Produces: aucun export consommé ailleurs

- [ ] **Step 1 : Écrire `UnlockShelf.tsx`**

Un panneau par axe (`frame`, `title`, `uniform`, `cardBg`) plus l'axe emblème alimenté par les badges possédés. Règle centrale : **les objets verrouillés sont visibles, grisés, avec leur condition**.

```tsx
"use client";

import { evaluateUnlocks, type UnlockAxis, type UnlockContext } from "@/lib/unlocks";

const TITRES: Record<UnlockAxis, string> = {
  frame: "Cadres",
  title: "Titres",
  uniform: "Uniformes",
  cardBg: "Fonds de carte",
};

interface UnlockShelfProps {
  axis: UnlockAxis;
  ctx: UnlockContext;
  /** Id porté actuellement. */
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function UnlockShelf({ axis, ctx, selected, onSelect }: UnlockShelfProps) {
  const objets = evaluateUnlocks(ctx).filter((u) => u.def.axis === axis);

  return (
    <section className="mb-8">
      <h3 className="mb-3 font-tech text-sm uppercase tracking-widest text-nebula-cyan">
        {TITRES[axis]}
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {objets.map(({ def, unlocked, remaining }) => (
          <button
            key={def.id}
            type="button"
            disabled={!unlocked}
            onClick={() => onSelect(def.id)}
            aria-pressed={selected === def.id}
            className={`rounded-sm border px-3 py-2.5 text-left transition-all ${
              !unlocked
                ? "cursor-not-allowed border-nebula-border/50 bg-nebula-bg-darkest/40 opacity-60"
                : selected === def.id
                  ? "border-nebula-cyan bg-nebula-cyan-faint"
                  : "border-nebula-border hover:border-nebula-cyan-dim"
            }`}
          >
            <div className="font-tech text-xs uppercase tracking-wider text-nebula-text">
              {unlocked ? def.label : `🔒 ${def.label}`}
            </div>
            {!unlocked && remaining && (
              <div className="mt-0.5 font-tech text-[10px] tracking-wider text-nebula-orange">
                {remaining}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Câbler dans `app/avatar/page.tsx`**

Sous les sélecteurs d'espèce / rôle existants, ajouter une section « Armurerie » qui monte les quatre étagères plus la grille d'emblèmes (les badges de `state.badges`, non obtenus grisés). Construire le contexte depuis l'état :

```tsx
const unlockCtx: UnlockContext = {
  streak: state.liaison.streak,
  questsCompleted: state.questsCompleted,
  totalXp: state.totalXp,
  badges: state.badges,
  coursesComplete: cursusTermines,
  chaptersComplete: chapitresTermines,
};
```

`cursusTermines` et `chapitresTermines` se calculent avec `isChapterComplete` de `lib/user-store.ts` sur `COURSES_CATALOG` — même motif que `app/profil/page.tsx`.

Chaque `onSelect` appelle `setCosmetics({ [axe]: id })` et affiche l'erreur serveur le cas échéant.

- [ ] **Step 3 : Vérifier**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint`
Expected: PASS

- [ ] **Step 4 : Vérifier visuellement**

Ouvrir `/avatar` : les objets verrouillés doivent être visibles, grisés, cadenassés, avec leur distance restante. Cliquer un objet débloqué et confirmer qu'il est retenu après rechargement.

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat(armurerie): le rayon verrouille est visible, avec sa distance

Un rayon qu'on voit est une feuille de route. Un rayon cache n'existe pas.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11 : La célébration là où le travail a lieu

**Files:**
- Modify: `components/ui/CompletionScreen.tsx`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`

**Interfaces:**
- Consumes: `CompleteStepResponse.completedQuests`, `.newConductBadges`, `.newUnlocks`, `.notice` (T8)
- Produces: rien

- [ ] **Step 1 : Ajouter les props d'annonce à `CompletionScreen`**

```tsx
interface CompletionScreenProps {
  // … props existantes inchangées
  /** Libellés des ordres du jour accomplis par cette étape. */
  completedQuests?: string[];
  /** Ids de cosmétiques débloqués à l'instant. */
  newUnlocks?: string[];
  /** Message de liaison ponctuel (relais consommé, rupture). */
  notice?: string | null;
}
```

Et le bloc d'affichage, sous le récapitulatif d'XP existant :

```tsx
{completedQuests && completedQuests.length > 0 && (
  <div className="mt-4 rounded-sm border border-nebula-green-dim bg-nebula-bg-darkest/60 px-4 py-3 text-left">
    <div className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-green">
      Ordre du jour accompli
    </div>
    {completedQuests.map((label) => (
      <div key={label} className="font-body text-sm text-nebula-text-secondary">
        ✓ {label}
      </div>
    ))}
  </div>
)}

{notice && (
  <p className="mt-3 font-body text-sm text-nebula-orange">{notice}</p>
)}
```

- [ ] **Step 2 : Transmettre depuis `ChapterClient.tsx`**

Le résultat de `completeStep` est déjà capturé (`const result = await completeStep(...)`, ligne ~160). Stocker les nouveaux champs dans l'état local qui alimente `CompletionScreen`, et les passer en props.

- [ ] **Step 3 : Réutiliser `LevelUpOverlay` pour un déblocable**

Là où `ChapterClient` compare déjà `previousLevelRef` au nouveau niveau pour déclencher `LevelUpOverlay`, ajouter une branche : si `result.newUnlocks.length > 0`, afficher le même overlay avec le label du premier objet (`UNLOCKS.find(u => u.id === result.newUnlocks[0])?.label`). Une seule cérémonie par étape, jamais bloquante : le bouton de fermeture reste au premier plan.

- [ ] **Step 4 : Vérifier**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint && pnpm exec vitest run`
Expected: PASS

- [ ] **Step 5 : Vérifier visuellement**

Valider une étape dans un chapitre et confirmer que l'ordre accompli s'annonce sur l'écran de fin d'étape, sans passer par le dashboard.

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "feat(celebration): l'ordre accompli s'annonce ou l'etape se termine

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12 : Parcours end-to-end et vérification finale

**Files:**
- Create: `e2e/boucle-quotidienne.spec.ts`
- Modify: `e2e/*.spec.ts` existants si l'un d'eux touche la mission du jour

**Interfaces:**
- Consumes: tout
- Produces: rien

- [ ] **Step 1 : Chercher les tests e2e qui référencent l'ancien bouton**

Run: `grep -rn "Mission du jour\|daily" e2e/`
Expected: si un test clique « Récupérer le bonus », il doit être réécrit — le bouton n'existe plus.

- [ ] **Step 2 : Écrire le parcours**

Créer `e2e/boucle-quotidienne.spec.ts`. **Lire d'abord une spec existante qui visite `/dashboard`** pour reprendre son mécanisme d'authentification : `e2e/global-setup.ts` crée un utilisateur vérifié en base, mais chaque spec doit encore charger l'état de session comme le font les specs actuelles. Ne pas réinventer la connexion.

```ts
import { test, expect } from "@playwright/test";

test.describe("boucle quotidienne", () => {
  test("le briefing s'affiche et un ordre se valide en travaillant", async ({ page }) => {
    await page.goto("/dashboard");

    // Le bandeau de liaison est en tête de page.
    await expect(page.getByText(/jour.? de liaison/i)).toBeVisible();

    // Le briefing porte au moins un ordre.
    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    // Aller travailler.
    await page.getByRole("link", { name: /mission/i }).first().click();
    await expect(page).toHaveURL(/\/learn\//);
  });

  test("le bouton mission du jour a disparu", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /récupérer le bonus/i })).toHaveCount(0);
  });

  test("l'armurerie montre les objets verrouillés avec leur condition", async ({ page }) => {
    await page.goto("/avatar");
    await expect(page.getByText(/encore .* de liaison|encore .* ordre/i).first()).toBeVisible();
  });
});
```

- [ ] **Step 3 : Lancer la suite e2e**

Run: `pnpm exec playwright test`
Expected: PASS, y compris les 23 specs existantes.

- [ ] **Step 4 : Vérification finale complète**

Run: `pnpm exec vitest run && pnpm exec tsc --noEmit && pnpm exec eslint && pnpm exec playwright test`
Expected: tout vert. Reporter les chiffres réels, pas une affirmation.

- [ ] **Step 5 : Appliquer la migration en production**

**Uniquement après que tout le reste est vert**, et en connaissance du fait que `DATABASE_URL` pointe sur la base du site en ligne :

```bash
pnpm exec prisma migrate deploy
```

Vérifier ensuite qu'un compte existant conserve bien son `bestStreak` initialisé.

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "test(e2e): le parcours de la boucle quotidienne, de bout en bout

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Couverture de la spec

| Exigence de la spec | Tâche |
|---|---|
| Briefing de 3 ordres, tirage déterministe | T4 |
| Faisabilité sur l'état d'avant aujourd'hui | T4 (test dédié « le piège de la faisabilité ») |
| Barème 10/20/15 + 15, plafond 60 XP | T4 (test dédié) |
| Dégradé à moins de 3 ordres | T4 |
| Liaison : incrément, relais, rupture, record | T3 |
| Relais offert au 3ᵉ jour, plafond 2 | T3 |
| Badge « Le Retour » | T3 (`earnedReturn`) + T5 |
| Streak sur travail réel, plus sur visite | T7 (étape 5 : retrait de l'avancée dans `getUserState`) |
| Badges de conduite, catalogue séparé | T5 |
| `lastPerfectDay` / série de briefings | T1 (colonne) + T7 (règle) |
| 30 déblocables, 5 axes, zéro image | T6 |
| Rayon verrouillé visible avec distance | T6 (`remaining`) + T10 |
| Emblème choisi parmi les badges obtenus | T7 (`setCosmetics`) + T10 |
| Attribution automatique, pas de clic | T7 (dans la transaction de `completeStep`) |
| Célébration sur `CompletionScreen` | T11 |
| Fusion briefing / reprise de mission | T9 |
| Bandeau de liaison, 7 points, échéance | T9 |
| Carte de cadet + prochain déblocable | T9 |
| `XPBar` « LVL 1 » codé en dur | T9 (étape 6) |
| Grades de la Coalition, courbe de niveau | T2 |
| Colonnes, `UserUnlock`, index | T1 |
| `bestStreak` initialisé à la migration | T1 (étape 6) |
| `migrate deploy`, jamais `migrate dev` | T1 (étape 5) + T12 (étape 5) |
| Export RGPD complet | T7 (étape 8) |
| Suppression du bouton mission du jour | T7 (étape 8) + T9 (étape 7) |

## Ce que le plan ne fait pas

Conformément à la spec : pas de quêtes de maîtrise (aucune télémétrie d'indices), pas de rappels e-mail, pas de leaderboard hebdomadaire (documenté en annexe de la spec, ~½ jour, à arbitrer séparément), pas de monnaie, pas de saisons, pas d'image neuve.
