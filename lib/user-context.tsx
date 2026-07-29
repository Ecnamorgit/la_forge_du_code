"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

import { useTrialUser } from "./use-trial-user";
import { useUser, type UseUserReturn } from "./use-user";

export type UserContextValue = UseUserReturn & {
  /** Vrai quand la progression est locale (visiteur sans compte). */
  isTrial: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Choisit la source de progression selon la session.
 *
 * Monté uniquement sur le sous-arbre /learn : c'est le seul endroit où un
 * visiteur anonyme manipule un UserState. Le dashboard, le profil et l'avatar
 * restent protégés par le middleware et appellent useUser() directement.
 *
 * Les deux hooks sont appelés inconditionnellement (règles des hooks) ; seul
 * le résultat retenu change.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const serverUser = useUser();
  const trialUser = useTrialUser();

  const isTrial = status === "unauthenticated";
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
