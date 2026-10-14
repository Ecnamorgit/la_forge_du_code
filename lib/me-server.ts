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

/** Chapter metadata per course, computed once. */
const CHAPTERS_BY_COURSE: Record<string, { slug: string; totalSteps: number }[]> =
  Object.fromEntries(
    COURSES_CATALOG.map((c) => [
      c.slug,
      getChaptersMeta(c.slug).map((ch) => ({ slug: ch.slug, totalSteps: ch.totalSteps })),
    ])
  );

interface RawUserBundle {
  /**
   * Seed for the briefing draw. The username can be renamed: seeding with it
   * would change the orders mid-day while the payout mask stays the one for
   * the day, and the newly drawn order could no longer be paid out.
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

/** The last 7 days: one boolean per day, oldest to most recent. */
function weekDots(records: CompletionRecord[], todayIso: string): boolean[] {
  const days = new Set(records.map((r) => r.completedAt.slice(0, 10)));
  const dots: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const t = Date.parse(`${todayIso}T00:00:00Z`) - i * 86_400_000;
    dots.push(days.has(new Date(t).toISOString().slice(0, 10)));
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

  // Projection without persistence: what would happen if the cadet completed
  // a step now. Without it, a cadet away for five days would still see their
  // old streak. We replay `advanceLiaison` so the relay rule is not
  // duplicated (lib/streak.ts).
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
 * Pure read: the liaison only advances in `completeStep`, on a completed
 * step. Opening a tab does not count as an active day.
 * Returns null if the user does not exist.
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
/** Step requested before the previous one (lib/step-order.ts): displayable message. */
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
  /** XP paid out by the daily orders, included in awardedXp. */
  questXp: number;
  completedQuests: string[];
  newConductBadges: string[];
  newUnlocks: string[];
  /** Liaison message to show once (relay consumed, streak broken). */
  notice: string | null;
}

/**
 * Timeouts for the `completeStep` transaction (Prisma defaults to 5 s).
 * It makes about twenty round trips to a remote database, and a `P2028`
 * would also roll back the `StepCompletion`: the cadet would lose their step.
 * `maxWait` covers waiting for a pool connection, `timeout` the execution.
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

  // Idempotent insert, XP and badge in the same transaction.
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

    // Progression order (audit EXE-01): checked after the idempotency test,
    // so an already completed step stays a normal response, and inside the
    // transaction, against the completions it sees.
    const completed = await tx.stepCompletion.findMany({
      where: { userId, course },
      select: { chapter: true, stepIndex: true },
    });
    const orderCheck = checkStepOrder(CHAPTERS_BY_COURSE[course] ?? [], completed, chapter, stepIndex);
    if (!orderCheck.ok) throw new StepOrderError(orderCheck.reason);

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

    // Caps XP at MAX_XP.
    if (user.totalXp > MAX_XP) {
      await tx.user.update({
        where: { id: userId },
        data: { totalXp: MAX_XP },
      });
      awardedXp = stepXp - (user.totalXp - MAX_XP);
    } else {
      awardedXp = stepXp;
    }

    // Chapter finished: badge.
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

    // Daily loop: liaison, orders, conduct badges.
    const today = todayIso();

    const rawUser = await tx.user.findUnique({
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
    if (!rawUser) throw new UserNotFoundError();

    const allCompletions = await tx.stepCompletion.findMany({
      where: { userId },
      select: { course: true, chapter: true, stepIndex: true, completedAt: true },
    });
    const records: CompletionRecord[] = allCompletions.map((r) => ({
      course: r.course,
      chapter: r.chapter,
      stepIndex: r.stepIndex,
      completedAt: r.completedAt.toISOString(),
    }));
    const { past, today: todayRecords } = splitCompletions(records, today);

    const briefing = buildBriefing({
      // Account id, never the username: see `RawUserBundle.id`.
      userId,
      todayIso: today,
      past,
      today: todayRecords,
      chaptersByCourse: CHAPTERS_BY_COURSE,
    });

    // The payout arithmetic (bits, completion bonus, perfect briefing streak,
    // mask reset) lives in `applyBriefingPayout`, which is pure and tested:
    // this module imports `server-only` and cannot run under vitest.
    const payout = applyBriefingPayout(
      briefing,
      {
        claimedMask: rawUser.dailyClaimed,
        claimedDay: rawUser.lastDailyMission,
        perfectRun: rawUser.perfectBriefingRun,
        lastPerfectDay: rawUser.lastPerfectDay,
      },
      today
    );

    // The liaison advances unconditionally: we only get here for a new step
    // (the transaction exits earlier if `alreadyDone`). The trigger is the
    // step, not a fulfilled order: an order can require several
    // steps, and a cadet who does only one has still put in the work.
    // `advanceLiaison` is idempotent within a day.
    const transition = advanceLiaison(
      {
        streak: rawUser.streak,
        bestStreak: rawUser.bestStreak,
        shields: rawUser.streakShields,
        shieldEverGranted: rawUser.shieldEverGranted,
        lastActiveDay: rawUser.lastVisit,
      },
      today
    );

    const liaisonAfter = transition.next;

    const questsCompletedAfter = rawUser.questsCompleted + payout.questsPaid;
    const xpAfter = Math.min(rawUser.totalXp + payout.bonusXp, MAX_XP);

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: xpAfter,
        dailyClaimed: payout.nextMask,
        lastDailyMission: today,
        questsCompleted: questsCompletedAfter,
        perfectBriefingRun: payout.perfectRun,
        lastPerfectDay: payout.lastPerfectDay,
        streak: liaisonAfter.streak,
        bestStreak: liaisonAfter.bestStreak,
        streakShields: liaisonAfter.shields,
        shieldEverGranted: liaisonAfter.shieldEverGranted,
        lastVisit: liaisonAfter.lastActiveDay,
      },
    });

    awardedXp += xpAfter - rawUser.totalXp;
    questXp = xpAfter - rawUser.totalXp;
    // Only the orders paid out right now: filtering `briefing.quests` on
    // `done` would re-announce orders already paid out earlier in the day.
    completedQuests = payout.paidLabels;

    if (transition.shieldsConsumed) {
      notice = `Un relais de secours a couvert ton absence. Il t'en reste ${liaisonAfter.shields}.`;
    } else if (transition.broken) {
      notice = `Liaison rompue. Ton record de ${liaisonAfter.bestStreak} jours reste acquis.`;
    }

    // Conduct badges earned but not yet awarded.
    const earnedConductBadges = evaluateConductBadges({
      streak: liaisonAfter.streak,
      questsCompleted: questsCompletedAfter,
      perfectBriefingRun: payout.perfectRun,
      completions: records,
      justReturned: transition.earnedReturn,
    });
    const alreadyOwned = new Set(
      (await tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map(
        (b) => b.badgeId
      )
    );
    for (const id of earnedConductBadges) {
      if (alreadyOwned.has(id)) continue;
      await tx.userBadge.create({ data: { userId, badgeId: id } });
      newConductBadges.push(id);
    }

    // Newly reached cosmetic unlocks.
    const chaptersFinished = Object.entries(CHAPTERS_BY_COURSE).reduce(
      (n, [course, courseChapters]) =>
        n +
        courseChapters.filter(
          (ch) =>
            records.filter((r) => r.course === course && r.chapter === ch.slug).length >=
            ch.totalSteps
        ).length,
      0
    );
    const coursesFinished = Object.entries(CHAPTERS_BY_COURSE).filter(([course, courseChapters]) =>
      courseChapters.every(
        (ch) =>
          records.filter((r) => r.course === course && r.chapter === ch.slug).length >=
          ch.totalSteps
      )
    ).length;

    const alreadyUnlocked = new Set(
      (await tx.userUnlock.findMany({ where: { userId }, select: { itemId: true } })).map(
        (u) => u.itemId
      )
    );
    const unlockStatuses = evaluateUnlocks({
      streak: liaisonAfter.streak,
      questsCompleted: questsCompletedAfter,
      totalXp: xpAfter,
      badges: [...alreadyOwned, ...earnedConductBadges],
      coursesComplete: coursesFinished,
      chaptersComplete: chaptersFinished,
      owned: [...alreadyUnlocked],
    });
    for (const s of unlockStatuses) {
      // Default items are owned automatically and `setCosmetics` accepts
      // them without a database row: creating a `UserUnlock` for them would
      // announce them as new unlocks.
      if (!s.unlocked || s.def.condition.kind === "default") continue;
      if (alreadyUnlocked.has(s.def.id)) continue;
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
 * Marks the first-login briefing as seen. Idempotent: the date is only
 * written the first time.
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
 * Saves the avatar. Species and role are validated in the route against
 * constant lists. The uniform color is checked here: earned colors
 * (`UNLOCKS` catalog, `uniform` axis) require an ownership guard, which
 * depends on the user.
 */
export async function setAvatar(
  userId: string,
  args: { species: string; uniformColor: string; role: string }
): Promise<UserState> {
  await assertUserExists(userId);

  if (!isBaseUniformColorId(args.uniformColor)) {
    // Earned color: accepted only if the cadet owns the unlock,
    // same guard as `setCosmetics` ("uniform" axis).
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
 * Accepted cosmetic slots and the column written for each; this table acts
 * as an allowlist. `uniform` writes `uniformColor`, the avatar column: a single
 * id space for colors (see lib/avatar.ts).
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
 * Saves the equipped cosmetics. Rejects any item the cadet has not
 * unlocked: validation happens server-side.
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
  const ownedSet = new Set(unlocks.map((u) => u.itemId));
  const ownedBadges = new Set(badges.map((b) => b.badgeId));

  // Update object built key by key: passing `choices` as is to Prisma would
  // let a route that forwards the raw JSON body write any column of `User`,
  // `totalXp` included.
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
    // The item must belong to the target slot's axis: without this check, an
    // unlocked card background could be worn as an avatar frame.
    if (def.axis !== slot.axis) {
      throw new InvalidCosmeticError("Cet objet n'appartient pas à cet emplacement");
    }
    if (def.condition.kind !== "default" && !ownedSet.has(id)) {
      throw new InvalidCosmeticError("Cet objet n'est pas débloqué");
    }
    data[slot.column] = id;
  }

  if (choices.emblem !== undefined) {
    if (!ownedBadges.has(choices.emblem)) {
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
 * Remembers the current course. Called when a chapter page opens, so that
 * "Reprendre la mission" follows the cadet even before they complete
 * a step.
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

/** Ids of the cutscenes already seen for a course ("<course>:" prefix). */
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

/** Marks a cutscene as seen; idempotent (rewatching creates no duplicate). */
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
 * GDPR: export of personal data (right of access and portability).
 * Profile, badges and progress in serializable form.
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
 * GDPR: permanent account deletion (right to erasure). The schema's `onDelete:
 * Cascade` deletes accounts, sessions, badges, progress and tokens.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await assertUserExists(userId);
  await prisma.user.delete({ where: { id: userId } });
}

/**
 * Checks the password before an irreversible action such as account
 * deletion (audit SRV-09). Same comparison as login (`auth.ts`).
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
