import type { Briefing } from "./quests";

/** Vue client de la liaison, calculée par le serveur. */
export interface LiaisonPublic {
  streak: number;
  bestStreak: number;
  shields: number;
  /** Les 7 derniers jours, du plus ancien au plus récent. */
  week: boolean[];
  /**
   * Vrai si la journée est déjà comptée dans `streak`. Faux tant qu'aucune
   * étape n'a été validée aujourd'hui : `streak` est alors le compte d'hier.
   */
  activeToday: boolean;
  /**
   * Vrai si valider une étape maintenant romprait la série (absence plus
   * longue que ce que couvrent les relais). Permet d'annoncer la rupture
   * plutôt qu'un compteur périmé. Toujours faux si `activeToday`.
   */
  wouldBreakToday: boolean;
}

export interface UserState {
  username: string;
  totalXp: number;
  lastVisit: string;
  // Jour (aaaa-mm-jj) auquel se rapporte le masque de paiement du briefing ; "" si jamais.
  lastDailyMission: string;
  // Dernier cursus ouvert ou travaillé, présélectionné par le tableau de bord.
  // Null avant la première ouverture d'un chapitre.
  lastVisitedCourse: string | null;
  badges: string[];
  // Clé `${course}/${chapter}`, valeur : indices des étapes faites, triés.
  completedSteps: Record<string, number[]>;
  joinedAt: string;
  // Date ISO de fermeture du briefing de première connexion ; null avant.
  onboardedAt: string | null;
  // Avatar (cosmétique). Null jusqu'au premier passage sur /avatar.
  species: string | null;
  uniformColor: string | null;
  role: string | null;

  // Boucle quotidienne
  /** Briefing du jour, calculé serveur. Null en mode essai (visiteur local). */
  briefing: Briefing | null;
  /** Seule source du compteur de liaison côté client. */
  liaison: LiaisonPublic;
  /** Ids des cosmétiques débloqués, tels qu'ils sont possédés en base. */
  unlocks: string[];
  /** Total d'ordres validés (progression des badges de conduite). */
  questsCompleted: number;
  frame: string | null;
  title: string | null;
  emblem: string | null;
  cardBg: string | null;
}

export const DEFAULT_USER: UserState = {
  username: "",
  totalXp: 0,
  lastVisit: "",
  lastDailyMission: "",
  lastVisitedCourse: null,
  badges: [],
  completedSteps: {},
  joinedAt: "",
  onboardedAt: null,
  species: null,
  uniformColor: null,
  role: null,
  briefing: null,
  liaison: {
    streak: 1,
    bestStreak: 1,
    shields: 0,
    week: [false, false, false, false, false, false, false],
    activeToday: false,
    wouldBreakToday: false,
  },
  unlocks: [],
  questsCompleted: 0,
  frame: null,
  title: null,
  emblem: null,
  cardBg: null,
};

/** Vrai si l'avatar est choisi (les trois champs renseignés). */
export function hasAvatar(state: UserState): boolean {
  return state.species !== null && state.uniformColor !== null && state.role !== null;
}

/** Indices des étapes faites dans un chapitre. */
export function getCompletedSteps(
  state: UserState,
  course: string,
  chapter: string
): number[] {
  return state.completedSteps[`${course}/${chapter}`] ?? [];
}

export function isChapterComplete(
  state: UserState,
  course: string,
  chapter: string,
  totalSteps: number
): boolean {
  return getCompletedSteps(state, course, chapter).length >= totalSteps;
}

export interface ChapterMeta {
  slug: string;
  totalSteps: number;
}

/** Progression d'un cursus en pourcentage (étapes faites / étapes totales). */
export function getCourseProgress(
  state: UserState,
  course: string,
  chapters: ChapterMeta[]
): number {
  if (chapters.length === 0) return 0;
  const totalSteps = chapters.reduce((s, c) => s + c.totalSteps, 0);
  if (totalSteps === 0) return 0;
  const completed = chapters.reduce(
    (s, c) => s + getCompletedSteps(state, course, c.slug).length,
    0
  );
  return Math.round((completed / totalSteps) * 100);
}

export interface NextStep {
  chapterSlug: string;
  stepIndex: number;
  isFirst: boolean;
}

/** Prochaine étape à faire dans un cursus. */
export function getNextStep(
  state: UserState,
  course: string,
  chapters: ChapterMeta[]
): NextStep | null {
  for (const ch of chapters) {
    const done = getCompletedSteps(state, course, ch.slug);
    if (done.length < ch.totalSteps) {
      const nextStepIdx = done.length;
      return {
        chapterSlug: ch.slug,
        stepIndex: nextStepIdx,
        isFirst: nextStepIdx === 0 && done.length === 0,
      };
    }
  }
  return null;
}

function countCompleted(state: UserState, courseSlug: string): number {
  const prefix = `${courseSlug}/`;
  let completed = 0;
  for (const [key, steps] of Object.entries(state.completedSteps)) {
    if (key.startsWith(prefix)) completed += steps.length;
  }
  return completed;
}

/**
 * Cursus sur lequel l'utilisateur travaille le plus probablement : le dernier
 * visité s'il est candidat et inachevé, sinon le cursus inachevé le plus
 * avancé, sinon le premier candidat.
 */
export function getActiveCourseSlug(
  state: UserState,
  candidateSlugs: string[],
  totalStepsByCourse: Record<string, number>
): string {
  if (candidateSlugs.length === 0) return "";

  const validSet = new Set(candidateSlugs);

  // Dernier cursus visité, s'il reste inachevé.
  if (state.lastVisitedCourse && validSet.has(state.lastVisitedCourse)) {
    const total = totalStepsByCourse[state.lastVisitedCourse] ?? 0;
    const done = countCompleted(state, state.lastVisitedCourse);
    if (total > 0 && done < total) return state.lastVisitedCourse;
  }

  // Sinon, le cursus inachevé le plus avancé.
  let bestSlug = candidateSlugs[0];
  let bestProgress = -1;
  for (const slug of candidateSlugs) {
    const total = totalStepsByCourse[slug] ?? 0;
    if (total === 0) continue;
    const done = countCompleted(state, slug);
    if (done >= total) continue;
    if (done > bestProgress) {
      bestProgress = done;
      bestSlug = slug;
    }
  }

  return bestSlug;
}
