// Bundle le Web Worker d'exécution SQL (lib/sandbox/sql.worker.ts) dans
// public/sql. Exécuté via predev / prebuild ; la sortie n'est pas versionnée.
//
// Le Worker isole sql.js du fil principal : une requête sans fin ne fige pas
// l'onglet, et la page peut l'arrêter (audit EXE-02).
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
  // Variante « browser » de sql.js, qui réclame sql-wasm-browser.wasm
  // (copié par copy-sql-wasm.mjs).
  platform: "browser",
  target: ["es2020"],
  minify: true,
  logLevel: "warning",
});

console.log("[build-sql-worker] worker SQL -> public/sql/sql-worker.js");
