"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { DEFAULT_USER, type UserState } from "./user-store";

export interface CompleteStepResponse {
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

export interface UseUserReturn {
  state: UserState;
  hydrated: boolean;
  /** Relit l'état depuis le serveur (après un changement externe, par exemple). */
  refresh: () => Promise<void>;
  /**
   * Validation d'étape côté serveur. `code` est la soumission qui vient de
   * passer ; le serveur rejoue le validateur dessus (lib/step-proof.ts).
   */
  completeStep: (
    course: string,
    chapter: string,
    stepIndex: number,
    code?: string
  ) => Promise<CompleteStepResponse>;
  /** Renomme l'utilisateur. Lève si le nom est invalide ou déjà pris. */
  renameUser: (newUsername: string) => Promise<UserState>;
  /** Efface toute la progression (XP, badges, étapes, liaison). */
  reset: () => Promise<UserState>;
  /** Mémorise la fermeture du briefing de première connexion. */
  markOnboarded: () => Promise<UserState>;
  /** Enregistre l'avatar (espèce, couleur d'uniforme, rôle). */
  setAvatar: (choices: {
    species: string;
    uniformColor: string;
    role: string;
  }) => Promise<UserState>;
  /** Enregistre les cosmétiques portés. Le serveur refuse ce qui n'est pas débloqué. */
  setCosmetics: (choices: {
    frame?: string;
    title?: string;
    emblem?: string;
    cardBg?: string;
    uniform?: string;
  }) => Promise<UserState>;
  /**
   * Mémorise le cursus en cours, à l'ouverture d'une page de chapitre. Les
   * erreurs sont ignorées : ce n'est qu'un confort d'interface.
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
 * État utilisateur adossé à la base : hydraté depuis `/api/me` une fois
 * authentifié, avec les mutations dont l'interface a besoin.
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
          // JWT valide mais compte supprimé en base : déconnexion pour
          // effacer le cookie périmé et revenir à /login.
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
      // Sans conséquence : erreurs réseau ou serveur ignorées.
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
