import { describe, it, expect } from "vitest";

import { compteVerrouille, noterEchecConnexion } from "./login-guard";

const adresse = () => `cadet-${Math.random().toString(36).slice(2)}@exemple.fr`;

describe("verrouillage des connexions par compte", () => {
  it("verrouille au dixième échec, pas avant", async () => {
    const email = adresse();
    for (let i = 0; i < 9; i++) await noterEchecConnexion(email);
    expect(await compteVerrouille(email)).toBe(false);
    await noterEchecConnexion(email);
    expect(await compteVerrouille(email)).toBe(true);
  });

  it("ne verrouille que le compte visé", async () => {
    const visee = adresse();
    for (let i = 0; i < 10; i++) await noterEchecConnexion(visee);
    expect(await compteVerrouille(adresse())).toBe(false);
  });

  it("ignore la casse et les espaces de l'adresse", async () => {
    const email = adresse();
    for (let i = 0; i < 10; i++) await noterEchecConnexion(`  ${email.toUpperCase()} `);
    expect(await compteVerrouille(email)).toBe(true);
  });

  it("regarder ne compte pas d'échec", async () => {
    const email = adresse();
    for (let i = 0; i < 20; i++) await compteVerrouille(email);
    expect(await compteVerrouille(email)).toBe(false);
  });
});
