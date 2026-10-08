import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertLocalAppUnderTest, assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Session authentifiée partagée par toutes les specs : `auth.ts` limite les
 * connexions à 10 par tranche de 5 minutes et par IP, seuil que la suite
 * dépasserait si chaque spec se connectait elle-même.
 */
export const STORAGE_STATE = path.join(process.cwd(), "playwright", ".auth", "e2e-user.json");

/**
 * Identifiants de l'utilisateur de test, déjà vérifié (emailVerified non null),
 * pour exercer le parcours authentifié sans dépendre d'un vrai email.
 */
export const E2E_USER = {
  id: "e2e-test-user",
  email: "e2e@codeforge.test",
  username: "e2etester",
  password: "Test1234",
};

/**
 * Crée (ou réinitialise) l'utilisateur de test directement en base avant la
 * suite e2e. Utilise `pg` brut pour éviter d'importer la couche `server-only`.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const url = process.env.DATABASE_URL;

  // Avant toute connexion : ce fichier efface et recrée des lignes de User, et
  // le `.env` du dépôt pointe sur la base de production.
  assertTestDatabaseUrl(url);

  // L'application testée peut utiliser une autre base que celle ensemencée
  // ici : cible distante (E2E_BASE_URL) ou serveur déjà lancé et réutilisé.
  assertLocalAppUnderTest(process.env.E2E_BASE_URL);

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const hash = await bcrypt.hash(E2E_USER.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1', [E2E_USER.id]);
    // emailVerified + onboardedAt non null : utilisateur prêt, sans overlay
    // d'onboarding qui pourrait masquer l'éditeur dans les tests.
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')
       ON CONFLICT (email)
       DO UPDATE SET password = EXCLUDED.password, "emailVerified" = NOW(), "onboardedAt" = NOW()`,
      [E2E_USER.id, E2E_USER.email, E2E_USER.username, hash]
    );
  } finally {
    await client.end();
  }

  await enregistrerSessionPartagee(config);
}

/**
 * Se connecte une fois et écrit l'état de session sur disque, repris par les
 * specs qui déclarent `storageState: STORAGE_STATE`.
 */
async function enregistrerSessionPartagee(config: FullConfig): Promise<void> {
  const baseURL =
    config.projects[0]?.use?.baseURL ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";

  const navigateur = await chromium.launch();
  try {
    const contexte = await navigateur.newContext({ baseURL });
    const page = await contexte.newPage();

    await page.goto("/login");
    await page.locator("#email").fill(E2E_USER.email);
    await page.locator("#password").fill(E2E_USER.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    try {
      await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    } catch {
      // Le compte vient d'être créé dans la base validée par la garde : un
      // échec ici signifie que l'application parle à une autre base.
      throw new Error(
        [
          `Connexion impossible avec le compte de test sur ${baseURL}.`,
          "",
          "Ce compte vient pourtant d'être créé dans la base validée par la",
          "garde. Une seule explication tient : l'application testée n'utilise",
          "pas cette base.",
          "",
          "Cause la plus fréquente : un serveur de développement déjà lancé sur",
          "un autre .env, que Playwright réutilise (`reuseExistingServer`).",
          "Arrête-le et relance la suite, pour qu'elle démarre le sien.",
          "",
          "N'insiste pas en contournant : la suite écrit par l'application.",
          "Si celle-ci parle à la production, elle y écrirait.",
        ].join("\n")
      );
    }

    await contexte.storageState({ path: STORAGE_STATE });
  } finally {
    await navigateur.close();
  }
}
