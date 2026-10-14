import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * Against `pnpm dev`, no CSP is emitted (`proxy.ts`) and
 * `e2e/strict-csp.spec.ts` skips itself. `E2E_PROD=1` runs a production build,
 * like CI. Locally, `pnpm start` also requires an https, non-localhost
 * APP_URL and a RESEND_API_KEY (`lib/env.ts`), hence the switch.
 */
const isProduction = process.env.E2E_PROD === "1";

/**
 * E2E tests. `e2e/global-setup.ts` creates the verified user. Locally, you
 * need a migrated PostgreSQL database (`DATABASE_URL`) and Chromium installed:
 *   pnpm prisma migrate deploy
 *   pnpm exec playwright install chromium
 *   pnpm test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  fullyParallel: false,
  // A single worker: the whole suite shares the same E2E user and the same database.
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
    command: isProduction ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // The production build adds to startup time: 2 min is not enough.
    timeout: isProduction ? 300_000 : 120_000,
  },
});
