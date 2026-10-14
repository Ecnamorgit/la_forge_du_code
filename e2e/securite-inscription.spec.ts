import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * L'inscription ne révèle pas si une adresse a déjà un compte (audit SRV-05) :
 * les réponses pour une adresse inscrite et pour une adresse freeAccount doivent
 * être indiscernables.
 *
 * Lancer la suite avec RESEND_API_KEY="" dans le shell : dotenv n'écrase pas
 * une variable déjà posée, donc aucun e-mail réel ne part.
 */

test("l'inscription ne révèle pas si une adresse a déjà un compte", async ({ request }) => {
  const suffix = Date.now().toString(36);
  const signUp = (email: string, username: string) =>
    request.post("/api/signup", { data: { email, username, password: "Sonde1234" } });

  const existingAccount = await signUp(E2E_USER.email, `sa${suffix}`);
  const freeAccount = await signUp(`sonde-${suffix}@codeforge.test`, `sb${suffix}`);
  const existingBody = await existingAccount.json();
  const freeBody = await freeAccount.json();

  await test.step("même statut de réponse", async () => {
    expect.soft(existingAccount.status()).toBe(freeAccount.status());
  });

  await test.step("même forme de réponse", async () => {
    expect.soft(Object.keys(existingBody).sort()).toEqual(Object.keys(freeBody).sort());
  });

  await test.step("aucune mention d'une adresse déjà utilisée", async () => {
    expect.soft(JSON.stringify(existingBody)).not.toMatch(/déjà utilisé/i);
  });
});
