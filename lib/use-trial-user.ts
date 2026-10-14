"use client";

import { useCallback, useEffect, useState } from "react";

import { chapter1 as htmlCh1 } from "@/data/courses/html/chapitre-1";
import { chapter2 as htmlCh2 } from "@/data/courses/html/chapitre-2";
import { chapter3 as htmlCh3 } from "@/data/courses/html/chapitre-3";
import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import {
  applyTrialStep,
  emptyTrialState,
  readTrialState,
  trialStateToUserState,
  writeTrialState,
  type TrialState,
} from "./trial-user";
import type { CompleteStepResponse, UseUserReturn } from "./use-user";
import { DEFAULT_USER } from "./user-store";

/** Trial chapter data by slug, to keep in sync with TRIAL_CHAPTERS. */
const TRIAL_CHAPTER_DATA: Record<string, typeof htmlCh1> = {
  [htmlCh1.slug]: htmlCh1,
  [htmlCh2.slug]: htmlCh2,
  [htmlCh3.slug]: htmlCh3,
};

/** Thrown by actions that make no sense without an account. */
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
 * `UseUserReturn` implementation for a visitor without an account.
 * Progress lives in localStorage and covers the trial chapters.
 */
export function useTrialUser(): UseUserReturn {
  const [trial, setTrial] = useState<TrialState>(emptyTrialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off storage read on mount
    setTrial(readTrialState());
    setHydrated(true);
  }, []);

  const completeStep = useCallback(
    async (
      course: string,
      chapter: string,
      stepIndex: number
    ): Promise<CompleteStepResponse> => {
      if (course !== TRIAL_COURSE || !TRIAL_CHAPTERS.includes(chapter)) {
        throw new AccountRequiredError(
          "Ce chapitre nécessite un compte. Crée le tien pour continuer."
        );
      }

      const chapterData = TRIAL_CHAPTER_DATA[chapter];
      const step = chapterData?.steps[stepIndex];
      if (!step) throw new Error("Index d'étape invalide");

      const result = applyTrialStep(trial, chapter, stepIndex, step.objectives.length);
      setTrial(result.state);
      writeTrialState(result.state);

      return {
        state: trialStateToUserState(result.state),
        awardedXp: result.awardedXp,
        newBadge: null,
        alreadyDone: result.alreadyDone,
        questXp: 0,
        completedQuests: [],
        newConductBadges: [],
        newUnlocks: [],
        notice: null,
      };
    },
    [trial]
  );

  return {
    state: hydrated ? trialStateToUserState(trial) : DEFAULT_USER,
    hydrated,
    refresh: async () => {},
    // Without an account, nothing to remember.
    markCourseVisited: async () => {},
    renameUser: rejectWithAccountRequired,
    reset: rejectWithAccountRequired,
    markOnboarded: rejectWithAccountRequired,
    setAvatar: rejectWithAccountRequired,
    setCosmetics: rejectWithAccountRequired,
    completeStep,
  };
}
