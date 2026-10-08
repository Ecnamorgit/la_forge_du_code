import { test, expect, type APIRequestContext } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Limite de tentatives de connexion par compte (audit SRV-07), que la limite
 * par IP ne remplace pas face à un attaquant aux IP multiples.
 *
 * Les IP sont simulées par X-Forwarded-For : en local, sans proxy, le client
 * le fournit ; en production, Vercel le pose avec la vraie adresse.
 *
 * Compte dédié, recréé à chaque test.
 */

const CIBLE = {
  id: "e2e-connexion-user",
  email: "connexion@codeforge.test",
  username: "e2econnex",
  password: "Test1234",
};

async function recreerCible(): Promise<void> {
  // Avant toute connexion : on efface puis recrée une ligne de User.
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(CIBLE.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [CIBLE.id, CIBLE.email]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [CIBLE.id, CIBLE.email, CIBLE.username, hash]
    );
  } finally {
    await client.end();
  }
}

/** Une tentative de connexion par l'API de next-auth, depuis l'IP donnée. */
async function tenter(request: APIRequestContext, password: string, ip: string): Promise<void> {
  const headers = { "x-forwarded-for": ip };
  const { csrfToken } = await (await request.get("/api/auth/csrf", { headers })).json();
  await request.post("/api/auth/callback/credentials", {
    headers,
    form: { email: CIBLE.email, password, csrfToken, callbackUrl: "/dashboard" },
    maxRedirects: 0,
  });
}

async function emailConnecte(request: APIRequestContext): Promise<string | null> {
  const session = await (await request.get("/api/auth/session")).json();
  return session?.user?.email ?? null;
}

test("témoin : le bon mot de passe ouvre la session", async ({ request }) => {
  await recreerCible();
  await tenter(request, CIBLE.password, "198.51.100.1");
  expect(await emailConnecte(request)).toBe(CIBLE.email);
});

test("des essais répartis sur de nombreuses IP verrouillent le compte", async ({ request }) => {
  await recreerCible();
  for (let i = 1; i <= 12; i++) {
    await tenter(request, `mauvais-${i}-mdp`, `203.0.113.${i}`);
  }

  // Le vrai mot de passe, depuis une IP encore jamais vue : le compte doit
  // rester fermé jusqu'à la fin de la fenêtre.
  await tenter(request, CIBLE.password, "203.0.113.100");
  expect(await emailConnecte(request), "compte verrouillé après 12 échecs").toBeNull();
});
