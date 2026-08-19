import "server-only";

import { prisma } from "@/lib/db";
import { getBadgeForChapter, getChaptersMeta } from "@/lib/courses-meta";
import { getChapterData } from "@/lib/courses-registry";
import { MAX_XP, xpForStep } from "@/lib/xp";
import { COURSES_CATALOG } from "@/lib/courses-catalog";
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Métadonnées de chapitres par cursus — constante, calculée une fois. */
const CHAPTERS_BY_COURSE: Record<string, { slug: string; totalSteps: number }[]> =
  Object.fromEntries(
    COURSES_CATALOG.map((c) => [
      c.slug,
      getChaptersMeta(c.slug).map((ch) => ({ slug: ch.slug, totalSteps: ch.totalSteps })),
    ])
  );

interface RawUserBundle {
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

async function fetchBundle(userId: string): Promise<RawUserBundle | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_BUNDLE_SELECT,
  });
  return user;
}

/**
 * Fetch the user state. Lecture pure : la liaison n'avance JAMAIS ici — elle
 * n'avance que sur travail réel, dans `completeStep`. Ouvrir un onglet ne
 * compte pas comme une journée active.
 * Returns null if the user doesn't exist.
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

  // Idempotent insert + atomic XP / badge logic
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

    // Clamp XP to MAX_XP if we overshot.
    if (user.totalXp > MAX_XP) {
      await tx.user.update({
        where: { id: userId },
        data: { totalXp: MAX_XP },
      });
      awardedXp = stepXp - (user.totalXp - MAX_XP);
    } else {
      awardedXp = stepXp;
    }

    // Chapter completion → badge
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
  });

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
 * Mark the first-login briefing as seen. Idempotent: only writes the timestamp
 * the first time, so we don't lose the original first-connect signal.
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
 * Save the user's avatar choices. Validates the 3 ids against the constant
 * lists, then writes them in a single update. Idempotent — calling it twice
 * with the same values is a no-op write.
 */
export async function setAvatar(
  userId: string,
  args: { species: string; uniformColor: string; role: string }
): Promise<UserState> {
  // Validation happens upstream in the route handler against the constants,
  // but we keep the assertUserExists guard for stale-JWT protection.
  await assertUserExists(userId);

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

/**
 * Mark a course as the user's current focus. Called on chapter page mount
 * so the dashboard's "Reprendre la mission" follows the user around even
 * before they complete a step.
 *
 * Idempotent: if the slug is already set, the write is a no-op cost-wise
 * (Prisma still issues an UPDATE, but the row content matches).
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

/**
 * RGPD — export des données personnelles de l'utilisateur (droit d'accès /
 * portabilité). Retourne le profil + badges + progression sous forme sérialisable.
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
 * RGPD — suppression définitive du compte (droit à l'effacement). Le `onDelete:
 * Cascade` du schéma supprime comptes, sessions, badges, progression et tokens.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await assertUserExists(userId);
  await prisma.user.delete({ where: { id: userId } });
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
