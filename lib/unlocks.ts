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

  // --- Couleurs d'uniforme -------------------------------------------
  // Les identifiants sont ceux de UNIFORM_COLORS dans lib/avatar.ts, et la
  // colonne écrite est `uniformColor` : un seul espace d'identifiants pour les
  // couleurs, sinon ces objets seraient invendables (aucune colonne ne les
  // accepterait). `cyan` est la couleur offerte, les quatre autres se méritent.
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
  /**
   * Ids des objets RÉELLEMENT possédés (`UserUnlock` en base, `UserState.unlocks`
   * côté client).
   *
   * Trois conditions du catalogue sont réversibles — `double` (5 j), `orbital`
   * (7 j) et `blanc-glacier` (14 j) dépendent du streak, qui retombe à 1 à la
   * rupture. Sans cette liste, un cadet qui a porté « Blanc glacier » pendant
   * un mois le verrait reverrouillé au premier jour manqué, sur une couleur
   * qu'il porte encore à l'écran. La règle de la spec est non négociable : un
   * objet OBTENU ne redevient jamais verrouillé.
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
 * Statut de tous les déblocables. Les verrouillés portent leur distance :
 * un rayon qu'on voit est une feuille de route, un rayon caché n'existe pas.
 *
 * Un objet est obtenu s'il satisfait sa condition OU s'il figure déjà dans
 * `ctx.owned` : la possession est acquise pour toujours, même quand la
 * condition qui l'a produite redevient fausse (rupture de liaison).
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
 * Le prochain objet à portée, pour la ligne permanente de la carte de cadet.
 *
 * Les objets déjà possédés en sont exclus : `evaluateUnlocks` les rend
 * `unlocked`, et proposer au cadet ce qu'il a déjà serait une fausse piste.
 *
 * Rend l'objet verrouillé dont la distance mesurable (jours, ordres, XP, grade, chapitres, cursus)
 * est la plus petite. Les conditions de type badge n'ont pas de distance numérique : elles se classent
 * après tout objet mesurable, à égalité entre elles. Quand seuls des objets à badge restent verrouillés,
 * c'est l'ordre de déclaration du catalogue qui tranche — comportement stable et voulu.
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
 * Décor de la carte de cadet pour chaque fond du catalogue.
 *
 * Les six fichiers existent déjà dans `public/` (contrainte fondatrice : aucune
 * image neuve). Les cinq planètes sont les `planet-*-v2.png` livrées ; le
 * dernier fond réutilise le fond d'écran orange de la landing.
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
 * Fichier de décor à afficher pour le fond porté. Retombe sur le fond par
 * défaut du catalogue quand le cadet n'a rien choisi (`null`) — ou quand
 * l'identifiant stocké n'est plus au catalogue.
 */
export function cardBgImage(id: string | null): string {
  const choisi = id === null ? undefined : CARD_BG_IMAGE[id];
  return choisi ?? CARD_BG_IMAGE[defaultFor("cardBg").id];
}

/** L'objet par défaut d'un axe, porté tant que rien n'a été choisi. */
export function defaultFor(axis: UnlockAxis): UnlockDef {
  const def = UNLOCKS.find((u) => u.axis === axis && u.condition.kind === "default");
  if (!def) throw new Error(`Aucun défaut déclaré pour l'axe ${axis}`);
  return def;
}
