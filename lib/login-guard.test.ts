import { describe, it, expect } from "vitest";

import { isAccountLocked, recordLoginFailure } from "./login-guard";

const randomEmail = () => `cadet-${Math.random().toString(36).slice(2)}@exemple.fr`;

describe("verrouillage des connexions par compte", () => {
  it("verrouille au dixième échec, pas avant", async () => {
    const email = randomEmail();
    for (let i = 0; i < 9; i++) await recordLoginFailure(email);
    expect(await isAccountLocked(email)).toBe(false);
    await recordLoginFailure(email);
    expect(await isAccountLocked(email)).toBe(true);
  });

  it("ne verrouille que le compte visé", async () => {
    const target = randomEmail();
    for (let i = 0; i < 10; i++) await recordLoginFailure(target);
    expect(await isAccountLocked(randomEmail())).toBe(false);
  });

  it("ignore la casse et les espaces de l'adresse", async () => {
    const email = randomEmail();
    for (let i = 0; i < 10; i++) await recordLoginFailure(`  ${email.toUpperCase()} `);
    expect(await isAccountLocked(email)).toBe(true);
  });

  it("regarder ne compte pas d'échec", async () => {
    const email = randomEmail();
    for (let i = 0; i < 20; i++) await isAccountLocked(email);
    expect(await isAccountLocked(email)).toBe(false);
  });
});
