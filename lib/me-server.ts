import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { getBadgeForChapter, getChaptersMeta } from "@/lib/courses-meta";
import { getChapterData } from "@/lib/courses-registry";
import { checkStepOrder } from "@/lib/step-order";
import { MAX_XP, xpForStep } from "@/lib/xp";
import { COURSES_CATALOG } from "@/lib/courses-catalog";
import { evaluateConductBadges } from "@/lib/conduct-badges";
import {
  applyBriefingPayout,
  buildBriefing,
  splitCompletions,
  type CompletionRecord,
} from "@/lib/quests";
import { advanceLiaison } from "@/lib/streak";
import { evaluateUnlocks, UNLOCKS, type UnlockAxis } from "@/lib/unlocks";
import { isBaseUniformColorId } from "@/lib/avatar";
import type { LiaisonPublic, UserState } from "@/lib/user-store";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Métadonnées de chapitres par cursus, calculées une fois. */
const CHAPTERS_BY_COURSE: Record<string, { slug: string; totalSteps: number }[]> =
  Object.fromEntries(
    COURSES_CATALOG.map((c) => [
      c.slug,
      getChaptersMeta(c.slug).map((ch) => ({ slug: ch.slug, totalSteps: ch.totalSteps })),
    ])
  );

interface RawUserBundle {
  /**
   * Graine du tirage du briefing. Le pseudo est renommable : s'en servir
   * changerait les ordres en cours de journée alors que le masque de paiement
   * reste celui du jour, et le nouvel ordre tiré ne pourrait plus être payé.
   */
  id: string;
  username: string;
  totalXp: number;
  streak: number;
  bestStreak: number;
  streakShields: number;
  shieldEverGranted: boolean;
  questsCompleted: number;
  perfectBriefingRun: number;
  lastPerfectDay: string;
  dailyClaimed: number;
  lastVisit: string;
  lastDailyMission: string;
  lastVisitedCourse: string | null;
  joinedAt: Date;
  onboardedAt: Date | null;
  species: string | null;
  uniformColor: string | null;
  role: string | null;
  frame: string | null;
  title: string | null;
  emblem: string | null;
  cardBg: string | null;
  badges: { badgeId: string }[];
  unlocks: { itemId: string }[];
  stepCompletions: {
    course: string;
    chapter: string;
    stepIndex: number;
    completedAt: Date;
  }[];
}

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

  // Projection sans persistance : ce qui arriverait si le cadet validait une
  // étape maintenant. Sans elle, un cadet absent cinq jours verrait encore son
  // ancienne série. On rejoue `advanceLiaison` pour ne pas dupliquer la règle
  // des relais (lib/streak.ts).
  const projection = advanceLiaison(
    {
      streak: bundle.streak,
      bestStreak: bundle.bestStreak,
      shields: bundle.streakShields,
      shieldEverGranted: bundle.shieldEverGranted,
      lastActiveDay: bundle.lastVisit,
    },
    today
  );

  const liaison: LiaisonPublic = {
    streak: bundle.streak,
    bestStreak: bundle.bestStreak,
    shields: bundle.streakShields,
    week: weekDots(records, today),
    activeToday: bundle.lastVisit === today,
    wouldBreakToday: projection.broken,
  };

  return {
    username: bundle.username,
    totalXp: bundle.totalXp,
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
      userId: bundle.id,
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

const USER_BUNDLE_SELECT = {
  id: true,
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

async function fetchBundle(userId: string): Promise<RawUserBundle | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_BUNDLE_SELECT,
  });
  return user;
}

/**
 * Lecture pure : la liaison n'avance que dans `completeStep`, sur une étape
 * validée. Ouvrir un onglet ne compte pas comme une journée active.
 * Renvoie null si l'utilisateur n'existe pas.
 */
export async function getUserState(userId: string): Promise<UserState | null> {
  const bundle = await fetchBundle(userId);
  if (!bundle) return null;
  return shape(bundle);
}

export class UserNotFoundError extends Error {}
export class UsernameTakenError extends Error {}
export class InvalidUsernameError extends Error {}
export class InvalidStepError extends Error {}
/** Étape demandée avant la précédente (lib/step-order.ts) : message affichable. */
export class StepOrderError extends Error {}

async function assertUserExists(userId: string): Promise<void> {
  const exists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) {
    throw new UserNotFoundError(
      "Compte introuvable. La session est obsolete, reconnecte-toi."
    );
  }
}

const USERNAME_RE = /^[a-zA-Z0-9_-]+$/;

