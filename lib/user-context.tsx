"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useTrialUser } from "./use-trial-user";
import { useUser, type UseUserReturn } from "./use-user";

export type UserContextValue = UseUserReturn & {
  /** True when progress is local (visitor without an account). */
  isTrial: boolean;
};

/** Statuses exposed by `useSession()` (next-auth/react). */
export type SessionStatus = "authenticated" | "unauthenticated" | "loading";

export interface UserModeState {
  /** Has an authenticated session existed since mount? */
  everAuthenticated: boolean;
}

export interface UserModeDecision extends UserModeState {
  /** Visitor never signed in: legitimate local progress. */
  isTrial: boolean;
  /** Session that just expired during use: must send back to /login. */
  sessionExpired: boolean;
}

/**
 * Decides the user mode from the session status and whether an
 * authenticated session has already existed during this mount.
 *
 * `status === "unauthenticated"` alone does not distinguish a visitor who
 * never signed in (legitimate trial mode) from a session that expired during
 * use (expired JWT, re-read by `SessionProvider` when focus returns). Without
 * this distinction, the user would switch to local storage and what they
 * complete would no longer be written to their account.
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
 * Picks the progress source based on the session. Mounted only on the
 * /learn subtree, the only place where an anonymous visitor handles a
 * UserState; the dashboard, profile and avatar stay protected by
 * `proxy.ts` and call useUser() directly.
 *
 * Both hooks are called unconditionally (rules of hooks).
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const serverUser = useUser();
  const trialUser = useTrialUser();

  const [prevStatus, setPrevStatus] = useState<SessionStatus>(status);
  const [everAuthenticated, setEverAuthenticated] = useState(status === "authenticated");

  // Adjusted during render (like `prevOpen`/`index` in IntroCinematic), not
  // in an effect: an effect would only run after paint, and the "mode essai"
  // banner could show for one frame before the redirect.
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "authenticated") setEverAuthenticated(true);
  }

  const { isTrial, sessionExpired } = decideUserMode(status, { everAuthenticated });

  // Expired session: the redirect is a side effect, so it stays in an
  // effect.
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
