import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Une réinitialisation du mot de passe révoque les sessions JWT ouvertes
 * (audit SRV-03). La révocation est simulée en incrémentant `sessionVersion`
 * en base, comme le fait la réinitialisation.
 *
 * Compte dédié, recréé à chaque exécution.
 */

const TARGET = {
  id: "e2e-session-user",
  email: "session@codeforge.test",
  username: "e2esession",
  password: "Test1234",
};

async function recreateTarget(): Promise<void> {
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(TARGET.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [TARGET.id, TARGET.email]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [TARGET.id, TARGET.email, TARGET.username, hash]
    );
  } finally {
    await client.end();
  }
}

async function revokeInDatabase(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('UPDATE "User" SET "sessionVersion" = "sessionVersion" + 1 WHERE id = $1', [
      TARGET.id,
    ]);
  } finally {
    await client.end();
  }
}

// Connexion par l'API de next-auth avec une IP dédiée : le formulaire partage
// son budget de connexions par IP avec les autres specs. La session reste dans
// le contexte de `page`.
async function logIn(page: Page): Promise<void> {
  const headers = { "x-forwarded-for": "198.51.100.77" };
  const { csrfToken } = await (await page.request.get("/api/auth/csrf", { headers })).json();
  await page.request.post("/api/auth/callback/credentials", {
    headers,
    form: { email: TARGET.email, password: TARGET.password, csrfToken, callbackUrl: "/dashboard" },
    maxRedirects: 0,
  });
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session?.user?.email, "la connexion a échoué").toBe(TARGET.email);
}

const meStatus = async (page: Page) => (await page.request.get("/api/me")).status();

test("une session cesse de fonctionner quand le mot de passe est réinitialisé", async ({ page }) => {
  await recreateTarget();
  await logIn(page);

  await test.step("témoin : la session vaut avant révocation", async () => {
    expect.soft(await meStatus(page)).toBe(200);
  });

  await revokeInDatabase();

  await test.step("après révocation, la session est refusée", async () => {
    expect.soft(await meStatus(page)).toBe(401);
  });
});