export async function renameUser(
  userId: string,
  rawName: string
): Promise<UserState> {
  const username = rawName.trim();
  if (username.length < 2 || username.length > 16 || !USERNAME_RE.test(username)) {
    throw new InvalidUsernameError("2 à 16 caractères, lettres, chiffres, _ et -");
  }

  await assertUserExists(userId);

  const conflict = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } },
    select: { id: true },
  });
  if (conflict) throw new UsernameTakenError("Ce pseudo est déjà pris");

  await prisma.user.update({ where: { id: userId }, data: { username } });

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}

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

/**
 * Délais de la transaction de `completeStep` (5 s par défaut chez Prisma).
 * Elle fait une vingtaine d'allers-retours vers une base distante, et un
 * `P2028` annulerait aussi la `StepCompletion` : le cadet perdrait son étape.
 * `maxWait` couvre l'attente d'une connexion du pool, `timeout` l'exécution.
 */
const COMPLETE_STEP_TX_OPTIONS = { maxWait: 10_000, timeout: 30_000 } as const;

export async function completeStep(
  userId: string,
  course: string,
  chapter: string,
  stepIndex: number
): Promise<CompleteStepResult> {
  const chapterData = await getChapterData(course, chapter);
  if (!chapterData) throw new InvalidStepError("Chapitre inconnu");
  if (stepIndex < 0 || stepIndex >= chapterData.steps.length) {
    throw new InvalidStepError("Index d'étape invalide");
  }

  await assertUserExists(userId);

  const objectivesCount = chapterData.steps[stepIndex].objectives.length;
  const stepXp = xpForStep(objectivesCount);
  const totalSteps = chapterData.steps.length;
  const badgeForChapter = getBadgeForChapter(course, chapter);

  // Insertion idempotente, XP et badge dans la même transaction.
  let awardedXp = 0;
  let newBadge: string | null = null;
  let alreadyDone = false;
  let questXp = 0;
  let completedQuests: string[] = [];
  const newConductBadges: string[] = [];
  const newUnlocks: string[] = [];
  let notice: string | null = null;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.stepCompletion.findUnique({
      where: {
        userId_course_chapter_stepIndex: {
          userId,
          course,
          chapter,
          stepIndex,
        },
      },
      select: { id: true },
    });

    if (existing) {
      alreadyDone = true;
      return;
    }

    // Ordre de progression (audit EXE-01) : vérifié après le test
    // d'idempotence, pour qu'une étape déjà faite reste une réponse normale,
    // et dans la transaction, sur les complétions qu'elle voit.
    const faites = await tx.stepCompletion.findMany({
      where: { userId, course },
      select: { chapter: true, stepIndex: true },
    });
    const ordre = checkStepOrder(CHAPTERS_BY_COURSE[course] ?? [], faites, chapter, stepIndex);
    if (!ordre.ok) throw new StepOrderError(ordre.reason);

    await tx.stepCompletion.create({
      data: { userId, course, chapter, stepIndex },
    });

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: stepXp },
        lastVisitedCourse: course,
      },
      select: { totalXp: true },
    });

    // Plafonne l'XP à MAX_XP.
    if (user.totalXp > MAX_XP) {
      await tx.user.update({
        where: { id: userId },
        data: { totalXp: MAX_XP },
      });
      awardedXp = stepXp - (user.totalXp - MAX_XP);
    } else {
      awardedXp = stepXp;
    }

    // Chapitre terminé : badge.
    if (badgeForChapter) {
      const doneCount = await tx.stepCompletion.count({
        where: { userId, course, chapter },
      });
      if (doneCount >= totalSteps) {
        const existingBadge = await tx.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badgeForChapter } },
          select: { id: true },
        });
        if (!existingBadge) {
          await tx.userBadge.create({
            data: { userId, badgeId: badgeForChapter },
          });
          newBadge = badgeForChapter;
        }
      }
    }

    // Boucle quotidienne : liaison, ordres, badges de conduite.
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
      },
    });
    if (!brut) throw new UserNotFoundError();

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
      // Identifiant de compte, jamais le pseudo : cf. `RawUserBundle.id`.
      userId,
      todayIso: jour,
      past,
      today: todayRecords,
      chaptersByCourse: CHAPTERS_BY_COURSE,
    });

    // L'arithmétique du versement (bits, bonus de clôture, série de briefings
    // parfaits, remise à zéro du masque) vit dans `applyBriefingPayout`, pure
    // et testée : ce module importe `server-only` et échappe à vitest.
    const versement = applyBriefingPayout(
      briefing,
      {
        claimedMask: brut.dailyClaimed,
        claimedDay: brut.lastDailyMission,
        perfectRun: brut.perfectBriefingRun,
        lastPerfectDay: brut.lastPerfectDay,
      },
      jour
    );

    // La liaison avance sans condition : on n'arrive ici que pour une étape
    // nouvelle (la transaction sort plus haut si `alreadyDone`). Le déclencheur
    // est l'étape et non l'ordre accompli : un ordre peut demander plusieurs
    // étapes, et un cadet qui n'en fait qu'une a quand même travaillé.
    // `advanceLiaison` est idempotente sur la journée.
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

    const questsCompletedApres = brut.questsCompleted + versement.questsPaid;
    const xpApres = Math.min(brut.totalXp + versement.bonusXp, MAX_XP);

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: xpApres,
        dailyClaimed: versement.nextMask,
        lastDailyMission: jour,
        questsCompleted: questsCompletedApres,
        perfectBriefingRun: versement.perfectRun,
        lastPerfectDay: versement.lastPerfectDay,
        streak: liaisonApres.streak,
        bestStreak: liaisonApres.bestStreak,
        streakShields: liaisonApres.shields,
        shieldEverGranted: liaisonApres.shieldEverGranted,
        lastVisit: liaisonApres.lastActiveDay,
      },
    });

    awardedXp += xpApres - brut.totalXp;
    questXp = xpApres - brut.totalXp;
    // Seuls les ordres payés à cet instant : filtrer `briefing.quests` sur
    // `done` réannoncerait les ordres déjà payés plus tôt dans la journée.
    completedQuests = versement.paidLabels;

    if (transition.shieldsConsumed) {
      notice = `Un relais de secours a couvert ton absence. Il t'en reste ${liaisonApres.shields}.`;
    } else if (transition.broken) {
      notice = `Liaison rompue. Ton record de ${liaisonApres.bestStreak} jours reste acquis.`;
    }

    // Badges de conduite mérités mais non encore attribués.
    const merites = evaluateConductBadges({
      streak: liaisonApres.streak,
      questsCompleted: questsCompletedApres,
      perfectBriefingRun: versement.perfectRun,
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

    const dejaDebloques = new Set(
      (await tx.userUnlock.findMany({ where: { userId }, select: { itemId: true } })).map(
        (u) => u.itemId
      )
    );
    const statuts = evaluateUnlocks({
      streak: liaisonApres.streak,
      questsCompleted: questsCompletedApres,
      totalXp: xpApres,
      badges: [...dejaLa, ...merites],
      coursesComplete: cursusFinis,
      chaptersComplete: chapitresFinis,
      owned: [...dejaDebloques],
    });
    for (const s of statuts) {
      // Les objets par défaut sont acquis d'office et `setCosmetics` les
      // accepte sans ligne en base : leur créer un `UserUnlock` les ferait
      // annoncer comme nouveaux déblocables.
      if (!s.unlocked || s.def.condition.kind === "default") continue;
      if (dejaDebloques.has(s.def.id)) continue;
      await tx.userUnlock.create({ data: { userId, itemId: s.def.id } });
      newUnlocks.push(s.def.id);
    }
  }, COMPLETE_STEP_TX_OPTIONS);

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();

  return {
    state,
    awardedXp,
    newBadge,
    alreadyDone,
    questXp,
    completedQuests,
    newConductBadges,
    newUnlocks,
    notice,
  };
}

