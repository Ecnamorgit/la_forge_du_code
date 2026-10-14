// Applies the Prisma migrations only on the Vercel production deployment,
// from the build command in vercel.json (audit INF-01). Preview deployments
// share the production database: they do not apply their migrations to it.
//
// On Vercel without VERCEL_ENV, the build fails rather than leaving
// production with a schema that lags behind the code.
//
// --simulation: prints the decision without running Prisma (tests).
import { execSync } from "node:child_process";

const { VERCEL, VERCEL_ENV } = process.env;
const simulation = process.argv.includes("--simulation");

if (VERCEL === "1" && !VERCEL_ENV) {
  console.error(
    "[migrations] VERCEL_ENV absent sur Vercel : impossible de savoir si ce déploiement est la production. " +
      "Active l'exposition des variables système dans les réglages du projet Vercel."
  );
  process.exit(1);
}

if (VERCEL_ENV !== "production") {
  console.log(
    `[migrations] ignorées : VERCEL_ENV=${VERCEL_ENV || "(absent)"}, seule la production applique les migrations.`
  );
  process.exit(0);
}

console.log("[migrations] appliquées : déploiement de production.");
if (!simulation) {
  execSync("pnpm prisma migrate deploy", { stdio: "inherit" });
}
