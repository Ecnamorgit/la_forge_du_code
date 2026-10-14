import { expect, test, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/** Skips the crawl overlay if it is present. */
async function skipIntro(page: Page) {
  const skip = page.getByRole("button", { name: /passer|continuer/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

test.describe("trial without an account", () => {
  test("a visitor reaches the trial chapter from the landing page", async ({ page }) => {
    await page.goto("/");
    await skipIntro(page);

    await page.getByRole("link", { name: /essayer sans compte/i }).click();
    await expect(page).toHaveURL(/\/learn\/html\/chapitre-1/);
    await expect(page.getByText(/mode essai/i)).toBeVisible();
  });

  test("the wall holds on the other chapters", async ({ page }) => {
    await page.goto("/learn/html/chapitre-4");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/learn/css/chapitre-1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("trial progress survives a reload", async ({ page }) => {
    await page.goto("/learn/html/chapitre-1");
    await expect(page.getByText(/mode essai/i)).toBeVisible();

    const stored = await page.evaluate(() => {
      window.localStorage.setItem(
        "nc_trial_state",
        JSON.stringify({ completedSteps: [0], xp: 25 })
      );
      return window.localStorage.getItem("nc_trial_state");
    });
    expect(stored).toContain("25");

    await page.reload();
    const after = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(after).toContain("25");
  });
});

/**
 * Import of trial progress into an account (CF-9), triggered on
 * arriving at /avatar. We reuse E2E_USER rather than creating an account.
 */

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

interface MeState {
  totalXp: number;
  completedSteps: Record<string, number[]>;
}

/** Server state of the logged-in user, read through the API. */
async function readMe(page: Page): Promise<MeState> {
  const res = await page.request.get("/api/me");
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.describe("import of trial progress into an account", () => {
  test("trial progress is imported on arriving at /avatar", async ({
    page,
  }) => {
    await login(page);

    // The shared account may have validated these steps in another spec
    // (html-course.spec.ts): we check the final state rather than a delta.
    const seededSteps = [0, 1, 2];

    // Trial chapter finished before sign-up. The `xp` value hardly matters:
    // the server recomputes XP from the scoring scale.
    await page.evaluate(() => {
      window.localStorage.setItem(
        "nc_trial_state",
        JSON.stringify({ completedSteps: [0, 1, 2], xp: 75 })
      );
    });

    const importResponse = page.waitForResponse(
      (res) =>
        /\/api\/me\/trial-import$/.test(res.url()) &&
        res.request().method() === "POST"
    );
    await page.goto("/avatar");
    const res = await importResponse;
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { imported: number };
    // Already validated steps are not counted again: only a bound is certain.
    expect(body.imported).toBeGreaterThanOrEqual(0);
    expect(body.imported).toBeLessThanOrEqual(seededSteps.length);

    // The state is read back from the server, not from the localStorage seeded here.
    const after = await readMe(page);
    const completed = new Set(after.completedSteps["html/chapitre-1"] ?? []);
    for (const step of seededSteps) {
      expect(completed.has(step)).toBe(true);
    }

    // Local storage is cleared after a successful import.
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(stored).toBeNull();
  });
});