/**
 * Marque le briefing de première connexion comme vu. Idempotent : la date
 * n'est écrite que la première fois.
 */
export async function markOnboarded(userId: string): Promise<UserState> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardedAt: true },
  });
  if (!current) {
    throw new UserNotFoundError(
      "Compte introuvable. La session est obsolete, reconnecte-toi."
    );
  }
  if (!current.onboardedAt) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardedAt: new Date() },
    });
  }

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}

export class InvalidAvatarError extends Error {}

/**
 * Enregistre l'avatar. Espèce et rôle sont validés dans la route contre des
 * listes constantes. La couleur d'uniforme se vérifie ici : les couleurs
 * méritées (catalogue `UNLOCKS`, axe `uniform`) exigent une garde de
 * possession, qui dépend de l'utilisateur.
 */
export async function setAvatar(
  userId: string,
  args: { species: string; uniformColor: string; role: string }
): Promise<UserState> {
  await assertUserExists(userId);

  if (!isBaseUniformColorId(args.uniformColor)) {
    // Couleur méritée : acceptée seulement si le cadet possède le déblocage,
    // même garde que `setCosmetics` (axe "uniform").
    const def = UNLOCKS.find((u) => u.id === args.uniformColor && u.axis === "uniform");
    if (!def) {
      throw new InvalidAvatarError("Couleur d'uniforme invalide");
    }
    if (def.condition.kind !== "default") {
      const owned = await prisma.userUnlock.findFirst({
        where: { userId, itemId: args.uniformColor },
        select: { id: true },
      });
      if (!owned) {
        throw new InvalidAvatarError("Cette couleur n'est pas débloquée");
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      species: args.species,
      uniformColor: args.uniformColor,
      role: args.role,
    },
  });

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}

