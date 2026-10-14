import { test, expect, type APIRequestContext } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Per-account login attempt limit (audit SRV-07), which the per-IP limit
 * does not replace against an attacker with many IPs.
 *
 * IPs are simulated with X-Forwarded-For: locally, without a proxy, the client
 * provides it; in production, Vercel sets it with the real address.
 *
 * Dedicated account, recreated for each test.
 */

const TARGET = {
  id: "e2e-connexion-user",
  email: "connexion@codeforge.test",
  username: "e2econnex",
  password: "Test1234",
};

async function recreateTarget(): Promise<void> {
  // Before any connection: we delete then recreate a User row.
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

/** One login attempt through the next-auth API, from the given IP. */
async function attemptLogin(request: APIRequestContext, password: string, ip: string): Promise<void> {
  const headers = { "x-forwarded-for": ip };
  const { csrfToken } = await (await request.get("/api/auth/csrf", { headers })).json();
  await request.post("/api/auth/callback/credentials", {
    headers,
    form: { email: TARGET.email, password, csrfToken, callbackUrl: "/dashboard" },
    maxRedirects: 0,
  });
}

async function signedInEmail(request: APIRequestContext): Promise<string | null> {
  const session = await (await request.get("/api/auth/session")).json();
  return session?.user?.email ?? null;
}

test("control: the correct password opens the session", async ({ request }) => {
  await recreateTarget();
  await attemptLogin(request, TARGET.password, "198.51.100.1");
  expect(await signedInEmail(request)).toBe(TARGET.email);
});

test("attempts spread across many IPs lock the account", async ({ request }) => {
  await recreateTarget();
  for (let i = 1; i <= 12; i++) {
    await attemptLogin(request, `mauvais-${i}-mdp`, `203.0.113.${i}`);
  }

  // The real password, from a never-seen IP: the account must
  // stay locked until the end of the window.
  await attemptLogin(request, TARGET.password, "203.0.113.100");
  expect(await signedInEmail(request), "compte verrouillé après 12 échecs").toBeNull();
});
