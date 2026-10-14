import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

test("the home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/La Forge du Code/i);
});

test("a protected route redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("the login page shows the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
});

test("a verified user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});

test("the codex is public and renders the lore", async ({ page }) => {
  const response = await page.goto("/codex");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/codex/i);
  await expect(page.getByRole("heading", { name: /spectre/i })).toBeVisible();
});

test("the React course has a real live preview, no longer the old static analysis label", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/learn/react/chapitre-7");

  // The editor tab announces JSX, not HTML.
  await expect(page.getByText("App.jsx", { exact: true })).toBeVisible();
  await expect(page.getByText("index.html", { exact: true })).toHaveCount(0);

  await expect(page.getByText(/Aperçu du composant/i).first()).toBeVisible();
  await expect(page.getByText(/Analyse statique/i)).toHaveCount(0);
  await expect(page.locator('iframe[title="Apercu"]')).toHaveCount(0);
  await expect(page.locator('iframe[title="Aperçu du composant React"]')).toHaveCount(1);
});

test("the HTML course keeps its live preview", async ({ page }) => {
  await page.goto("/learn/html/chapitre-1");
  await expect(page.getByText("index.html", { exact: true })).toBeVisible();
  await expect(page.locator('iframe[title="Apercu"]')).toHaveCount(1);
  await expect(page.getByText(/Analyse statique/i)).toHaveCount(0);
});
