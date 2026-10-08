import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Après l'enregistrement de l'avatar, le paramètre `from` ne doit pas faire
 * quitter le site (audit SRV-06, redirection ouverte).
 *
 * Le domaine `.invalid` ne résout jamais (RFC 2606) : `page.route` répond à sa
 * place, sans requête vers l'extérieur.
 */

test.use({ storageState: STORAGE_STATE });

const PIEGE = "https://piege.invalid/";

test("après l'enregistrement de l'avatar, un lien piégé ne fait pas quitter le site", async ({
  page,
  baseURL,
}) => {
  await page.route(`${PIEGE}**`, (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Site piege</h1>" })
  );

  await page.goto(`/avatar?from=${encodeURIComponent(PIEGE)}`);

  // En mode édition, le lien « Annuler » reprend la même destination.
  const annuler = page.getByRole("link", { name: "Annuler" });
  if (await annuler.count()) {
    expect.soft(await annuler.getAttribute("href")).not.toContain("piege");
  }

  await page.getByRole("button", { name: /Confirmer et embarquer|Sauvegarder/ }).click();
  await page.waitForURL((url) => url.pathname !== "/avatar", { timeout: 15_000 });

  expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
});
