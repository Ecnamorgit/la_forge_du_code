import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * Constat SRV-05 de l'audit de sécurité du 2026-09-12 : l'inscription révélait
 * si une adresse avait déjà un compte.
 *
 * `POST /api/signup` répondait 409 « Cet email est déjà utilisé » : n'importe
 * qui pouvait tester une liste d'adresses et savoir lesquelles sont inscrites,
 * puis cibler ces personnes (hameçonnage, essais de mots de passe).
 *
 * Le test compare la réponse pour une adresse déjà inscrite (le compte e2e) à
 * celle pour une adresse libre : elles doivent être indiscernables.
 *
 * Lancer la suite avec RESEND_API_KEY="" dans le shell : dotenv n'écrase pas
 * une variable déjà posée, donc aucun e-mail réel ne part pendant les tests.
 */

test("l'inscription ne révèle pas si une adresse a déjà un compte", async ({ request }) => {
  const suffixe = Date.now().toString(36);
  const inscrire = (email: string, username: string) =>
    request.post("/api/signup", { data: { email, username, password: "Sonde1234" } });

  const existante = await inscrire(E2E_USER.email, `sa${suffixe}`);
  const libre = await inscrire(`sonde-${suffixe}@codeforge.test`, `sb${suffixe}`);
  const corpsExistante = await existante.json();
  const corpsLibre = await libre.json();

  await test.step("même statut de réponse", async () => {
    expect.soft(existante.status()).toBe(libre.status());
  });

  await test.step("même forme de réponse", async () => {
    expect.soft(Object.keys(corpsExistante).sort()).toEqual(Object.keys(corpsLibre).sort());
  });

  await test.step("aucune mention d'une adresse déjà utilisée", async () => {
    expect.soft(JSON.stringify(corpsExistante)).not.toMatch(/déjà utilisé/i);
  });
});
