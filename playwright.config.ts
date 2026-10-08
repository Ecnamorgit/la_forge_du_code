import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * Contre `pnpm dev`, aucune CSP n'est émise (`proxy.ts`) et
 * `e2e/csp-stricte.spec.ts` se saute. `E2E_PROD=1` lance un build de production,
 * comme la CI. En local, `pnpm start` exige aussi une APP_URL https
 * non-localhost et une RESEND_API_KEY (`lib/env.ts`), d'où l'interrupteur.
 */
const enProduction = process.env.E2E_PROD === "1";

/**
 * Tests e2e. `e2e/global-setup.ts` crée l'utilisateur vérifié. En local, il
 * faut une base PostgreSQL (`DATABASE_URL`) migrée et Chromium installé :
 *   pnpm prisma migrate deploy
 *   pnpm exec playwright install chromium
 *   pnpm test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  fullyParallel: false,
  // Un seul worker : toute la suite partage le même utilisateur E2E et la même base.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: enProduction ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // Le build de production s'ajoute au démarrage : 2 min ne suffisent pas.
    timeout: enProduction ? 300_000 : 120_000,
  },
});
