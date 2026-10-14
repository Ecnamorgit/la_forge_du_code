import fs from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * /.well-known/security.txt (RFC 9116, audit SUP-01). The RFC requires
 * `Contact` and `Expires`, and recommends an expiry less than a year away. The
 * test fails once the date has passed: that is the reminder to renew the file
 * and to check that the contact address actually receives mail.
 */

const FILE_PATH = path.join(process.cwd(), "public", ".well-known", "security.txt");
const ONE_YEAR_MS = 366 * 24 * 60 * 60 * 1000;

const fieldValues = (text: string, fieldName: string) =>
  text
    .split("\n")
    .filter((l) => l.startsWith(`${fieldName}: `))
    .map((l) => l.slice(fieldName.length + 2).trim());

describe("security.txt", () => {
  const text = fs.readFileSync(FILE_PATH, "utf8");

  it("provides at least one contact", () => {
    const contacts = fieldValues(text, "Contact");
    expect(contacts.length).toBeGreaterThan(0);
    for (const c of contacts) expect(c).toMatch(/^(mailto:|https:\/\/)/);
  });

  it("expires in the future, less than a year away", () => {
    const [expires] = fieldValues(text, "Expires");
    const date = Date.parse(expires);
    expect(Number.isNaN(date), `Expires illisible : ${expires}`).toBe(false);
    expect(date, "security.txt a expiré : le renouveler").toBeGreaterThan(Date.now());
    expect(date - Date.now(), "Expires à plus d'un an").toBeLessThan(ONE_YEAR_MS);
  });

  it("states its canonical address over https", () => {
    expect(fieldValues(text, "Canonical")[0]).toMatch(/^https:\/\/.+\/\.well-known\/security\.txt$/);
  });
});
