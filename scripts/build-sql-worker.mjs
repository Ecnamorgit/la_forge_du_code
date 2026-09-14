// Bundle le Web Worker d'execution SQL (lib/sandbox/sql.worker.ts) en un
// fichier servi depuis public/sql. Execute via predev / prebuild, a cote de
// copy-sql-wasm.mjs. La sortie n'est pas versionnee (cf. .gitignore).
//
// Le Worker isole sql.js du fil principal : une requete sans fin ne fige plus
// l'onglet, et la page peut l'arreter (constat EXE-02).
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "lib", "sandbox", "sql.worker.ts");
const outdir = path.join(root, "public", "sql");
const outfile = path.join(outdir, "sql-worker.js");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  // Variante « browser » de sql.js, celle qui reclame sql-wasm-browser.wasm
  // (copie par copy-sql-wasm.mjs).
  platform: "browser",
  target: ["es2020"],
  minify: true,
  logLevel: "warning",
});

console.log("[build-sql-worker] worker SQL -> public/sql/sql-worker.js");
