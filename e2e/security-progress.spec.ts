import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * POST /api/me/step only grants a step for a real solution (audit
 * EXE-01). The test calls the API directly, as a script would.
 *
 * "Soft" assertions: each attempt is reported even if a previous one
 * fails. The steps build on the same progress.
 *
 * Dedicated account, recreated on every run, so as not to skew the specs that
 * share E2E_USER.
 */

const CHEATER = {
  id: "e2e-triche-user",
  email: "triche@codeforge.test",
  username: "e2etriche",
  password: "Test1234",
};

// Valid solutions for the steps of HTML chapter 1 (see html-course.spec.ts).
const CH1 = [
  "<!DOCTYPE html>\n<html></html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
];

async function recreateCheater(): Promise<void> {
  // Before any connection: we delete then recreate a User row.
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(CHEATER.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [
      CHEATER.id,
      CHEATER.email,
    ]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [CHEATER.id, CHEATER.email, CHEATER.username, hash]
    );
  } finally {
    await client.end();
  }
}

async function logIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(CHEATER.email);
  await page.locator("#password").fill(CHEATER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("the API only grants a step for a real solution, in order, without bursts", async ({
  page,
}) => {
  await recreateCheater();
  await logIn(page);

  /** Declares an HTML course step, without going through the UI. */
  const declareStep = async (chapter: string, stepIndex: number, code?: string) =>
    (
      await page.request.post("/api/me/step", {
        data: { course: "html", chapter, stepIndex, code },
      })
    ).status();

  await test.step("a real solution, in order, is accepted", async () => {
    expect.soft(await declareStep("chapitre-1", 0, CH1[0])).toBe(200);
  });

  await test.step("skipping a step is rejected", async () => {
    // Step 2 is valid in itself, but step 1 was never done.
    expect.soft(await declareStep("chapitre-1", 2, CH1[2])).toBe(409);
  });

  await test.step("declaring a step without a solution is rejected", async () => {
    expect.soft(await declareStep("chapitre-1", 1)).toBe(422);
  });

  await test.step("another step's solution is rejected", async () => {
    // Solution of step 0, without <title>: does not validate step 1.
    expect.soft(await declareStep("chapitre-1", 1, CH1[0])).toBe(422);
  });

  await test.step("a burst of calls is rate-limited", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 25; i++) statuses.push(await declareStep("chapitre-1", 1, ""));
    expect.soft(statuses).toContain(429);
  });
});
