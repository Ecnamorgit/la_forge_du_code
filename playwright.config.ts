import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration des tests e2e (CF-8).
 *
 * Le serveur est démarré automatiquement (`webServer`). En CI, une base
 * Postgres de service est fournie (cf. .github/workflows/ci.yml) et un
 * utilisateur vérifié est créé par `e2e/global-setup.ts`.
 *
 * Prérequis local : une base PostgreSQL accessible via `DATABASE_URL`, puis
 *   pnpm prisma migrate deploy
 *   pnpm exec playwright install chromium
 *   pnpm test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
