import "server-only";

import { prisma } from "@/lib/db";
import { getBadgeForChapter } from "@/lib/courses-meta";
import { getChapterData } from "@/lib/courses-registry";
import { MAX_XP, xpForStep } from "@/lib/xp";
import type { UserState } from "@/lib/user-store";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

interface RawUserBundle {
  username: string;
  totalXp: number;
  streak: number;
  lastVisit: string;
  lastVisitedCourse: string | null;
  joinedAt: Date;
  onboardedAt: Date | null;
  species: string | null;
  uniformColor: string | null;
  role: string | null;
  badges: { badgeId: string }[];
  stepCompletions: {
    course: string;
    chapter: string;
    stepIndex: number;
  }[];
}

function shape(bundle: RawUserBundle): UserState {
  const completedSteps: Record<string, number[]> = {};
  for (const sc of bundle.stepCompletions) {
    const key = `${sc.course}/${sc.chapter}`;
    (completedSteps[key] ??= []).push(sc.stepIndex);
  }
  for (const k of Object.keys(completedSteps)) {
    completedSteps[k].sort((a, b) => a - b);
  }

  return {
    username: bundle.username,
    totalXp: bundle.totalXp,
    streak: bundle.streak,
    lastVisit: bundle.lastVisit,
    lastVisitedCourse: bundle.lastVisitedCourse,
    badges: bundle.badges.map((b) => b.badgeId),
    completedSteps,
    joinedAt: bundle.joinedAt.toISOString().slice(0, 10),
    onboardedAt: bundle.onboardedAt ? bundle.onboardedAt.toISOString() : null,
    species: bundle.species,
    uniformColor: bundle.uniformColor,
    role: bundle.role,
  };
}

const USER_BUNDLE_SELECT = {
  username: true,
  totalXp: true,
  streak: true,
  lastVisit: true,
  lastVisitedCourse: true,
  joinedAt: true,
  onboardedAt: true,
  species: true,
  uniformColor: true,
  role: true,
  badges: { select: { badgeId: true } },
  stepCompletions: {
    select: { course: true, chapter: true, stepIndex: true },
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
 * Fetch the user state, applying streak update if the day has changed.
 * Returns null if the user doesn't exist.
 */
export async function getUserState(userId: string): Promise<UserState | null> {
  const bundle = await fetchBundle(userId);
  if (!bundle) return null;

  const today = todayIso();
  if (bundle.lastVisit === today) {
    return shape(bundle);
  }

  // First visit ever (lastVisit was empty) — start streak at 1
  let nextStreak = 1;
  if (bundle.lastVisit) {
    const diff = daysBetween(bundle.lastVisit, today);
    nextStreak = diff === 1 ? bundle.streak + 1 : 1;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { streak: nextStreak, lastVisit: today },
    select: USER_BUNDLE_SELECT,
  });

  return shape(updated);
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
  });

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();

  return { state, awardedXp, newBadge, alreadyDone };
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
      lastVisit: true,
      lastVisitedCourse: true,
      onboardedAt: true,
      species: true,
      uniformColor: true,
      role: true,
      badges: { select: { badgeId: true, unlockedAt: true } },
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
    prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: 0,
        streak: 1,
        lastVisit: todayIso(),
        lastVisitedCourse: null,
      },
    }),
  ]);

  const state = await getUserState(userId);
  if (!state) throw new UserNotFoundError();
  return state;
}
