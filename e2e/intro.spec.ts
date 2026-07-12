import { test, expect } from "@playwright/test";

const DIALOG = "Cinématique d'introduction Nebula Command";

test("la cinématique s'auto-joue à la première visite puis se saute", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: DIALOG });
  await expect(dialog).toBeVisible();

  await page.getByRole("button", { name: /passer/i }).click();
  await expect(dialog).toBeHidden();

  // Le hero est accessible après fermeture.
  await expect(
    page.getByRole("heading", { name: /nebula command/i })
  ).toBeVisible();
});

test("la cinématique ne se rejoue pas à la deuxième visite", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();

  // Deuxième visite dans le même contexte (flag localStorage posé).
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();
});

test("le bouton « Revoir l'intro » relance la cinématique", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeHidden();

  await page.getByRole("button", { name: /revoir l'intro/i }).click();
  await expect(page.getByRole("dialog", { name: DIALOG })).toBeVisible();
});
