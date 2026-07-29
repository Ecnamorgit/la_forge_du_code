"use client";

import { useCallback, useEffect, useState } from "react";

import { chapitre1 as trialChapter } from "@/data/courses/html/chapitre-1";
import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";
import {
  applyTrialStep,
  readTrialState,
  trialStateToUserState,
  writeTrialState,
  type TrialState,
} from "./trial-user";
import type { CompleteStepResponse, UseUserReturn } from "./use-user";
import { DEFAULT_USER } from "./user-store";

/** Levée par les actions qui n'ont aucun sens sans compte. */
export class AccountRequiredError extends Error {
  constructor(message = "Crée ton compte pour débloquer cette fonctionnalité.") {
    super(message);
    this.name = "AccountRequiredError";
  }
}

const rejectWithAccountRequired = async (): Promise<never> => {
  throw new AccountRequiredError();
};

/**
 * Implémentation `UseUserReturn` pour un visiteur sans compte.
 * La progression vit dans localStorage et ne couvre que le chapitre d'essai.
 */
export function useTrialUser(): UseUserReturn {
  const [trial, setTrial] = useState<TrialState>({ completedSteps: [], xp: 0 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle du storage au montage
    setTrial(readTrialState());
    setHydrated(true);
  }, []);

  const completeStep = useCallback(
    async (
      course: string,
      chapter: string,
      stepIndex: number
    ): Promise<CompleteStepResponse> => {
      if (course !== TRIAL_COURSE || chapter !== TRIAL_CHAPTER) {
        throw new AccountRequiredError(
          "Ce chapitre nécessite un compte. Crée le tien pour continuer."
        );
      }

      const step = trialChapter.steps[stepIndex];
      if (!step) throw new Error("Index d'étape invalide");

      const result = applyTrialStep(trial, stepIndex, step.objectives.length);
      setTrial(result.state);
      writeTrialState(result.state);

      return {
        state: trialStateToUserState(result.state),
        awardedXp: result.awardedXp,
        newBadge: null,
        alreadyDone: result.alreadyDone,
      };
    },
    [trial]
  );

  return {
    state: hydrated ? trialStateToUserState(trial) : DEFAULT_USER,
    hydrated,
    refresh: async () => {},
    // Fire-and-forget côté appelant : sans compte, il n'y a rien à mémoriser.
    markCourseVisited: async () => {},
    claimDailyMission: rejectWithAccountRequired,
    renameUser: rejectWithAccountRequired,
    reset: rejectWithAccountRequired,
    markOnboarded: rejectWithAccountRequired,
    setAvatar: rejectWithAccountRequired,
    completeStep,
  };
}
