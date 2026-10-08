"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useTrialUser } from "./use-trial-user";
import { useUser, type UseUserReturn } from "./use-user";

export type UserContextValue = UseUserReturn & {
  /** Vrai quand la progression est locale (visiteur sans compte). */
  isTrial: boolean;
};

/** Statuts exposés par `useSession()` (next-auth/react). */
export type SessionStatus = "authenticated" | "unauthenticated" | "loading";

export interface UserModeState {
  /** Une session authentifiée a-t-elle déjà existé depuis le montage ? */
  everAuthenticated: boolean;
}

export interface UserModeDecision extends UserModeState {
  /** Visiteur jamais connecté : progression locale légitime. */
  isTrial: boolean;
  /** Session qui vient d'expirer en cours d'usage : doit renvoyer vers /login. */
  sessionExpired: boolean;
}

/**
 * Décide du mode utilisateur à partir du statut de session et du fait qu'une
 * session authentifiée a déjà existé pendant ce montage.
 *
 * `status === "unauthenticated"` seul ne distingue pas un visiteur jamais
 * connecté (mode essai légitime) d'une session expirée en cours d'usage (JWT
 * expiré, relu par `SessionProvider` au retour du focus). Sans cette
 * distinction, l'utilisateur basculerait sur le stockage local et ce qu'il
 * valide ne serait plus écrit sur son compte.
 */
export function decideUserMode(
  status: SessionStatus,
  prev: UserModeState
): UserModeDecision {
  const everAuthenticated = prev.everAuthenticated || status === "authenticated";
  return {
    everAuthenticated,
    isTrial: status === "unauthenticated" && !everAuthenticated,
    sessionExpired: status === "unauthenticated" && everAuthenticated,
  };
}

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Choisit la source de progression selon la session. Monté uniquement sur le
 * sous-arbre /learn, seul endroit où un visiteur anonyme manipule un
 * UserState ; le tableau de bord, le profil et l'avatar restent protégés par
 * `proxy.ts` et appellent useUser() directement.
 *
 * Les deux hooks sont appelés sans condition (règles des hooks).
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const serverUser = useUser();
  const trialUser = useTrialUser();

  const [prevStatus, setPrevStatus] = useState<SessionStatus>(status);
  const [everAuthenticated, setEverAuthenticated] = useState(status === "authenticated");

  // Ajusté pendant le rendu (comme `prevOpen`/`index` dans IntroCinematic) et
  // non dans un effet : un effet ne s'exécuterait qu'après la peinture, et le
  // bandeau « mode essai » pourrait apparaître une frame avant la redirection.
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "authenticated") setEverAuthenticated(true);
  }

  const { isTrial, sessionExpired } = decideUserMode(status, { everAuthenticated });

  // Session expirée : la redirection est un effet de bord, elle reste dans un
  // effet.
  useEffect(() => {
    if (!sessionExpired) return;
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }, [sessionExpired, router, pathname]);

  const value: UserContextValue = isTrial
    ? { ...trialUser, isTrial: true }
    : { ...serverUser, isTrial: false };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext doit être utilisé dans un <UserProvider>");
  return ctx;
}
