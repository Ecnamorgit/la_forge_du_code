import fs from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * /.well-known/security.txt (RFC 9116, audit SUP-01). La RFC exige `Contact`
 * et `Expires`, et recommande une expiration à moins d'un an. Le test échoue
 * une fois la date passée : c'est le rappel de renouveler le fichier et de
 * vérifier que l'adresse de contact reçoit bien le courrier.
 */

const FICHIER = path.join(process.cwd(), "public", ".well-known", "security.txt");
const UN_AN_MS = 366 * 24 * 60 * 60 * 1000;

const champs = (texte: string, nom: string) =>
  texte
    .split("\n")
    .filter((l) => l.startsWith(`${nom}: `))
    .map((l) => l.slice(nom.length + 2).trim());

describe("security.txt", () => {
  const texte = fs.readFileSync(FICHIER, "utf8");

  it("donne au moins un contact", () => {
    const contacts = champs(texte, "Contact");
    expect(contacts.length).toBeGreaterThan(0);
    for (const c of contacts) expect(c).toMatch(/^(mailto:|https:\/\/)/);
  });

  it("expire dans le futur, à moins d'un an", () => {
    const [expires] = champs(texte, "Expires");
    const date = Date.parse(expires);
    expect(Number.isNaN(date), `Expires illisible : ${expires}`).toBe(false);
    expect(date, "security.txt a expiré : le renouveler").toBeGreaterThan(Date.now());
    expect(date - Date.now(), "Expires à plus d'un an").toBeLessThan(UN_AN_MS);
  });

  it("indique son adresse canonique en https", () => {
    expect(champs(texte, "Canonical")[0]).toMatch(/^https:\/\/.+\/\.well-known\/security\.txt$/);
  });
});
