import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";
import { E2E_USER, STORAGE_STATE } from "./global-setup";

/**
 * Clears the e2e account's progress on a chapter: the UI opens the
 * first unfinished step, and other specs share this account.
 */
async function resetProgress(course: string, chapter: string): Promise<void> {
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      'DELETE FROM "StepCompletion" WHERE "userId" = $1 AND course = $2 AND chapter = $3',
      [E2E_USER.id, course, chapter]
    );
  } finally {
    await client.end();
  }
}

/**
 * An endless loop in the learner's code must not freeze the tab
 * (audit EXE-02): JavaScript is instrumented (lib/sandbox/loop-protect.ts)
 * and SQL runs in a Worker that is terminated after the timeout.
 *
 * Each test has its own page: a frozen tab does not affect the next ones.
 */

test.use({ storageState: STORAGE_STATE });

/** Replaces the entire content of the Monaco editor. */
async function typeCode(page: Page, code: string): Promise<void> {
  const editor = page.locator(".monaco-editor").first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

/**
 * Checks that the tab still runs code, after giving the learner's code
 * time to start and the interruption timeout time to elapse.
 */
async function tabResponds(page: Page, timeoutMs = 10_000): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 6_000));
  return Promise.race([
    page.evaluate(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);
}

/** Copies browser errors into the test output. */
function logErrors(page: Page): void {
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`[console] ${m.text()}`);
  });
  page.on("pageerror", (e) => console.log(`[page] ${e.message}`));
}

test.beforeEach(({ page }) => logErrors(page));

const DEPLOY_BUTTON = /DEPLOYER/;

// The SQL control test is in sql-moteur.spec.ts.

test("JavaScript control: a normal program runs and is validated", async ({ page }) => {
  await resetProgress("javascript", "chapitre-1");
  await page.goto("/learn/javascript/chapitre-1");
  await typeCode(page, 'console.log("Bonjour, station Nebula")');
  await page.getByRole("button", { name: DEPLOY_BUTTON }).click();
  await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
});

test("SQL: an endless query is interrupted, the tab stays usable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/learn/sql/chapitre-1");
  await typeCode(
    page,
    "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM c)\nSELECT count(*) FROM c;"
  );
  await page.getByRole("button", { name: DEPLOY_BUTTON }).click();

  expect(await tabResponds(page), "l'onglet est figé").toBe(true);
  // The message also shows up in the console, hence `.first()`.
  await expect(page.getByText(/interrompue/i).first()).toBeVisible({ timeout: 15_000 });
});

test("JavaScript: an endless loop is interrupted, the tab stays usable", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/learn/javascript/chapitre-1");
  // A form that the literal filter in loop-guard.ts does not recognize.
  await typeCode(page, "let encore = true;\nwhile (encore) {}");
  await page.getByRole("button", { name: DEPLOY_BUTTON }).click();

  expect(await tabResponds(page), "l'onglet est figé").toBe(true);
  // The message also shows up in the console, hence `.first()`.
  await expect(page.getByText(/interrompue/i).first()).toBeVisible({ timeout: 15_000 });
});
