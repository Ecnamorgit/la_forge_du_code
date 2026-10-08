// Applique les migrations Prisma au seul déploiement de production Vercel,
// depuis la commande de build de vercel.json (audit INF-01). Les préversions
// partagent la base de production : elles n'y appliquent pas leurs migrations.
//
// Sur Vercel sans VERCEL_ENV, le build échoue plutôt que de laisser la
// production avec un schéma en retard sur le code.
//
// --simulation : affiche la décision sans lancer Prisma (tests).
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
