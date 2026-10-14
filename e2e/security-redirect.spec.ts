import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * After saving the avatar, the `from` parameter must not take the user
 * off the site (audit SRV-06, open redirect).
 *
 * The `.invalid` domain never resolves (RFC 2606): `page.route` answers in
 * its place, without any outbound request.
 */

test.use({ storageState: STORAGE_STATE });

const TRAP_URL = "https://piege.invalid/";

test("after saving the avatar, a booby-trapped link does not take the user off the site", async ({
  page,
  baseURL,
}) => {
  await page.route(`${TRAP_URL}**`, (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Site piege</h1>" })
  );

  await page.goto(`/avatar?from=${encodeURIComponent(TRAP_URL)}`);

  // In edit mode, the "Annuler" (cancel) link reuses the same destination.
  const cancelLink = page.getByRole("link", { name: "Annuler" });
  if (await cancelLink.count()) {
    expect.soft(await cancelLink.getAttribute("href")).not.toContain("piege");
  }

  await page.getByRole("button", { name: /Confirmer et embarquer|Sauvegarder/ }).click();
  await page.waitForURL((url) => url.pathname !== "/avatar", { timeout: 15_000 });

  expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
});