export class InvalidCosmeticError extends Error {}

/**
 * Emplacements cosmétiques acceptés et colonne écrite pour chacun ; cette
 * table sert de liste blanche. `uniform` écrit `uniformColor`, la colonne de
 * l'avatar : un seul espace d'identifiants pour les couleurs (cf. lib/avatar.ts).
 */
const COSMETIC_SLOTS: {
  key: "frame" | "title" | "cardBg" | "uniform";
  axis: UnlockAxis;
  column: "frame" | "title" | "cardBg" | "uniformColor";
}[] = [
  { key: "frame", axis: "frame", column: "frame" },
  { key: "title", axis: "title", column: "title" },
  { key: "cardBg", axis: "cardBg", column: "cardBg" },
  { key: "uniform", axis: "uniform", column: "uniformColor" },
];

export interface CosmeticChoices {
  frame?: string;
  title?: string;
  emblem?: string;
  cardBg?: string;
  uniform?: string;
}

/**
 * Enregistre les cosmétiques portés. Refuse tout objet que le cadet n'a pas
 * débloqué : la validation se fait côté serveur.
 */
export async function setCosmetics(
  userId: string,
  choices: CosmeticChoices
): Promise<UserState> {
  await assertUserExists(userId);

  const [unlocks, badges] = await Promise.all([
    prisma.userUnlock.findMany({ where: { userId }, select: { itemId: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const possede = new Set(unlocks.map((u) => u.itemId));
  const badgesPossedes = new Set(badges.map((b) => b.badgeId));

  // Objet de mise à jour construit clé par clé : passer `choices` tel quel à
  // Prisma laisserait une route qui relaie le corps JSON brut écrire n'importe
  // quelle colonne de `User`, `totalXp` compris.
  const data: {
    frame?: string;
    title?: string;
    cardBg?: string;
    uniformColor?: string;
    emblem?: string;
  } = {};

  for (const slot of COSMETIC_SLOTS) {
    const id = choices[slot.key];
    if (id === undefined) continue;

    const def = UNLOCKS.find((u) => u.id === id);
    if (!def) throw new InvalidCosmeticError("Objet inconnu");
    // L'objet doit appartenir à l'axe de l'emplacement visé : sans ce test, un
    // fond de carte débloqué pourrait être porté comme cadre d'avatar.
    if (def.axis !== slot.axis) {
      throw new InvalidCosmeticError("Cet objet n'appartient pas à cet emplacement");
    }
    if (def.condition.kind !== "default" && !possede.has(id)) {
      throw new InvalidCosmeticError("Cet objet n'est pas débloqué");
    }
    data[slot.column] = id;
  }

  if (choices.emblem !== undefined) {
    if (!badgesPossedes.has(choices.emblem)) {
      throw new InvalidCosmeticError("Ce badge n'est pas obtenu");
    }
    data.emblem = choices.emblem;
  }

  if (Object.keys(data).length > 0) {
    await prisma.user.update({ where: { id: userId }, data });
  }

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}

/**
 * Mémorise le cursus en cours. Appelé à l'ouverture d'une page de chapitre,
 * pour que « Reprendre la mission » suive le cadet avant même qu'il valide
 * une étape.
 */
export async function markCourseVisited(
  userId: string,
  course: string
): Promise<UserState> {
  await assertUserExists(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { lastVisitedCourse: course },
  });

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}

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

/**
 * RGPD : export des données personnelles (droit d'accès et portabilité).
 * Profil, badges et progression sous forme sérialisable.
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      username: true,
      name: true,
      emailVerified: true,
      joinedAt: true,
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
      onboardedAt: true,
      species: true,
      uniformColor: true,
      role: true,
      frame: true,
      title: true,
      emblem: true,
      cardBg: true,
      badges: { select: { badgeId: true, unlockedAt: true } },
      unlocks: { select: { itemId: true, unlockedAt: true } },
      stepCompletions: {
        select: { course: true, chapter: true, stepIndex: true, completedAt: true },
      },
    },
  });
  if (!user) throw new UserNotFoundError();
  return { exportedAt: new Date().toISOString(), account: user };
}

/**
 * RGPD : suppression définitive du compte (droit à l'effacement). Le `onDelete:
 * Cascade` du schéma supprime comptes, sessions, badges, progression et tokens.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await assertUserExists(userId);
  await prisma.user.delete({ where: { id: userId } });
}

/**
 * Vérifie le mot de passe avant une action irréversible comme la suppression
 * du compte (audit SRV-09). Même comparaison que la connexion (`auth.ts`).
 */
export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) throw new UserNotFoundError();
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
}

export async function resetProgress(userId: string): Promise<UserState> {
  await assertUserExists(userId);

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

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}
