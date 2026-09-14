// Applique les migrations Prisma au seul deploiement de production Vercel.
// Appele par la commande de build de vercel.json (constat INF-01).
//
// Dans Vercel, les preversions partagent la base de production (DATABASE_URL
// et DIRECT_URL valent pour "Production and Preview"). Migrer a chaque
// deploiement appliquait donc a la production la migration de n'importe
// quelle branche poussee, avant relecture et fusion.
//
// - VERCEL_ENV=production : migrations appliquees ;
// - preversion ou developpement : migrations ignorees ;
// - sur Vercel sans VERCEL_ENV : echec du build. Sauter les migrations en
//   silence laisserait la production avec un schema en retard sur le code.
//
// --simulation : affiche la decision sans lancer Prisma (tests).
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
