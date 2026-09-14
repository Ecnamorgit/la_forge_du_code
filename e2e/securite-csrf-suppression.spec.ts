import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Constat SRV-09 de l'audit de sécurité du 2026-09-12 : les API qui modifient
 * des données ne vérifiaient pas l'origine de la requête, et la suppression
 * de compte ne redemandait pas le mot de passe.
 *
 * - Origine : aujourd'hui, seul le cookie SameSite=Lax protège. Or SameSite
 *   raisonne par site : un sous-domaine (comme le futur bac à sable, constat
 *   EXE-03) enverrait des requêtes authentifiées. La requête est simulée ici
 *   avec un en-tête Origin étranger et la session du compte, ce que ferait un
 *   navigateur depuis ce sous-domaine.
 * - Suppression : une session volée, ou un ordinateur resté connecté,
 *   suffisait à effacer définitivement le compte.
 *
 * Compte dédié, recréé à chaque exécution : le test le supprime.
 */

const CIBLE = {
  id: "e2e-suppression-user",
  email: "suppression@codeforge.test",
  username: "e2esuppr",
  password: "Test1234",
};

async function recreerCible(): Promise<void> {
  // AVANT toute connexion : on efface puis recrée une ligne de User.
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(CIBLE.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [CIBLE.id, CIBLE.email]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [CIBLE.id, CIBLE.email, CIBLE.username, hash]
    );
  } finally {
    await client.end();
  }
}

async function connecter(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(CIBLE.email);
  await page.locator("#password").fill(CIBLE.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("les API refusent une autre origine, et la suppression exige le mot de passe", async ({
  page,
}) => {
  await recreerCible();
  await connecter(page);

  const supprimer = async (password?: string) =>
    (
      await page.request.delete("/api/me", {
        data: password === undefined ? {} : { password },
      })
    ).status();

  await test.step("une requête venue d'une autre origine est refusée", async () => {
    const res = await page.request.post("/api/me/visit", {
      headers: { Origin: "https://piege.invalid", "Content-Type": "text/plain" },
      data: JSON.stringify({ course: "html" }),
    });
    expect.soft(res.status()).toBe(403);
  });

  await test.step("supprimer le compte sans mot de passe est refusé", async () => {
    expect.soft(await supprimer()).toBe(400);
  });

  await test.step("le compte existe toujours", async () => {
    expect.soft((await page.request.get("/api/me")).status()).toBe(200);
  });

  await test.step("un mauvais mot de passe est refusé", async () => {
    expect.soft(await supprimer("pas-le-bon")).toBe(403);
  });

  await test.step("avec le bon mot de passe, la suppression aboutit", async () => {
    expect.soft(await supprimer(CIBLE.password)).toBe(200);
  });
});

test("la page profil demande le mot de passe avant de supprimer le compte", async ({ page }) => {
  await recreerCible();
  await connecter(page);
  await page.goto("/profil");

  await page.getByRole("button", { name: "Supprimer définitivement" }).click();
  const champ = page.getByLabel("Mot de passe");
  const confirmer = page.getByRole("button", { name: "Confirmer la suppression" });

  await champ.fill("pas-le-bon");
  await confirmer.click();
  await expect(page.getByText(/Mot de passe incorrect/)).toBeVisible();

  await champ.fill(CIBLE.password);
  await confirmer.click();
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
});
