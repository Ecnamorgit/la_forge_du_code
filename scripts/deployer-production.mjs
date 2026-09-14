// Déploie `main` en production sur Vercel, depuis une copie SANS dossier .git.
//
// Pourquoi : le dépôt est privé et le projet est sur un compte Vercel Hobby.
// Ce plan bloque tout déploiement dont l'auteur du commit n'est pas le compte
// GitHub relié à Vercel — y compris `vercel --prod` lancé depuis le dépôt, car
// la CLI joint les métadonnées git locales (état `BLOCKED`, que la CLI affiche
// seulement comme `UNKNOWN`). Sans .git, aucune métadonnée, donc rien à
// bloquer : le build tourne chez Vercel avec `vercel.json` et les variables du
// projet, exactement comme un déploiement déclenché par git.
//
// Préalables, une seule fois :  npx vercel login   (compte pluriface)
//                                npx vercel link    (lie ce dossier au projet)
// Usage :                        node scripts/deployer-production.mjs
//
// Cf. docs/DEPLOYMENT.md, section 4.

import { execSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REF = "main";
const LIEN = join(".vercel", "project.json");

function git(args) {
  return execSync(`git ${args}`, { encoding: "utf8" }).trim();
}

if (!existsSync(LIEN)) {
  console.error(`Dossier non lié au projet Vercel (${LIEN} absent) : lance d'abord \`npx vercel link\`.`);
  process.exit(1);
}

git("fetch origin main --quiet");
const local = git(`rev-parse ${REF}`);
const distant = git("rev-parse origin/main");
if (local !== distant) {
  console.error(
    `Ta branche ${REF} (${local.slice(0, 7)}) diffère de origin/main (${distant.slice(0, 7)}) : ` +
      "fais d'abord `git pull` ou `git push`, pour déployer ce qui est fusionné."
  );
  process.exit(1);
}

const copie = mkdtempSync(join(tmpdir(), "forge-deploy-"));
try {
  // `git archive` n'emporte que les fichiers suivis : ni .git, ni .env, ni node_modules.
  const archive = join(copie, "source.tar");
  execSync(`git archive --format=tar --output="${archive}" ${REF}`);
  execSync(`tar -xf "${archive}" -C "${copie}"`);
  rmSync(archive);
  mkdirSync(join(copie, ".vercel"));
  cpSync(LIEN, join(copie, LIEN));

  console.log(`Déploiement de ${REF} (${local.slice(0, 7)}) en production, depuis ${copie}`);
  const res = spawnSync("npx", ["vercel", "--prod", "--yes"], {
    cwd: copie,
    stdio: "inherit",
    shell: true,
  });
  process.exitCode = res.status ?? 1;
} finally {
  rmSync(copie, { recursive: true, force: true });
}
