import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Constat EXE-01 de l'audit de sécurité du 2026-09-12 : la progression ne doit
 * pas se déclarer.
 *
 * Avant le correctif, POST /api/me/step accordait n'importe quelle étape sur
 * simple déclaration du navigateur : un compte pouvait prendre XP, badges et
 * tête du classement par une boucle d'appels, sans jamais écrire de code. Ce
 * test appelle l'API directement, comme le ferait un script.
 *
 * Un seul test, découpé en étapes aux assertions « soft » : chaque tentative
 * de triche est vérifiée et rapportée, même quand une précédente échoue. Les
 * étapes s'enchaînent sur la même progression, dans l'ordre d'un script.
 *
 * Compte dédié, recréé à chaque exécution : la progression qu'il accumule ne
 * doit pas fausser les specs qui partagent E2E_USER.
 */

const TRICHEUR = {
  id: "e2e-triche-user",
  email: "triche@codeforge.test",
  username: "e2etriche",
  password: "Test1234",
};

// Solutions valides des étapes du chapitre 1 HTML (cf. html-parcours.spec.ts).
const CH1 = [
  "<!DOCTYPE html>\n<html></html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
];

async function recreerTricheur(): Promise<void> {
  // AVANT toute connexion : on efface puis recrée une ligne de User.
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(TRICHEUR.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [
      TRICHEUR.id,
      TRICHEUR.email,
    ]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [TRICHEUR.id, TRICHEUR.email, TRICHEUR.username, hash]
    );
  } finally {
    await client.end();
  }
}

async function connecter(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(TRICHEUR.email);
  await page.locator("#password").fill(TRICHEUR.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("l'API n'accorde une étape que sur une vraie solution, à son tour, sans rafale", async ({
  page,
}) => {
  await recreerTricheur();
  await connecter(page);

  /** Déclare une étape du cursus HTML, sans passer par l'interface. */
  const declarer = async (chapter: string, stepIndex: number, code?: string) =>
    (
      await page.request.post("/api/me/step", {
        data: { course: "html", chapter, stepIndex, code },
      })
    ).status();

  await test.step("une vraie solution, à son tour, est acceptée", async () => {
    expect.soft(await declarer("chapitre-1", 0, CH1[0])).toBe(200);
  });

  await test.step("sauter une étape est refusé", async () => {
    // L'étape 2 est valide en soi, mais l'étape 1 n'a jamais été faite.
    expect.soft(await declarer("chapitre-1", 2, CH1[2])).toBe(409);
  });

  await test.step("déclarer une étape sans solution est refusé", async () => {
    expect.soft(await declarer("chapitre-1", 1)).toBe(422);
  });

  await test.step("la solution d'une autre étape est refusée", async () => {
    // Solution de l'étape 0, sans <title> : ne valide pas l'étape 1.
    expect.soft(await declarer("chapitre-1", 1, CH1[0])).toBe(422);
  });

  await test.step("une rafale d'appels est limitée", async () => {
    const statuts: number[] = [];
    for (let i = 0; i < 25; i++) statuts.push(await declarer("chapitre-1", 1, ""));
    expect.soft(statuts).toContain(429);
  });
});
