import { describe, it, expect } from "vitest";

import { isAccountLocked, recordLoginFailure } from "./login-guard";

const randomEmail = () => `cadet-${Math.random().toString(36).slice(2)}@exemple.fr`;

describe("per-account login lockout", () => {
  it("locks on the tenth failure, not before", async () => {
    const email = randomEmail();
    for (let i = 0; i < 9; i++) await recordLoginFailure(email);
    expect(await isAccountLocked(email)).toBe(false);
    await recordLoginFailure(email);
    expect(await isAccountLocked(email)).toBe(true);
  });

  it("locks only the targeted account", async () => {
    const target = randomEmail();
    for (let i = 0; i < 10; i++) await recordLoginFailure(target);
    expect(await isAccountLocked(randomEmail())).toBe(false);
  });

  it("ignores case and whitespace in the address", async () => {
    const email = randomEmail();
    for (let i = 0; i < 10; i++) await recordLoginFailure(`  ${email.toUpperCase()} `);
    expect(await isAccountLocked(email)).toBe(true);
  });

  it("checking does not count as a failure", async () => {
    const email = randomEmail();
    for (let i = 0; i < 20; i++) await isAccountLocked(email);
    expect(await isAccountLocked(email)).toBe(false);
  });
});
