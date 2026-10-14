import { test, expect } from "@playwright/test";

/**
 * Trial flow without an account (no storageState): public map,
 * chapters 1 to 3 playable with cinematics, sign-up required beyond that.
 */

test("the HTML map is public, with sign-up locks beyond chapter 3", async ({
  page,
}) => {
  await page.goto("/learn/html");
  // No redirect to /login.
  await expect(page).toHaveURL(/\/learn\/html$/);

  // The intro starts by itself on the first visit.
  await expect(page.getByTestId("cinematic-player")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);

  // Nodes outside the trial: links to sign-up, flagged in the tooltip
  // shown on hover. The link wraps an absolutely positioned block
  // and has no size of its own: we hover that block.
  const chapter4Link = page.getByRole("link", { name: /\bCH\.4\b/ });
  await expect(chapter4Link).toHaveAttribute("href", "/signup");
  await chapter4Link.locator(":scope > div").hover();
  await expect(chapter4Link.getByText("Inscription requise")).toBeVisible();

  // Once seen (nc_cine_seen), it does not start again on reload.
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);
});

test("a protected chapter redirects to login", async ({ page }) => {
  await page.goto("/learn/html/chapitre-4");
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
});

test("chapter 1 in trial mode plays the outro then offers the next chapter", async ({
  page,
}) => {
  // Mark the intro as seen so only the outro is tested here.
  await page.goto("/learn/html/chapitre-1");
  await page.evaluate(() => {
    window.localStorage.setItem("nc_cine_seen", JSON.stringify(["html:intro"]));
  });

  const solutions = [
    "<!DOCTYPE html>\n<html></html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
  ];
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < solutions.length; i++) {
    const editor = page.locator(".monaco-editor").first();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.insertText(solutions[i]);
    await page.getByRole("button", { name: /DEPLOYER/ }).click();
    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 10_000 });
    const bannerBtn = page.getByRole("button", {
      name: i === solutions.length - 1 ? /TERMINER LE PROTOCOLE/ : /SYSTÈME SUIVANT/,
    });
    await bannerBtn.click();
  }

  // The chapter 1 outro leads to chapter 2.
  const player = page.getByTestId("cinematic-player");
  await expect(player).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Chapitre suivant/ }).click();
  await expect(page).toHaveURL(/\/learn\/html\/chapitre-2/, { timeout: 15_000 });
});
