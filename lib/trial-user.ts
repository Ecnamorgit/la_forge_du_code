/**
 * État de progression du mode essai (visiteur sans compte).
 *
 * Logique pure : aucune dépendance React, les accès storage sont gardés par
 * `typeof window` — même contrat que `lib/intro.ts`.
 *
 * Le mode essai ne couvre qu'un seul chapitre (cf. lib/public-routes.ts),
 * l'état n'a donc pas besoin d'être indexé par cursus.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import { DEFAULT_USER, type UserState } from "./user-store";
import { xpForStep } from "./xp";

export const TRIAL_STORAGE_KEY = "nc_trial_state";

export interface TrialState {
  /** Index des étapes validées, triés. */
  completedSteps: number[];
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

function isTrialState(value: unknown): value is TrialState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.completedSteps) &&
    v.completedSteps.every((n) => typeof n === "number") &&
    typeof v.xp === "number"
  );
}

/**
 * Décode l'état d'essai depuis sa forme stockée.
 *
 * Toute la logique de décodage vit ici, en pur, pour être testable en
 * environnement node : `readTrialState` n'est qu'une enveloppe autour de
 * `localStorage`. Retourne l'état vide si l'entrée est absente, corrompue ou
 * de forme invalide — jamais d'exception.
 */
export function parseTrialState(raw: string | null): TrialState {
  // Chaque chemin « état par défaut » renvoie un littéral frais (et non un
  // spread d'une constante partagée) : sinon tous ces appels renverraient la
  // même référence de tableau pour `completedSteps`, et un `push` par un
  // appelant corromprait l'état par défaut pour tout le processus.
  if (!raw) return { completedSteps: [], xp: 0 };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isTrialState(parsed)) return { completedSteps: [], xp: 0 };
    return { completedSteps: [...parsed.completedSteps], xp: parsed.xp };
  } catch {
    return { completedSteps: [], xp: 0 };
  }
}

/** Lit l'état d'essai ; état vide si le storage est indisponible. */
export function readTrialState(): TrialState {
  if (typeof window === "undefined") return { completedSteps: [], xp: 0 };
  try {
    return parseTrialState(window.localStorage.getItem(TRIAL_STORAGE_KEY));
  } catch {
    return { completedSteps: [], xp: 0 };
  }
}

/** Persiste l'état ; no-op silencieux si le storage est indisponible ou plein. */
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
 * Applique une validation d'étape. Même calcul d'XP que `me-server.ts`
 * (`xpForStep`), pour que les chiffres du mode essai soient exactement ceux
 * d'un compte réel.
 */
export function applyTrialStep(
  state: TrialState,
  stepIndex: number,
  objectivesCount: number
): TrialStepResult {
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new Error("Index d'étape invalide");
  }

  if (state.completedSteps.includes(stepIndex)) {
    return { state, awardedXp: 0, alreadyDone: true };
  }

  const awardedXp = xpForStep(objectivesCount);
  return {
    state: {
      completedSteps: [...state.completedSteps, stepIndex].sort((a, b) => a - b),
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
    // `DEFAULT_USER` est un singleton d'état applicatif réel (cf.
    // lib/use-user.ts), pas une constante jetable : le spread ci-dessus ne
    // clone pas ses champs de type référence. `badges` doit donc être cloné
    // explicitement, sans quoi un `push` sur l'état d'essai corromprait
    // l'état par défaut de tous les utilisateurs du processus. Même raison
    // pour `unlocks` et pour la semaine de liaison, ajoutés par la boucle
    // quotidienne.
    badges: [...DEFAULT_USER.badges],
    unlocks: [...DEFAULT_USER.unlocks],
    liaison: { ...DEFAULT_USER.liaison, week: [...DEFAULT_USER.liaison.week] },
    // Le briefing est calculé serveur ; un visiteur sans compte n'atteint pas
    // le tableau de bord (middleware), il n'en a donc aucun.
    briefing: null,
    username: "Cadet",
    totalXp: state.xp,
    lastVisitedCourse: TRIAL_COURSE,
    completedSteps: {
      [`${TRIAL_COURSE}/${TRIAL_CHAPTERS[0]}`]: [...state.completedSteps],
    },
  };
}

/** Liste les étapes validées, au format attendu par /api/me/trial-import. */
export function trialCompletedSteps(state: TrialState): TrialStepRef[] {
  return state.completedSteps.map((stepIndex) => ({
    course: TRIAL_COURSE,
    chapter: TRIAL_CHAPTERS[0],
    stepIndex,
  }));
}
