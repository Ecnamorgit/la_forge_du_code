import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import bcrypt from "bcryptjs";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";

/**
 * Origin check on the APIs that modify data, and password required
 * to delete the account (audit SRV-09).
 *
 * SameSite=Lax works per site: a subdomain, like the sandbox's,
 * would send authenticated requests. We simulate it with a foreign Origin
 * header and the account's session.
 *
 * Dedicated account, recreated on every run: the test deletes it.
 */

const TARGET = {
  id: "e2e-suppression-user",
  email: "suppression@codeforge.test",
  username: "e2esuppr",
  password: "Test1234",
};

async function recreateTarget(): Promise<void> {
  // Before any connection: we delete then recreate a User row.
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(TARGET.password, 10);
    await client.query('DELETE FROM "User" WHERE id = $1 OR email = $2', [TARGET.id, TARGET.email]);
    await client.query(
      `INSERT INTO "User" (id, email, username, password, "emailVerified", "onboardedAt", "lastVisit")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), '')`,
      [TARGET.id, TARGET.email, TARGET.username, hash]
    );
  } finally {
    await client.end();
  }
}

async function logIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(TARGET.email);
  await page.locator("#password").fill(TARGET.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("the APIs reject another origin, and deletion requires the password", async ({
  page,
}) => {
  await recreateTarget();
  await logIn(page);

  const deleteAccount = async (password?: string) =>
    (
      await page.request.delete("/api/me", {
        data: password === undefined ? {} : { password },
      })
    ).status();

  await test.step("a request from another origin is rejected", async () => {
    const res = await page.request.post("/api/me/visit", {
      headers: { Origin: "https://piege.invalid", "Content-Type": "text/plain" },
      data: JSON.stringify({ course: "html" }),
    });
    expect.soft(res.status()).toBe(403);
  });

  await test.step("deleting the account without a password is rejected", async () => {
    expect.soft(await deleteAccount()).toBe(400);
  });

  await test.step("the account still exists", async () => {
    expect.soft((await page.request.get("/api/me")).status()).toBe(200);
  });

  await test.step("a wrong password is rejected", async () => {
    expect.soft(await deleteAccount("pas-le-bon")).toBe(403);
  });

  await test.step("with the correct password, deletion succeeds", async () => {
    expect.soft(await deleteAccount(TARGET.password)).toBe(200);
  });
});

test("the profile page asks for the password before deleting the account", async ({ page }) => {
  await recreateTarget();
  await logIn(page);
  await page.goto("/profil");

  await page.getByRole("button", { name: "Supprimer définitivement" }).click();
  const passwordField = page.getByLabel("Mot de passe");
  const confirmButton = page.getByRole("button", { name: "Confirmer la suppression" });

  await passwordField.fill("pas-le-bon");
  await confirmButton.click();
  await expect(page.getByText(/Mot de passe incorrect/)).toBeVisible();

  await passwordField.fill(TARGET.password);
  await confirmButton.click();
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
});
