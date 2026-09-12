import "server-only";

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

/** Métadonnées de chapitres par cursus — constante, calculée une fois. */
const CHAPTERS_BY_COURSE: Record<string, { slug: string; totalSteps: number }[]> =
  Object.fromEntries(
    COURSES_CATALOG.map((c) => [
      c.slug,
      getChaptersMeta(c.slug).map((ch) => ({ slug: ch.slug, totalSteps: ch.totalSteps })),
    ])
  );

interface RawUserBundle {
  /**
   * Identifiant de compte. Sert de graine au tirage du briefing : le pseudo
   * est renommable depuis /profil, et l'utiliser ferait changer les trois
   * ordres au milieu de la journée alors que le masque de paiement, lui,
   * reste celui du jour — un ordre déjà payé le matin laisserait son bit armé
   * et le nouvel ordre tiré l'après-midi ne pourrait plus jamais être payé.
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

  // Projection SANS PERSISTANCE de la machine à états : elle dit ce qui
  // arriverait si le cadet validait une étape maintenant. Sans cela, `shape()`
  // rendrait le streak brut et un cadet absent cinq jours lirait encore
  // « 10 jours de liaison » sur son tableau de bord. Rejouer `advanceLiaison`
  // évite de dupliquer la règle des relais ici — il n'y a qu'une machine à
  // états, et c'est celle de lib/streak.ts.
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
 * Délai de la transaction de `completeStep`. Le défaut Prisma est de 5 s, et
 * cette transaction fait désormais une vingtaine d'allers-retours vers une base
 * distante (relecture du compte, toutes les complétions, badges, déblocables).
 * Un `P2028` ne coûterait pas seulement le briefing : il annulerait aussi la
 * `StepCompletion`, et le cadet perdrait l'étape qu'il vient de terminer. On
 * préfère largement une transaction lente à une étape perdue.
 *
 * `maxWait` couvre l'attente d'une connexion libre dans le pool, `timeout`
 * l'exécution elle-même.
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

    // Ordre de progression (constat EXE-01) : vérifié APRÈS le test
    // d'idempotence, pour qu'une étape déjà faite reste une réponse normale,
    // et DANS la transaction, sur les complétions qu'elle voit.
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

    // Toute l'arithmétique du versement — bits, bonus de clôture, série de
    // briefings parfaits, remise à zéro du masque au changement de journée —
    // vit dans `applyBriefingPayout`, pure et testée sous vitest. Ce module
    // importe `server-only` : rien de ce qui y reste enfermé n'est couvert.
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
    // Seuls les ordres RÉELLEMENT payés à cet instant : `briefing.quests`
    // filtré sur `done` réannoncerait à la deuxième étape du jour les ordres
    // déjà payés à la première, alors que `questXp` vaut alors 0.
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
      // Les objets par défaut d'un axe sont acquis d'office : `evaluateUnlocks`
      // les rend `unlocked: true` pour tout le monde, dès la première étape.
      // Leur créer une ligne `UserUnlock` les ferait annoncer comme « nouveaux
      // déblocables » alors qu'ils n'ont jamais été verrouillés. `setCosmetics`
      // les accepte d'ailleurs SANS ligne en base : ne pas les écrire ici lève
      // la contradiction au lieu de l'entretenir.
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
 * Save the user's avatar choices. Species et role sont validés en amont, dans
 * la route, contre des listes constantes — un id syntaxiquement valide l'est
 * pour tout le monde, aucune donnée utilisateur n'entre en jeu.
 *
 * La couleur d'uniforme est différente : les couleurs de base restent libres,
 * mais les couleurs méritées (catalogue `UNLOCKS`, axe `uniform`) exigent une
 * garde de possession, comme `setCosmetics`. Une garde purement syntaxique
 * (liste de constantes) ne peut pas trancher ça — elle ne sait pas qui écrit.
 * C'est pourquoi cette vérification vit ici plutôt que dans la route : le
 * fond de la décision dépend de l'utilisateur, la route ne peut valider que la
 * forme.
 */
export async function setAvatar(
  userId: string,
  args: { species: string; uniformColor: string; role: string }
): Promise<UserState> {
  await assertUserExists(userId);

  if (!isBaseUniformColorId(args.uniformColor)) {
    // Pas une couleur offerte : n'est acceptée que si le cadet possède
    // réellement le déblocage correspondant — même mécanisme de garde que
    // `setCosmetics` (axe "uniform"), repris plutôt que réinventé.
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
 * Les emplacements cosmétiques acceptés, et la colonne écrite pour chacun.
 * Cette table EST la liste blanche : rien d'autre ne peut être écrit.
 *
 * `uniform` écrit `uniformColor`, la colonne qui servait déjà à l'avatar. Un
 * seul espace d'identifiants pour les couleurs (cf. lib/avatar.ts), sans quoi
 * les cinq uniformes du catalogue seraient invendables.
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
 * débloqué — la validation est serveur, le client n'est pas cru sur parole.
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

  // L'objet de mise à jour est construit clé par clé, jamais relayé depuis
  // l'appelant. Passer `choices` tel quel à Prisma serait une faille : le
  // typage TypeScript n'existe plus à l'exécution, et une route qui
  // transmettrait le corps JSON brut laisserait écrire n'importe quelle
  // colonne de `User` — `totalXp: 999999` compris.
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
