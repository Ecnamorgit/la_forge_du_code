import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * Contre `pnpm dev`, aucune CSP n'est émise (next.config.ts, garde `isProd`) :
 * `e2e/csp-srcdoc-script.spec.ts` se saute et ne prouve rien, et le script
 * inline du srcdoc de l'aperçu n'est jamais exercé sous la vraie politique.
 *
 * `E2E_PROD=1` lance donc un vrai build de production. C'est ce que fait la CI
 * (.github/workflows/ci.yml). En local, `pnpm start` exige en plus une APP_URL
 * https non-localhost et une RESEND_API_KEY (lib/env.ts) : d'où l'interrupteur
 * plutôt qu'un basculement sec.
 */
const enProduction = process.env.E2E_PROD === "1";

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
