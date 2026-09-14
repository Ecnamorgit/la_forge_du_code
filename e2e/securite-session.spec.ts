import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Constat SRV-03 de l'audit de sécurité du 2026-09-12 : les sessions JWT
 * n'étaient jamais révoquées.
 *
 * Une session est un JWT signé, non stocké. Rien ne l'invalidait : une session
 * volée restait valable jusqu'à son expiration, même après que la victime avait
 * réinitialisé son mot de passe.
 *
 * Le test connecte un compte, obtient une session, puis simule la révocation en
 * incrémentant `sessionVersion` en base — ce que fait une réinitialisation de
 * mot de passe. La session ouverte avant doit alors cesser de fonctionner.
 *
 * Compte dédié, recréé à chaque exécution.
 */

const CIBLE = {
  id: "e2e-session-user",
  email: "session@codeforge.test",
  username: "e2esession",
  password: "Test1234",
};

async function recreerCible(): Promise<void> {
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

async function revoquerEnBase(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('UPDATE "User" SET "sessionVersion" = "sessionVersion" + 1 WHERE id = $1', [
      CIBLE.id,
    ]);
  } finally {
    await client.end();
  }
}

// Connexion via l'API de next-auth, avec une IP dédiée (x-forwarded-for) : le
// formulaire de login partage un budget de débit par IP (`login:unknown` en
// local) avec toutes les autres specs, et une connexion de plus le ferait
// déborder. La session s'installe dans le contexte de `page`, réutilisée par
// les `page.request` suivants.
async function connecter(page: Page): Promise<void> {
  const headers = { "x-forwarded-for": "198.51.100.77" };
  const { csrfToken } = await (await page.request.get("/api/auth/csrf", { headers })).json();
  await page.request.post("/api/auth/callback/credentials", {
    headers,
    form: { email: CIBLE.email, password: CIBLE.password, csrfToken, callbackUrl: "/dashboard" },
    maxRedirects: 0,
  });
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session?.user?.email, "la connexion a échoué").toBe(CIBLE.email);
}

const statutMe = async (page: Page) => (await page.request.get("/api/me")).status();

test("une session cesse de fonctionner quand le mot de passe est réinitialisé", async ({ page }) => {
  await recreerCible();
  await connecter(page);

  await test.step("témoin : la session vaut avant révocation", async () => {
    expect.soft(await statutMe(page)).toBe(200);
  });

  await revoquerEnBase();

  await test.step("après révocation, la session est refusée", async () => {
    expect.soft(await statutMe(page)).toBe(401);
  });
});
