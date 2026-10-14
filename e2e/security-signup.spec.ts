import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * Sign-up does not reveal whether an address already has an account (audit SRV-05):
 * the responses for a registered address and for a free address must
 * be indistinguishable.
 *
 * Run the suite with RESEND_API_KEY="" in the shell: dotenv does not overwrite
 * an already set variable, so no real email is sent.
 */

test("sign-up does not reveal whether an address already has an account", async ({ request }) => {
  const suffix = Date.now().toString(36);
  const signUp = (email: string, username: string) =>
    request.post("/api/signup", { data: { email, username, password: "Sonde1234" } });

  const existingAccount = await signUp(E2E_USER.email, `sa${suffix}`);
  const freeAccount = await signUp(`sonde-${suffix}@codeforge.test`, `sb${suffix}`);
  const existingBody = await existingAccount.json();
  const freeBody = await freeAccount.json();

  await test.step("same response status", async () => {
    expect.soft(existingAccount.status()).toBe(freeAccount.status());
  });

  await test.step("same response shape", async () => {
    expect.soft(Object.keys(existingBody).sort()).toEqual(Object.keys(freeBody).sort());
  });

  await test.step("no mention of an address already in use", async () => {
    expect.soft(JSON.stringify(existingBody)).not.toMatch(/déjà utilisé/i);
  });
});
