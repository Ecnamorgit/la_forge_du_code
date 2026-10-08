import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * « Mot de passe oublié » et « renvoyer la vérification » répondent pareil
 * qu'un compte existe ou non. Le jeton et l'e-mail ne sont produits qu'après
 * la réponse (`after`) : les attendre rallongerait la réponse pour une adresse
 * inscrite, et le délai révélerait le compte.
 */

const etat = vi.hoisted(() => ({
  user: null as null | Record<string, unknown>,
  differes: [] as (() => Promise<void> | void)[],
}));

const createToken = vi.hoisted(() => vi.fn(async () => "jeton"));
const sendPasswordResetEmail = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
const sendVerificationEmail = vi.hoisted(() => vi.fn(async () => ({ ok: true })));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (cb: () => Promise<void> | void) => {
    etat.differes.push(cb);
  },
}));
vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: async () => etat.user } },
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

const requete = (email: string) =>
  new Request("http://localhost/api/auth/x", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });

const CAS = [
  {
    nom: "mot de passe oublié",
    post: motDePasseOublie,
    compte: { id: "u1", email: "cadet@exemple.fr", password: "hash" },
    envoi: sendPasswordResetEmail,
  },
  {
    nom: "renvoi de la vérification",
    post: renvoyerVerification,
    compte: { id: "u1", email: "cadet@exemple.fr", emailVerified: null },
    envoi: sendVerificationEmail,
  },
];

describe.each(CAS)("$nom : envoi après la réponse", ({ post, compte, envoi }) => {
  beforeEach(() => {
    etat.user = null;
    etat.differes.length = 0;
    createToken.mockClear();
    envoi.mockClear();
  });

  it("répond sans attendre le jeton ni l'e-mail pour un compte existant", async () => {
    etat.user = compte;

    const res = await post(requete("cadet@exemple.fr"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(createToken).not.toHaveBeenCalled();
    expect(envoi).not.toHaveBeenCalled();
    expect(etat.differes).toHaveLength(1);

    await etat.differes[0]();
    expect(createToken).toHaveBeenCalledOnce();
    expect(envoi).toHaveBeenCalledWith({ to: "cadet@exemple.fr", token: "jeton" });
  });

  it("répond de la même façon pour une adresse inconnue, sans rien programmer", async () => {
    const res = await post(requete("inconnu@exemple.fr"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(etat.differes).toHaveLength(0);
  });

  it("n'échoue pas si l'envoi échoue après la réponse", async () => {
    etat.user = compte;
    envoi.mockResolvedValueOnce({ ok: false, error: "panne" } as never);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await post(requete("cadet@exemple.fr"));

    await expect(etat.differes[0]()).resolves.toBeUndefined();
  });
});
