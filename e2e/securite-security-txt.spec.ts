import { test, expect } from "@playwright/test";

/**
 * Constat SUP-01 de l'audit de sécurité du 2026-09-12 : aucun moyen documenté
 * de signaler une faille.
 *
 * La RFC 9116 définit /.well-known/security.txt : un fichier public où un
 * chercheur trouve à qui écrire. Sans lui, une faille découverte est soit
 * gardée pour soi, soit publiée sans prévenir. Le fichier doit donner au
 * moins un `Contact` et une date d'expiration `Expires`.
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
