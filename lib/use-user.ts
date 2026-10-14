"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { DEFAULT_USER, type UserState } from "./user-store";

export interface CompleteStepResponse {
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

export interface UseUserReturn {
  state: UserState;
  hydrated: boolean;
  /** Rereads the state from the server (after an external change, for example). */
  refresh: () => Promise<void>;
  /**
   * Server-side step completion. `code` is the submission that just passed;
   * the server replays the validator on it (lib/step-proof.ts).
   */
  completeStep: (
    course: string,
    chapter: string,
    stepIndex: number,
    code?: string
  ) => Promise<CompleteStepResponse>;
  /** Renames the user. Throws if the name is invalid or already taken. */
  renameUser: (newUsername: string) => Promise<UserState>;
  /** Erases all progress (XP, badges, steps, liaison). */
  reset: () => Promise<UserState>;
  /** Records that the first-login briefing was closed. */
  markOnboarded: () => Promise<UserState>;
  /** Saves the avatar (species, uniform color, role). */
  setAvatar: (choices: {
    species: string;
    uniformColor: string;
    role: string;
  }) => Promise<UserState>;
  /** Saves the equipped cosmetics. The server rejects anything not unlocked. */
  setCosmetics: (choices: {
    frame?: string;
    title?: string;
    emblem?: string;
    cardBg?: string;
    uniform?: string;
  }) => Promise<UserState>;
  /**
   * Remembers the current course when a chapter page opens. Errors are
   * ignored: it is only a UI convenience.
   */
  markCourseVisited: (course: string) => Promise<void>;
}

function toNetworkMessage(): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "Connexion perdue. Verifie ton internet puis reessaie.";
  }
  return "Impossible de contacter le serveur. Reessaie dans quelques secondes.";
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
 * Database-backed user state: hydrated from `/api/me` once authenticated,
 * with the mutations the UI needs.
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
        if (res.status === 401) {
          // Valid JWT but account deleted from the database: sign out to
          // clear the stale cookie and go back to /login.
          setState(DEFAULT_USER);
          void signOut({ callbackUrl: "/login" });
          return;
        }
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
      stepIndex: number,
      code?: string
    ): Promise<CompleteStepResponse> => {
      let res: Response;
      try {
        res = await fetch("/api/me/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course, chapter, stepIndex, code }),
        });
      } catch {
        throw new Error(toNetworkMessage());
      }
      if (res.status === 401) {
        void signOut({ callbackUrl: "/login" });
        throw new Error("Session expiree. Reconnecte-toi.");
      }
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
    let res: Response;
    try {
      res = await fetch("/api/me/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
    } catch {
      throw new Error(toNetworkMessage());
    }
    if (res.status === 401) {
      void signOut({ callbackUrl: "/login" });
      throw new Error("Session expiree. Reconnecte-toi.");
    }
    if (!res.ok) {
      const err = await readJson<{ error?: string }>(res);
      throw new Error(err.error ?? "Renommage impossible");
    }
    const next = await readJson<UserState>(res);
    setState(next);
    return next;
  }, []);

  const markOnboarded = useCallback(async () => {
    let res: Response;
    try {
      res = await fetch("/api/me/onboarded", { method: "POST" });
    } catch {
      throw new Error(toNetworkMessage());
    }
    if (res.status === 401) {
      void signOut({ callbackUrl: "/login" });
      throw new Error("Session expiree. Reconnecte-toi.");
    }
    if (!res.ok) {
      const err = await readJson<{ error?: string }>(res);
      throw new Error(err.error ?? "Impossible d'enregistrer le briefing");
    }
    const next = await readJson<UserState>(res);
    setState(next);
    return next;
  }, []);

  const setAvatar = useCallback(
    async (choices: { species: string; uniformColor: string; role: string }) => {
      let res: Response;
      try {
        res = await fetch("/api/me/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(choices),
        });
      } catch {
        throw new Error(toNetworkMessage());
      }
      if (res.status === 401) {
        void signOut({ callbackUrl: "/login" });
        throw new Error("Session expiree. Reconnecte-toi.");
      }
      if (!res.ok) {
        const err = await readJson<{ error?: string }>(res);
        throw new Error(err.error ?? "Sauvegarde impossible");
      }
      const next = await readJson<UserState>(res);
      setState(next);
      return next;
    },
    []
  );

  const setCosmetics = useCallback(
    async (choices: {
      frame?: string;
      title?: string;
      emblem?: string;
      cardBg?: string;
      uniform?: string;
    }) => {
      let res: Response;
      try {
        res = await fetch("/api/me/cosmetics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(choices),
        });
      } catch {
        throw new Error(toNetworkMessage());
      }
      if (res.status === 401) {
        void signOut({ callbackUrl: "/login" });
        throw new Error("Session expiree. Reconnecte-toi.");
      }
      if (!res.ok) {
        const err = await readJson<{ error?: string }>(res);
        throw new Error(err.error ?? "Sauvegarde impossible");
      }
      const next = await readJson<UserState>(res);
      setState(next);
      return next;
    },
    []
  );

  const markCourseVisited = useCallback(async (course: string) => {
    try {
      const res = await fetch("/api/me/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course }),
      });
      if (!res.ok) return;
      const next = await readJson<UserState>(res);
      setState(next);
    } catch {
      // Harmless: network or server errors are ignored.
    }
  }, []);

  const reset = useCallback(async () => {
    let res: Response;
    try {
      res = await fetch("/api/me/reset", { method: "POST" });
    } catch {
      throw new Error(toNetworkMessage());
    }
    if (res.status === 401) {
      void signOut({ callbackUrl: "/login" });
      throw new Error("Session expiree. Reconnecte-toi.");
    }
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
    markOnboarded,
    setAvatar,
    setCosmetics,
    markCourseVisited,
  };
}
