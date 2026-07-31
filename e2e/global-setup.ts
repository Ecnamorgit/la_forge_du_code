import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

/**
 * Session authentifiée partagée par toutes les specs.
 *
 * `auth.ts` limite les connexions à 10 par tranche de 5 minutes et par IP. La
 * suite e2e dépassait ce seuil : chaque spec se connectait pour son compte, et
 * la onzième connexion prenait un 429 puis repartait sur /login. Le test qui
 * échouait changeait d'une exécution à l'autre — c'était simplement celui qui
 * tombait onzième.
 *
 * On se connecte donc UNE fois ici et les specs réutilisent l'état. Ça supprime
 * la contention au lieu d'affaiblir la limite, qui protège la production.
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
  if (!url) {
    throw new Error("DATABASE_URL requise pour les tests e2e.");
  }

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
 * Ouvre un navigateur, se connecte une seule fois et écrit l'état de session
 * sur disque. Les specs qui déclarent `storageState: STORAGE_STATE` démarrent
 * alors déjà authentifiées, sans repasser par le formulaire.
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
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    await contexte.storageState({ path: STORAGE_STATE });
  } finally {
    await navigateur.close();
  }
}
