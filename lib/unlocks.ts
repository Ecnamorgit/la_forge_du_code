/**
 * Cosmetic unlocks. The avatar is a round, non-layered medallion
 * (components/avatar/AvatarBadge.tsx): an outfit would require regenerating
 * five images. So the chosen axes are CSS, text, or files already present
 * in public/.
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
  // Avatar frames (pure CSS)
  { id: "standard", axis: "frame", label: "Standard", condition: { kind: "default" } },
  { id: "double", axis: "frame", label: "Double anneau", condition: { kind: "streak", days: 5 } },
  { id: "pulse", axis: "frame", label: "Pulsé", condition: { kind: "quests", count: 10 } },
  { id: "orbital", axis: "frame", label: "Orbital", condition: { kind: "streak", days: 7 } },
  { id: "hex", axis: "frame", label: "Hexagonal", condition: { kind: "grade", gradeId: "lieutenant" } },
  { id: "corrompu", axis: "frame", label: "Corrompu", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "frame-amiral", axis: "frame", label: "Insigne d'Amiral", condition: { kind: "grade", gradeId: "amiral" } },

  // Titles (plain text)
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

  // Uniform colors: same ids as UNIFORM_COLORS (lib/avatar.ts), written to
  // the `uniformColor` column. `cyan` is free, the other four must be
  // earned.
  { id: "cyan", axis: "uniform", label: "Cyan", condition: { kind: "default" } },
  { id: "rouge-spectre", axis: "uniform", label: "Rouge Spectre", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "blanc-glacier", axis: "uniform", label: "Blanc glacier", condition: { kind: "streak", days: 14 } },
  { id: "rose-neon", axis: "uniform", label: "Rose néon", condition: { kind: "quests", count: 25 } },
  { id: "nebuleuse", axis: "uniform", label: "Dégradé nébuleuse", condition: { kind: "grade", gradeId: "capitaine" } },

  // Card backgrounds (files from public/)
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
  /** Ids of owned badges, course and conduct badges alike. */
  badges: string[];
  coursesComplete: number;
  chaptersComplete: number;
  /**
   * Ids of owned items (`UserUnlock` in the database, `UserState.unlocks` on
   * the client). `double`, `orbital` and `blanc-glacier` depend on the streak,
   * which drops back to 1 when it breaks: this list guarantees that an
   * obtained item never becomes locked again.
   */
  owned: string[];
}

export interface UnlockStatus {
  def: UnlockDef;
  unlocked: boolean;
  /** Remaining distance, ready to display. Null when the item is obtained. */
  remaining: string | null;
}

function gradeIndex(id: string): number {
  return GRADES.findIndex((g) => g.id === id);
}

/** Evaluates a condition and, if it is not met, says what is missing. */
function check(
  condition: UnlockCondition,
  ctx: UnlockContext
): { ok: boolean; remaining: string | null } {
  switch (condition.kind) {
    case "default":
      return { ok: true, remaining: null };
    case "streak": {
      const missing = condition.days - ctx.streak;
      return missing <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${missing} jour${missing > 1 ? "s" : ""} de liaison` };
    }
    case "quests": {
      const missing = condition.count - ctx.questsCompleted;
      return missing <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${missing} ordre${missing > 1 ? "s" : ""}` };
    }
    case "grade": {
      const reached = gradeIndex(gradeFromXp(ctx.totalXp).id);
      const targetIndex = gradeIndex(condition.gradeId);
      if (reached >= targetIndex) return { ok: true, remaining: null };
      const threshold = GRADES[targetIndex];
      return { ok: false, remaining: `grade ${threshold.label} (${threshold.threshold - ctx.totalXp} XP)` };
    }
    case "badge":
      return ctx.badges.includes(condition.badgeId)
        ? { ok: true, remaining: null }
        : { ok: false, remaining: "badge requis non obtenu" };
    case "xp": {
      const missing = condition.amount - ctx.totalXp;
      return missing <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${missing} XP` };
    }
    case "coursesComplete": {
      const missing = condition.count - ctx.coursesComplete;
      return missing <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${missing} cursus à terminer` };
    }
    case "chaptersComplete": {
      const missing = condition.count - ctx.chaptersComplete;
      return missing <= 0
        ? { ok: true, remaining: null }
        : { ok: false, remaining: `encore ${missing} chapitre${missing > 1 ? "s" : ""}` };
    }
  }
}

/**
 * Status of every unlock; locked ones carry their distance.
 * An item is obtained if it meets its condition or is already in
 * `ctx.owned`, even if the condition turns false again (broken liaison).
 */
export function evaluateUnlocks(ctx: UnlockContext): UnlockStatus[] {
  const ownedSet = new Set(ctx.owned);
  return UNLOCKS.map((def) => {
    const { ok, remaining } = check(def.condition, ctx);
    const unlocked = ok || ownedSet.has(def.id);
    return { def, unlocked, remaining: unlocked ? null : remaining };
  });
}

/**
 * Next item within reach, for the permanent line on the cadet card: the
 * locked item with the smallest measurable distance (days, orders, XP, rank,
 * chapters, courses). Badge conditions have no distance and come last;
 * among them, catalog order breaks the tie.
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
        const threshold = GRADES[gradeIndex(c.gradeId)];
        return (threshold.threshold - ctx.totalXp) / 100;
      }
      case "chaptersComplete":
        return (c.count - ctx.chaptersComplete) * 3;
      case "coursesComplete":
        return (c.count - ctx.coursesComplete) * 20;
      default:
        return Number.POSITIVE_INFINITY;
    }
  };

  const locked = evaluateUnlocks(ctx).filter((u) => !u.unlocked);
  if (locked.length === 0) return null;

  return locked.reduce((bestSoFar, current) =>
    distance(current.def.condition) < distance(bestSoFar.def.condition) ? current : bestSoFar
  );
}

/**
 * Cadet card artwork for each background in the catalog: the five
 * `planet-*-v2.png` files and the landing page's orange background, all in `public/`.
 */
export const CARD_BG_IMAGE: Record<string, string> = {
  "planet-green": "/planet-green-v2.png",
  "planet-red": "/planet-red-v2.png",
  "planet-gas": "/planet-gas-v2.png",
  "planet-ring": "/planet-ring-v2.png",
  "planet-dry": "/planet-dry-v2.png",
  "space-orange": "/space-background-orange.webp",
};

/**
 * Artwork file for the equipped background. Falls back to the default when
 * nothing is chosen (`null`) or the stored id is no longer in the catalog.
 */
export function cardBgImage(id: string | null): string {
  const chosen = id === null ? undefined : CARD_BG_IMAGE[id];
  return chosen ?? CARD_BG_IMAGE[defaultFor("cardBg").id];
}

/** Default item for an axis, worn until something is chosen. */
export function defaultFor(axis: UnlockAxis): UnlockDef {
  const def = UNLOCKS.find((u) => u.axis === axis && u.condition.kind === "default");
  if (!def) throw new Error(`Aucun défaut déclaré pour l'axe ${axis}`);
  return def;
}
