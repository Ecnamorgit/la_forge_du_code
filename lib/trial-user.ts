/**
 * État de progression du mode essai (visiteur sans compte), indexé par slug
 * de chapitre de TRIAL_CHAPTERS (lib/public-routes.ts).
 *
 * Logique pure, sans React ; les accès au storage sont gardés par
 * `typeof window`, comme dans `lib/intro.ts`.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER, type UserState } from "./user-store";
import { xpForStep } from "./xp";

export const TRIAL_STORAGE_KEY = "nc_trial_state";

export interface TrialState {
  /** Index des étapes validées, triés, par slug de chapitre d'essai. */
  chapters: Record<string, number[]>;
  xp: number;
}

export interface TrialStepResult {
  state: TrialState;
  awardedXp: number;
  alreadyDone: boolean;
}

export interface TrialStepRef {
  course: string;
  chapter: string;
  stepIndex: number;
}

/** État vide, nouveau littéral à chaque appel (cf. `parseTrialState`). */
export function emptyTrialState(): TrialState {
  return { chapters: {}, xp: 0 };
}

function sanitizeChapters(value: unknown): Record<string, number[]> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const out: Record<string, number[]> = {};
  for (const [chapter, steps] of Object.entries(value)) {
    // Forme validée avant le filtre de périmètre : une entrée malformée, même
    // hors périmètre, invalide tout l'état.
    if (!Array.isArray(steps) || !steps.every((n) => typeof n === "number")) return null;
    if (!TRIAL_CHAPTERS.includes(chapter)) continue; // hors périmètre : ignoré
    out[chapter] = [...steps];
  }
  return out;
}

/**
 * Décode l'état d'essai stocké. Le décodage vit ici, en pur, pour être testé
 * sous node ; `readTrialState` n'enveloppe que `localStorage`. Renvoie l'état
 * vide si l'entrée est absente, corrompue ou invalide, sans jamais lever.
 *
 * Migre l'ancienne forme `{ completedSteps, xp }` (un seul chapitre implicite)
 * vers `{ chapters, xp }`.
 */
export function parseTrialState(raw: string | null): TrialState {
  // Chaque retour par défaut est un littéral frais : avec une constante
  // partagée, une mutation de `chapters` par un appelant corromprait l'état
  // par défaut pour tout le processus.
  if (!raw) return emptyTrialState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyTrialState();
    const v = parsed as Record<string, unknown>;
    if (typeof v.xp !== "number") return emptyTrialState();
    // Forme neuve.
    if ("chapters" in v) {
      const chapters = sanitizeChapters(v.chapters);
      return chapters ? { chapters, xp: v.xp } : emptyTrialState();
    }
    // Ancienne forme { completedSteps, xp } : migration.
    if (Array.isArray(v.completedSteps) && v.completedSteps.every((n) => typeof n === "number")) {
      return {
        chapters: { [TRIAL_CHAPTERS[0]]: [...v.completedSteps] },
        xp: v.xp,
      };
    }
    return emptyTrialState();
  } catch {
    return emptyTrialState();
  }
}

/** Lit l'état d'essai ; état vide si le storage est indisponible. */
export function readTrialState(): TrialState {
  if (typeof window === "undefined") return emptyTrialState();
  try {
    return parseTrialState(window.localStorage.getItem(TRIAL_STORAGE_KEY));
  } catch {
    return emptyTrialState();
  }
}

/** Persiste l'état ; sans effet si le storage est indisponible ou plein. */
export function writeTrialState(state: TrialState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* navigation privée ou quota dépassé : l'essai continue en mémoire */
  }
}

export function clearTrialState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Applique une validation d'étape pour un chapitre d'essai. Même calcul d'XP
 * que `me-server.ts` (`xpForStep`).
 */
export function applyTrialStep(
  state: TrialState,
  chapter: string,
  stepIndex: number,
  objectivesCount: number
): TrialStepResult {
  if (!TRIAL_CHAPTERS.includes(chapter)) {
    throw new Error("Chapitre hors du périmètre d'essai");
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new Error("Index d'étape invalide");
  }

  const done = state.chapters[chapter] ?? [];
  if (done.includes(stepIndex)) {
    return { state, awardedXp: 0, alreadyDone: true };
  }

  const awardedXp = xpForStep(objectivesCount);
  return {
    state: {
      chapters: {
        ...state.chapters,
        [chapter]: [...done, stepIndex].sort((a, b) => a - b),
      },
      xp: state.xp + awardedXp,
    },
    awardedXp,
    alreadyDone: false,
  };
}

/** Projette l'état d'essai dans la forme `UserState` consommée par l'UI. */
export function trialStateToUserState(state: TrialState): UserState {
  return {
    ...DEFAULT_USER,
    // Le spread ne clone pas les champs de type référence de `DEFAULT_USER`,
    // partagé par tout le processus (cf. lib/use-user.ts) : un `push` sur
    // l'état d'essai le corromprait. D'où les copies explicites.
    badges: [...DEFAULT_USER.badges],
    unlocks: [...DEFAULT_USER.unlocks],
    liaison: { ...DEFAULT_USER.liaison, week: [...DEFAULT_USER.liaison.week] },
    // Le briefing est calculé serveur ; un visiteur sans compte n'atteint pas
    // le tableau de bord (proxy.ts), il n'en a donc aucun.
    briefing: null,
    username: "Cadet",
    totalXp: state.xp,
    lastVisitedCourse: TRIAL_COURSE,
    completedSteps: Object.fromEntries(
      Object.entries(state.chapters).map(([chapter, steps]) => [
        `${TRIAL_COURSE}/${chapter}`,
        [...steps],
      ])
    ),
  };
}

/** Liste les étapes validées, au format attendu par /api/me/trial-import. */
export function trialCompletedSteps(state: TrialState): TrialStepRef[] {
  return TRIAL_CHAPTERS.flatMap((chapter) =>
    (state.chapters[chapter] ?? []).map((stepIndex) => ({
      course: TRIAL_COURSE,
      chapter,
      stepIndex,
    }))
  );
}
