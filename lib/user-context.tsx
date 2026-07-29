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
 * Décide du mode utilisateur à partir du statut de session courant et du
 * fait qu'une session authentifiée ait déjà existé pendant ce montage.
 *
 * Pure, sans dépendance React : c'est le cœur du Correctif B. Le bug qu'elle
 * corrige est que `status === "unauthenticated"` seul ne distingue pas
 * "visiteur jamais connecté" (mode essai légitime, `/learn/html/chapitre-1`
 * n'est plus derrière le middleware) de "session expirée en cours d'usage"
 * (JWT expiré, `SessionProvider` refetch au focus de la fenêtre) : sans
 * cette distinction, un utilisateur connecté dont le token expire bascule
 * silencieusement vers le stockage local — sa progression semble s'effacer,
 * et tout ce qu'il valide ensuite n'est plus écrit sur son compte.
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
  const router = useRouter();
  const pathname = usePathname();
  const serverUser = useUser();
  const trialUser = useTrialUser();

  const [prevStatus, setPrevStatus] = useState<SessionStatus>(status);
  const [everAuthenticated, setEverAuthenticated] = useState(status === "authenticated");

  // Ajusté PENDANT le rendu (même pattern que IntroCinematic pour
  // `prevOpen`/`index`), plutôt que dans un effet séparé : un effet ne
  // s'exécute qu'après la peinture du rendu où `status` vient de basculer,
  // donc `everAuthenticated` resterait périmé pour cette frame-là et le
  // bandeau "mode essai" pourrait s'afficher brièvement avant la redirection.
  // En ajustant l'état pendant le rendu, `decideUserMode` ci-dessous voit
  // toujours la valeur à jour dès le rendu qui suit le changement de statut :
  // aucune frame ne montre jamais `isTrial === true` pour une session qui a
  // déjà existé.
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "authenticated") setEverAuthenticated(true);
  }

  const { isTrial, sessionExpired } = decideUserMode(status, { everAuthenticated });

  // Redirection vers /login en cas d'expiration de session : la navigation
  // est un effet de bord réel (au sens React), elle doit donc rester dans un
  // effet même si la décision qui la déclenche est déjà correcte au rendu.
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
