import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The forgot-password and resend-verification routes respond the same whether
 * or not an account exists. The token and the email are produced only after
 * the response (`after`): awaiting them would slow the response for a
 * registered address, and the delay would reveal the account.
 */

const mockState = vi.hoisted(() => ({
  user: null as null | Record<string, unknown>,
  deferred: [] as (() => Promise<void> | void)[],
}));

const createToken = vi.hoisted(() => vi.fn(async () => "jeton"));
const sendPasswordResetEmail = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
const sendVerificationEmail = vi.hoisted(() => vi.fn(async () => ({ ok: true })));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (cb: () => Promise<void> | void) => {
    mockState.deferred.push(cb);
  },
}));
vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: async () => mockState.user } },
}));
vi.mock("@/lib/tokens", () => ({ createToken }));
vi.mock("@/lib/email", () => ({ sendPasswordResetEmail, sendVerificationEmail }));
vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "203.0.113.7",
  rateLimit: async () => ({ ok: true, remaining: 4, retryAfter: 0 }),
  tooManyRequests: () => new Response(null, { status: 429 }),
}));
vi.mock("@/lib/same-origin", () => ({ crossOriginRefusal: () => null }));

import { POST as motDePasseOublie } from "./forgot-password/route";
import { POST as renvoyerVerification } from "./resend-verification/route";

const makeRequest = (email: string) =>
  new Request("http://localhost/api/auth/x", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });

const CASES = [
  {
    label: "mot de passe oublié",
    post: motDePasseOublie,
    account: { id: "u1", email: "cadet@exemple.fr", password: "hash" },
    sendEmail: sendPasswordResetEmail,
  },
  {
    label: "renvoi de la vérification",
    post: renvoyerVerification,
    account: { id: "u1", email: "cadet@exemple.fr", emailVerified: null },
    sendEmail: sendVerificationEmail,
  },
];

describe.each(CASES)("$label: sends after the response",({ post, account, sendEmail }) => {
  beforeEach(() => {
    mockState.user = null;
    mockState.deferred.length = 0;
    createToken.mockClear();
    sendEmail.mockClear();
  });

  it("responds without waiting for the token or email for an existing account",async () => {
    mockState.user = account;

    const res = await post(makeRequest("cadet@exemple.fr"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(createToken).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(mockState.deferred).toHaveLength(1);

    await mockState.deferred[0]();
    expect(createToken).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith({ to: "cadet@exemple.fr", token: "jeton" });
  });

  it("responds the same way for an unknown address, without scheduling anything",async () => {
    const res = await post(makeRequest("inconnu@exemple.fr"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockState.deferred).toHaveLength(0);
  });

  it("does not fail if sending fails after the response",async () => {
    mockState.user = account;
    sendEmail.mockResolvedValueOnce({ ok: false, error: "panne" } as never);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await post(makeRequest("cadet@exemple.fr"));

    await expect(mockState.deferred[0]()).resolves.toBeUndefined();
  });
});
