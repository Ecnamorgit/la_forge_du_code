import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertLocalAppUnderTest, assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Authenticated session shared by all specs: `auth.ts` limits logins
 * to 10 per 5-minute window per IP, a threshold the suite would
 * exceed if each spec logged in by itself.
 */
export const STORAGE_STATE = path.join(process.cwd(), "playwright", ".auth", "e2e-user.json");

/**
 * Credentials of the test user, already verified (emailVerified not null),
 * to exercise the authenticated flow without depending on a real email.
 */
export const E2E_USER = {
  id: "e2e-test-user",
  email: "e2e@codeforge.test",
  username: "e2etester",
  password: "Test1234",
};

/**
 * Creates (or resets) the test user directly in the database before the
 * e2e suite. Uses raw `pg` to avoid importing the `server-only` layer.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const url = process.env.DATABASE_URL;

  // Before any connection: this file deletes and recreates User rows, and
  // the repo's `.env` points at the production database.
  assertTestDatabaseUrl(url);

  // A remote target (E2E_BASE_URL) would talk to an unseeded database.
  // An already running local server being reused is not detected here.
  assertLocalAppUnderTest(process.env.E2E_BASE_URL);

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const hash = await bcrypt.hash(E2E_USER.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1', [E2E_USER.id]);
    // emailVerified + onboardedAt not null: user is ready, with no onboarding
    // overlay that could hide the editor in the tests.
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')
       ON CONFLICT (email)
       DO UPDATE SET password = EXCLUDED.password, "emailVerified" = NOW(), "onboardedAt" = NOW()`,
      [E2E_USER.id, E2E_USER.email, E2E_USER.username, hash]
    );
  } finally {
    await client.end();
  }

  await saveSharedSession(config);
}

/**
 * Logs in once and writes the session state to disk, picked up by the
 * specs that declare `storageState: STORAGE_STATE`.
 */
async function saveSharedSession(config: FullConfig): Promise<void> {
  const baseURL =
    config.projects[0]?.use?.baseURL ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";

  const browser = await chromium.launch();
  try {
    const browserContext = await browser.newContext({ baseURL });
    const page = await browserContext.newPage();

    await page.goto("/login");
    await page.locator("#email").fill(E2E_USER.email);
    await page.locator("#password").fill(E2E_USER.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    try {
      await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    } catch {
      // The account was just created in the database the guard approved: a
      // failure here means the app is talking to another database.
      throw new Error(
        [
          `Connexion impossible avec le compte de test sur ${baseURL}.`,
          "",
          "Ce compte vient pourtant d'être créé dans la base validée par la",
          "garde. Une seule explication tient : l'application testée n'utilise",
          "pas cette base.",
          "",
          "Cause la plus fréquente : un serveur de développement déjà lancé sur",
          "un autre .env, que Playwright réutilise (`reuseExistingServer`).",
          "Arrête-le et relance la suite, pour qu'elle démarre le sien.",
          "",
          "N'insiste pas en contournant : la suite écrit par l'application.",
          "Si celle-ci parle à la production, elle y écrirait.",
        ].join("\n")
      );
    }

    await browserContext.storageState({ path: STORAGE_STATE });
  } finally {
    await browser.close();
  }
}
