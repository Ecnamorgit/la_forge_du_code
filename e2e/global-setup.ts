import { Client } from "pg";
import bcrypt from "bcryptjs";

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
export default async function globalSetup(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL requise pour les tests e2e.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const hash = await bcrypt.hash(E2E_USER.password, 10);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), '')
       ON CONFLICT (email)
       DO UPDATE SET password = EXCLUDED.password, "emailVerified" = NOW()`,
      [E2E_USER.id, E2E_USER.email, E2E_USER.username, hash]
    );
  } finally {
    await client.end();
  }
}
