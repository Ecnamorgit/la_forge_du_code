import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * Audit INF-01: in Vercel, `DATABASE_URL` and `DIRECT_URL` apply to both
 * production and previews. A `prisma migrate deploy` in the build command
 * would therefore apply a pushed branch's migrations to the production
 * database, before any review.
 */

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "scripts", "migrate-if-production.mjs");
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")) as {
  buildCommand: string;
};

/** Runs the script in simulation mode (it never touches Prisma), with the given environment. */
function runScript(env: Record<string, string>): string {
  return execFileSync(process.execPath, [SCRIPT, "--simulation"], {
    env: { ...process.env, VERCEL: "", VERCEL_ENV: "", ...env },
    encoding: "utf8",
  });
}

describe("Vercel build: database migrations", () => {
  it("does not apply migrations directly in the build command", () => {
    expect(vercel.buildCommand).not.toMatch(/prisma migrate deploy/);
  });

  it("goes through the script that only migrates in production", () => {
    expect(vercel.buildCommand).toContain("node scripts/migrate-if-production.mjs");
  });

  it("does not apply migrations on a preview", () => {
    expect(runScript({ VERCEL: "1", VERCEL_ENV: "preview" })).toMatch(/ignorées/);
  });

  it("applies migrations on a production deployment", () => {
    expect(runScript({ VERCEL: "1", VERCEL_ENV: "production" })).toMatch(/appliquées/);
  });

  it("fails the build on Vercel if VERCEL_ENV is missing, instead of skipping migrations", () => {
    expect(() => runScript({ VERCEL: "1" })).toThrow();
  });
});
