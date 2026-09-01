/**
 * État de progression du mode essai (visiteur sans compte).
 *
 * Logique pure : aucune dépendance React, les accès storage sont gardés par
 * `typeof window` — même contrat que `lib/intro.ts`.
 *
 * Le mode essai couvre les chapitres de TRIAL_CHAPTERS (cf.
 * lib/public-routes.ts) : l'état est indexé par slug de chapitre.
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

/** État vide — littéral frais à chaque appel (cf. commentaires ci-dessous). */
export function emptyTrialState(): TrialState {
  return { chapters: {}, xp: 0 };
}

function sanitizeChapters(value: unknown): Record<string, number[]> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const out: Record<string, number[]> = {};
  for (const [chapter, steps] of Object.entries(value)) {
    // La forme est validée avant le filtre de périmètre : une entrée
    // malformée sous une clé hors périmètre doit corrompre l'état (retour à
    // vide), pas être silencieusement ignorée avec le reste.
    if (!Array.isArray(steps) || !steps.every((n) => typeof n === "number")) return null;
    if (!TRIAL_CHAPTERS.includes(chapter)) continue; // hors périmètre : ignoré
    out[chapter] = [...steps];
  }
  return out;
}

/**
 * Décode l'état d'essai depuis sa forme stockée.
 *
 * Toute la logique de décodage vit ici, en pur, pour être testable en
 * environnement node : `readTrialState` n'est qu'une enveloppe autour de
 * `localStorage`. Retourne l'état vide si l'entrée est absente, corrompue ou
 * de forme invalide — jamais d'exception.
 *
 * Migre silencieusement l'ancienne forme `{ completedSteps, xp }` (un seul
 * chapitre implicite) vers la forme neuve `{ chapters, xp }`.
 */
export function parseTrialState(raw: string | null): TrialState {
  // Chaque chemin « état par défaut » renvoie un littéral frais (et non un
  // spread d'une constante partagée) : sinon tous ces appels renverraient la
  // même référence d'objet pour `chapters`, et une mutation par un appelant
  // corromprait l'état par défaut pour tout le processus.
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
    // Ancienne forme { completedSteps, xp } : migration silencieuse.
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
 * Applique une validation d'étape pour un chapitre d'essai donné. Même
 * calcul d'XP que `me-server.ts` (`xpForStep`), pour que les chiffres du mode
 * essai soient exactement ceux d'un compte réel.
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
