import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

test("la page d'accueil se charge", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/La Forge du Code/i);
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

test("le codex est public et rend le lore", async ({ page }) => {
  const response = await page.goto("/codex");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/codex/i);
  await expect(page.getByRole("heading", { name: /spectre/i })).toBeVisible();
});

test("le cursus React a un vrai apercu en direct, plus l'ancienne etiquette d'analyse statique", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/learn/react/chapitre-7");

  // L'onglet de l'éditeur annonce du JSX, pas du HTML.
  await expect(page.getByText("App.jsx", { exact: true })).toBeVisible();
  await expect(page.getByText("index.html", { exact: true })).toHaveCount(0);

  await expect(page.getByText(/Aperçu du composant/i).first()).toBeVisible();
  await expect(page.getByText(/Analyse statique/i)).toHaveCount(0);
  await expect(page.locator('iframe[title="Apercu"]')).toHaveCount(0);
  await expect(page.locator('iframe[title="Aperçu du composant React"]')).toHaveCount(1);
});

test("le cursus HTML garde son apercu en direct", async ({ page }) => {
  await page.goto("/learn/html/chapitre-1");
  await expect(page.getByText("index.html", { exact: true })).toBeVisible();
  await expect(page.locator('iframe[title="Apercu"]')).toHaveCount(1);
  await expect(page.getByText(/Analyse statique/i)).toHaveCount(0);
});
