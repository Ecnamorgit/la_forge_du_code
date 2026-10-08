/**
 * Déblocables cosmétiques. L'avatar est un médaillon rond non composé
 * (components/avatar/AvatarBadge.tsx) : une tenue demanderait de régénérer
 * cinq images. Les axes retenus sont donc du CSS, du texte ou des fichiers
 * déjà présents dans public/.
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
  // Cadres d'avatar (CSS pur)
  { id: "standard", axis: "frame", label: "Standard", condition: { kind: "default" } },
  { id: "double", axis: "frame", label: "Double anneau", condition: { kind: "streak", days: 5 } },
  { id: "pulse", axis: "frame", label: "Pulsé", condition: { kind: "quests", count: 10 } },
  { id: "orbital", axis: "frame", label: "Orbital", condition: { kind: "streak", days: 7 } },
  { id: "hex", axis: "frame", label: "Hexagonal", condition: { kind: "grade", gradeId: "lieutenant" } },
  { id: "corrompu", axis: "frame", label: "Corrompu", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "frame-amiral", axis: "frame", label: "Insigne d'Amiral", condition: { kind: "grade", gradeId: "amiral" } },

  // Titres (texte pur)
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

  // Couleurs d'uniforme : mêmes identifiants que UNIFORM_COLORS (lib/avatar.ts),
  // écrits dans la colonne `uniformColor`. `cyan` est offerte, les quatre
  // autres se méritent.
  { id: "cyan", axis: "uniform", label: "Cyan", condition: { kind: "default" } },
  { id: "rouge-spectre", axis: "uniform", label: "Rouge Spectre", condition: { kind: "badge", badgeId: "security-shield" } },
  { id: "blanc-glacier", axis: "uniform", label: "Blanc glacier", condition: { kind: "streak", days: 14 } },
  { id: "rose-neon", axis: "uniform", label: "Rose néon", condition: { kind: "quests", count: 25 } },
  { id: "nebuleuse", axis: "uniform", label: "Dégradé nébuleuse", condition: { kind: "grade", gradeId: "capitaine" } },

  // Fonds de carte (fichiers de public/)
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
  /** Ids de badges possédés, cursus et conduite confondus. */
  badges: string[];
  coursesComplete: number;
  chaptersComplete: number;
  /**
   * Ids des objets possédés (`UserUnlock` en base, `UserState.unlocks` côté
   * client). `double`, `orbital` et `blanc-glacier` dépendent du streak, qui
   * retombe à 1 à la rupture : cette liste garantit qu'un objet obtenu ne
   * redevient jamais verrouillé.
   */
  owned: string[];
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
 * Statut de tous les déblocables ; les verrouillés portent leur distance.
 * Un objet est obtenu s'il satisfait sa condition ou figure déjà dans
 * `ctx.owned`, même si la condition redevient fausse (rupture de liaison).
 */
export function evaluateUnlocks(ctx: UnlockContext): UnlockStatus[] {
  const possede = new Set(ctx.owned);
  return UNLOCKS.map((def) => {
    const { ok, remaining } = check(def.condition, ctx);
    const unlocked = ok || possede.has(def.id);
    return { def, unlocked, remaining: unlocked ? null : remaining };
  });
}

/**
 * Prochain objet à portée, pour la ligne permanente de la carte de cadet :
 * l'objet verrouillé dont la distance mesurable (jours, ordres, XP, grade,
 * chapitres, cursus) est la plus petite. Les conditions de badge n'ont pas de
 * distance et passent après ; entre elles, l'ordre du catalogue tranche.
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

/**
 * Décor de la carte de cadet pour chaque fond du catalogue : les cinq
 * `planet-*-v2.png` et le fond orange de la landing, tous dans `public/`.
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
 * Fichier de décor du fond porté. Retombe sur le fond par défaut quand rien
 * n'est choisi (`null`) ou que l'identifiant stocké n'est plus au catalogue.
 */
export function cardBgImage(id: string | null): string {
  const choisi = id === null ? undefined : CARD_BG_IMAGE[id];
  return choisi ?? CARD_BG_IMAGE[defaultFor("cardBg").id];
}

/** Objet par défaut d'un axe, porté tant que rien n'a été choisi. */
export function defaultFor(axis: UnlockAxis): UnlockDef {
  const def = UNLOCKS.find((u) => u.axis === axis && u.condition.kind === "default");
  if (!def) throw new Error(`Aucun défaut déclaré pour l'axe ${axis}`);
  return def;
}
