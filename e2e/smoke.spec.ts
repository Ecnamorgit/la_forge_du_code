import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

test("la page d'accueil se charge", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CodeForge/i);
});

test("une route protégée redirige vers /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("la page de connexion affiche le formulaire", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
});

test("un utilisateur vérifié peut se connecter", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});
