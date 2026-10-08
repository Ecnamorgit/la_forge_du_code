import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * L'inscription ne révèle pas si une adresse a déjà un compte (audit SRV-05) :
 * les réponses pour une adresse inscrite et pour une adresse libre doivent
 * être indiscernables.
 *
 * Lancer la suite avec RESEND_API_KEY="" dans le shell : dotenv n'écrase pas
 * une variable déjà posée, donc aucun e-mail réel ne part.
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
