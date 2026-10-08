import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * Audit INF-01 : dans Vercel, `DATABASE_URL` et `DIRECT_URL` valent pour la
 * production et les préversions. Un `prisma migrate deploy` dans la commande
 * de build appliquerait donc les migrations d'une branche poussée à la base de
 * production, avant toute relecture.
 */

const RACINE = process.cwd();
const SCRIPT = path.join(RACINE, "scripts", "migrer-si-production.mjs");
const vercel = JSON.parse(fs.readFileSync(path.join(RACINE, "vercel.json"), "utf8")) as {
  buildCommand: string;
};

/** Lance le script en simulation (il ne touche jamais à Prisma), avec l'environnement donné. */
function lancer(env: Record<string, string>): string {
  return execFileSync(process.execPath, [SCRIPT, "--simulation"], {
    env: { ...process.env, VERCEL: "", VERCEL_ENV: "", ...env },
    encoding: "utf8",
  });
}

describe("build Vercel : migrations de la base", () => {
  it("n'applique pas les migrations directement dans la commande de build", () => {
    expect(vercel.buildCommand).not.toMatch(/prisma migrate deploy/);
  });

  it("passe par le script qui ne migre qu'en production", () => {
    expect(vercel.buildCommand).toContain("node scripts/migrer-si-production.mjs");
  });

  it("n'applique pas les migrations sur une préversion", () => {
    expect(lancer({ VERCEL: "1", VERCEL_ENV: "preview" })).toMatch(/ignorées/);
  });

  it("applique les migrations au déploiement de production", () => {
    expect(lancer({ VERCEL: "1", VERCEL_ENV: "production" })).toMatch(/appliquées/);
  });

  it("fait échouer le build sur Vercel si VERCEL_ENV est absent, au lieu de sauter les migrations", () => {
    expect(() => lancer({ VERCEL: "1" })).toThrow();
  });
});
