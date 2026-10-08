import { describe, expect, it } from "vitest";

import { decideUserMode, type UserModeState } from "./user-context";

const fresh: UserModeState = { everAuthenticated: false };

describe("decideUserMode", () => {
  it("visiteur jamais connecté : mode essai, pas de redirection", () => {
    const decision = decideUserMode("unauthenticated", fresh);
    expect(decision).toEqual({
      everAuthenticated: false,
      isTrial: true,
      sessionExpired: false,
    });
  });

  it("chargement initial : ni essai, ni expiré, ni jamais authentifié", () => {
    const decision = decideUserMode("loading", fresh);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(false);
    expect(decision.everAuthenticated).toBe(false);
  });

  it("connexion active : mémorise everAuthenticated, jamais en mode essai", () => {
    const decision = decideUserMode("authenticated", fresh);
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: false,
    });
  });

  // Un utilisateur déjà authentifié dont la session expire (JWT expiré,
  // relecture au focus) est redirigé vers /login, jamais basculé en essai.
  it("expiration en cours d'usage : redirige, ne bascule jamais en essai", () => {
    const decision = decideUserMode("unauthenticated", { everAuthenticated: true });
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: true,
    });
  });

  it("everAuthenticated reste vrai une fois acquis, même en repassant par 'loading'", () => {
    const decision = decideUserMode("loading", { everAuthenticated: true });
    expect(decision.everAuthenticated).toBe(true);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(false);
  });

  it("authenticated est idempotent sur everAuthenticated déjà vrai", () => {
    const decision = decideUserMode("authenticated", { everAuthenticated: true });
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: false,
    });
  });

  // Parcours complet simulant le montage : jamais connecté -> essai stable.
  it("séquence visiteur : loading -> unauthenticated reste en essai", () => {
    let state: UserModeState = { everAuthenticated: false };
    let decision = decideUserMode("loading", state);
    state = decision;
    decision = decideUserMode("unauthenticated", state);
    expect(decision.isTrial).toBe(true);
    expect(decision.sessionExpired).toBe(false);
  });

  // Parcours complet : connecté, puis session expirée.
  it("séquence session expirée : loading -> authenticated -> unauthenticated redirige", () => {
    let state: UserModeState = { everAuthenticated: false };
    state = decideUserMode("loading", state);
    state = decideUserMode("authenticated", state);
    const decision = decideUserMode("unauthenticated", state);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(true);
  });
});
