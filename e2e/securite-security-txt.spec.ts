import { test, expect } from "@playwright/test";

/**
 * /.well-known/security.txt (RFC 9116, audit SUP-01) indique où signaler une
 * faille : au moins un `Contact` et une date d'expiration `Expires`.
 */

test("un chercheur trouve où signaler une faille", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);

  const texte = await res.text();
  await test.step("un contact est donné", async () => {
    expect.soft(texte).toMatch(/^Contact: (mailto:|https:\/\/)\S+$/m);
  });
  await test.step("une date d'expiration est donnée", async () => {
    expect.soft(texte).toMatch(/^Expires: \d{4}-\d{2}-\d{2}T[\d:.]+Z$/m);
  });
});
