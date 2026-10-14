import { describe, expect, it } from "vitest";

import { decideUserMode, type UserModeState } from "./user-context";

const fresh: UserModeState = { everAuthenticated: false };

describe("decideUserMode", () => {
  it("visitor never signed in: trial mode, no redirect", () => {
    const decision = decideUserMode("unauthenticated", fresh);
    expect(decision).toEqual({
      everAuthenticated: false,
      isTrial: true,
      sessionExpired: false,
    });
  });

  it("initial loading: not trial, not expired, never authenticated", () => {
    const decision = decideUserMode("loading", fresh);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(false);
    expect(decision.everAuthenticated).toBe(false);
  });

  it("active session: records everAuthenticated, never in trial mode", () => {
    const decision = decideUserMode("authenticated", fresh);
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: false,
    });
  });

  // An already authenticated user whose session expires (expired JWT,
  // re-read on focus) is redirected to /login, never switched to trial.
  it("expiry during use: redirects, never switches to trial", () => {
    const decision = decideUserMode("unauthenticated", { everAuthenticated: true });
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: true,
    });
  });

  it("everAuthenticated stays true once set, even when going back through 'loading'", () => {
    const decision = decideUserMode("loading", { everAuthenticated: true });
    expect(decision.everAuthenticated).toBe(true);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(false);
  });

  it("authenticated is idempotent when everAuthenticated is already true", () => {
    const decision = decideUserMode("authenticated", { everAuthenticated: true });
    expect(decision).toEqual({
      everAuthenticated: true,
      isTrial: false,
      sessionExpired: false,
    });
  });

  // Full sequence simulating mount: never signed in -> stable trial.
  it("visitor sequence: loading -> unauthenticated stays in trial", () => {
    let state: UserModeState = { everAuthenticated: false };
    let decision = decideUserMode("loading", state);
    state = decision;
    decision = decideUserMode("unauthenticated", state);
    expect(decision.isTrial).toBe(true);
    expect(decision.sessionExpired).toBe(false);
  });

  // Full sequence: signed in, then session expired.
  it("expired session sequence: loading -> authenticated -> unauthenticated redirects", () => {
    let state: UserModeState = { everAuthenticated: false };
    state = decideUserMode("loading", state);
    state = decideUserMode("authenticated", state);
    const decision = decideUserMode("unauthenticated", state);
    expect(decision.isTrial).toBe(false);
    expect(decision.sessionExpired).toBe(true);
  });
});
