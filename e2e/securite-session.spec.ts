import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * A password reset revokes open JWT sessions
 * (audit SRV-03). Revocation is simulated by incrementing `sessionVersion`
 * in the database, as the reset does.
 *
 * Dedicated account, recreated on every run.
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

// Login through the next-auth API with a dedicated IP: the form shares
// its per-IP login budget with the other specs. The session stays in
// the `page` context.
async function logIn(page: Page): Promise<void> {
  const headers = { "x-forwarded-for": "198.51.100.77" };
  const { csrfToken } = await (await page.request.get("/api/auth/csrf", { headers })).json();
  await page.request.post("/api/auth/callback/credentials", {
    headers,
    form: { email: TARGET.email, password: TARGET.password, csrfToken, callbackUrl: "/dashboard" },
    maxRedirects: 0,
  });
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session?.user?.email, "sign-in failed").toBe(TARGET.email);
}

const meStatus = async (page: Page) => (await page.request.get("/api/me")).status();

test("a session stops working when the password is reset", async ({ page }) => {
  await recreateTarget();
  await logIn(page);

  await test.step("control: the session is valid before revocation", async () => {
    expect.soft(await meStatus(page)).toBe(200);
  });

  await revokeInDatabase();

  await test.step("after revocation, the session is rejected", async () => {
    expect.soft(await meStatus(page)).toBe(401);
  });
});
