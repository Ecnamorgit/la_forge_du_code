// Deploys `main` to production on Vercel, from a copy without a .git folder.
//
// On the Hobby plan, a private repository can only be deployed if the commit
// author is the GitHub account linked to Vercel, including with `vercel --prod`
// run from the repository, because the CLI attaches the local git metadata.
// Without .git, the build runs on Vercel with `vercel.json` and the project's
// variables.
//
// One-time prerequisites: `npx vercel login` (pluriface account) then
// `npx vercel link`. Usage: node scripts/deployer-production.mjs
// (see docs/DEPLOYMENT.md, section 4).

import { execSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REF = "main";
const LINK_FILE = join(".vercel", "project.json");

function git(args) {
  return execSync(`git ${args}`, { encoding: "utf8" }).trim();
}

if (!existsSync(LINK_FILE)) {
  console.error(`Dossier non lié au projet Vercel (${LINK_FILE} absent) : lance d'abord \`npx vercel link\`.`);
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

const copyDir = mkdtempSync(join(tmpdir(), "forge-deploy-"));
try {
  // `git archive` only takes tracked files: no .git, no .env, no node_modules.
  const archive = join(copyDir, "source.tar");
  execSync(`git archive --format=tar --output="${archive}" ${REF}`);
  // Extract with a RELATIVE path, from the copy's folder: the Windows tar
  // (bsdtar) would read the `C:` of an absolute path as a remote host
  // ("Cannot connect to C: resolve failed").
  execSync("tar -xf source.tar", { cwd: copyDir });
  rmSync(archive);
  mkdirSync(join(copyDir, ".vercel"));
  cpSync(LINK_FILE, join(copyDir, LINK_FILE));

  console.log(`Déploiement de ${REF} (${local.slice(0, 7)}) en production, depuis ${copyDir}`);
  const res = spawnSync("npx", ["vercel", "--prod", "--yes"], {
    cwd: copyDir,
    stdio: "inherit",
    shell: true,
  });
  process.exitCode = res.status ?? 1;
} finally {
  // On Windows, the folder can stay locked (EBUSY) for a moment after the
  // CLI exits: retry, and a cleanup failure does not undo a successful
  // deployment — it is only reported.
  try {
    rmSync(copyDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch (err) {
    console.warn(`Copie temporaire non supprimée (${err.code ?? err.message}) : ${copyDir}`);
  }
}
