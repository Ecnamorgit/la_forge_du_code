import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";
import { E2E_USER, STORAGE_STATE } from "./global-setup";

/**
 * Clears the e2e account's progress on a chapter: the UI opens the
 * first unfinished step, and the account is shared across tests and specs.
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
 * End-to-end HTML course: chapter 1 played through to the completion
 * screen, then the reference panel on a late chapter.
 */

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

async function setEditorContent(page: Page, code: string): Promise<void> {
  const editor = page.locator(".monaco-editor").first();
  await editor.click();
  // insertText replaces the selection without triggering Monaco's
  // tag auto-closing.
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

const CH1_SOLUTIONS = [
  "<!DOCTYPE html>\n<html></html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
];

/**
 * The HTML preview is a shell loaded via `src` from a dedicated origin
 * (audit EXE-03), which renders the learner's HTML in a nested iframe.
 */
test.describe("HTML preview on the dedicated origin", () => {
  // Shared session written by global-setup (per-IP login limit).
  test.use({ storageState: STORAGE_STATE });

  test("the HTML preview is rendered from a separate origin", async ({ page }) => {
  await resetProgress("html", "chapitre-1");
  await page.goto("/learn/html/chapitre-1");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });

  const preview = page.locator('iframe[title="Apercu"]');
  await expect(preview).toHaveCount(1);
  const src = await preview.getAttribute("src");
  expect(src, "l'aperçu doit être chargé par src, plus par srcDoc").not.toBeNull();
  const previewOrigin = new URL(src!).origin;
  const appOrigin = new URL(page.url()).origin;
  expect(new URL(src!).pathname).toBe("/bac-a-sable/html");
  expect(
    previewOrigin,
    `l'aperçu (${previewOrigin}) doit être servi depuis une autre origine que l'app (${appOrigin})`
  ).not.toBe(appOrigin);

  // Without <!DOCTYPE>, this HTML renders without validating the step: only
  // the rendering is checked here.
  await setEditorContent(page, "<h1>Bonjour Nebula</h1>");
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  // DOM selector rather than `getByRole`: the accessibility tree does not
  // reliably cross two nested opaque iframes.
  const scene = page
    .frameLocator('iframe[title="Apercu"]')
    .frameLocator('iframe[title="Rendu HTML"]');
  await expect(scene.locator("h1")).toHaveText("Bonjour Nebula", { timeout: 20_000 });
  });
});

test("HTML chapter 1: playable end to end through completion", async ({
  page,
}) => {
  // Independent of whatever ran before on this shared account.
  await resetProgress("html", "chapitre-1");
  await login(page);
  await page.goto("/learn/html/chapitre-1");

  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });

  const total = CH1_SOLUTIONS.length;

  for (let i = 0; i < total; i++) {
    const isLast = i === total - 1;

    await setEditorContent(page, CH1_SOLUTIONS[i]);
    await page.getByRole("button", { name: /DEPLOYER/ }).click();

    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({
      timeout: 10_000,
    });

    const bannerBtn = page.getByRole("button", {
      name: isLast ? /TERMINER LE PROTOCOLE/ : /SYSTÈME SUIVANT/,
    });
    await expect(bannerBtn).toBeVisible({ timeout: 10_000 });
    await bannerBtn.click();

    if (isLast) {
      // The outro comes before the completion screen: the E2E user, recreated
      // on every run, has never seen it.
      await expect(page.getByTestId("cinematic-player")).toBeVisible({
        timeout: 15_000,
      });
      await page.getByTestId("cinematic-skip").click();
      await expect(page.getByText(/COMPLÉTÉE/)).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(
        page.getByText(`Étape ${i + 2} sur ${total}`).first()
      ).toBeVisible({ timeout: 10_000 });
    }
  }
});

test("the reference panel opens from a docRef in a late chapter (ch8)", async ({
  page,
}) => {
  await login(page);
  await page.goto("/learn/html/chapitre-8");

  const panel = page.getByTestId("doc-panel");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  await page.locator('button[data-doc-ref="html/video"]').click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("La balise <video>")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
});
