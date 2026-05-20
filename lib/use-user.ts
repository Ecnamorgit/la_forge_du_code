"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { DEFAULT_USER, type UserState } from "./user-store";

export interface CompleteStepResponse {
  state: UserState;
  awardedXp: number;
  newBadge: string | null;
  alreadyDone: boolean;
}

export interface UseUserReturn {
  state: UserState;
  hydrated: boolean;
  /** Refetch the state from the server (e.g. after an external change). */
  refresh: () => Promise<void>;
  /** Server-validated step completion. Returns awarded XP + new badge. */
  completeStep: (
    course: string,
    chapter: string,
    stepIndex: number
  ) => Promise<CompleteStepResponse>;
  /** Rename the current user. Throws on invalid name or conflict. */
  renameUser: (newUsername: string) => Promise<UserState>;
  /** Wipe all progression (XP, badges, completedSteps, streak). */
  reset: () => Promise<UserState>;
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Réponse serveur invalide");
  }
}

/**
 * DB-backed user hook. Hydrates from `/api/me` once authenticated, exposes
 * server actions for the only mutations the UI needs.
 */
export function useUser(): UseUserReturn {
  const { status } = useSession();
  const [state, setState] = useState<UserState>(DEFAULT_USER);
  const [serverHydrated, setServerHydrated] = useState(false);
  const inFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) {
      await inFlight.current;
      return;
    }
    const promise = (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          setState(DEFAULT_USER);
          return;
        }
        const data = await readJson<UserState>(res);
        setState(data);
      } finally {
        setServerHydrated(true);
      }
    })();
    inFlight.current = promise;
    try {
      await promise;
    } finally {
      inFlight.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      return;
    }
    void refresh();
  }, [status, refresh]);

  const completeStep = useCallback(
    async (
      course: string,
      chapter: string,
      stepIndex: number
    ): Promise<CompleteStepResponse> => {
      const res = await fetch("/api/me/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, chapter, stepIndex }),
      });
      if (!res.ok) {
        const err = await readJson<{ error?: string }>(res);
        throw new Error(err.error ?? "Échec de l'enregistrement");
      }
      const data = await readJson<CompleteStepResponse>(res);
      setState(data.state);
      return data;
    },
    []
  );

  const renameUser = useCallback(async (newUsername: string) => {
    const res = await fetch("/api/me/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername }),
    });
    if (!res.ok) {
      const err = await readJson<{ error?: string }>(res);
      throw new Error(err.error ?? "Renommage impossible");
    }
    const next = await readJson<UserState>(res);
    setState(next);
    return next;
  }, []);

  const reset = useCallback(async () => {
    const res = await fetch("/api/me/reset", { method: "POST" });
    if (!res.ok) {
      const err = await readJson<{ error?: string }>(res);
      throw new Error(err.error ?? "Réinitialisation impossible");
    }
    const next = await readJson<UserState>(res);
    setState(next);
    return next;
  }, []);

  const hydrated = status === "unauthenticated" ? true : serverHydrated;
  const publicState = status === "unauthenticated" ? DEFAULT_USER : state;

  return {
    state: publicState,
    hydrated,
    refresh,
    completeStep,
    renameUser,
    reset,
  };
}
