import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Hints are rendered as text, not injected as HTML
 * (audit EXE-04): many contain HTML or JSX code to copy, like
 * the one in the first step of HTML chapter 2.
 */

test.use({ storageState: STORAGE_STATE });

const HINT_CODE =
  '<a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>';

test("the hint shows the code to type, without injecting it into the page", async ({ page }) => {
  await page.goto("/learn/html/chapitre-2");

  const hintButton = page.getByRole("button", { name: /Indice/ });
  const injectedLink = page.getByRole("link", { name: "Documentation MDN" });
  await expect(hintButton).toBeVisible({ timeout: 30_000 });
  await expect(injectedLink).toHaveCount(0);

  await hintButton.click();

  // The hint box: "H.E.L.P." header, and the hint text.
  const hintBox = page
    .locator("div.fixed")
    .filter({ hasText: "H.E.L.P." })
    .filter({ hasText: "Documentation MDN" });
  await expect(hintBox).toBeVisible();

  // Immediate count, without waiting: the hint closes by itself after 6 s, and
  // a waiting check would see the link disappear along with the box.
  await test.step("no link is injected into the page", async () => {
    expect.soft(await injectedLink.count()).toBe(0);
  });

  await test.step("the hint code is shown verbatim", async () => {
    await expect.soft(hintBox).toContainText(HINT_CODE);
  });
});
