// Bundles the SQL execution Web Worker (lib/sandbox/sql.worker.ts) into
// public/sql. Run via predev / prebuild; the output is not under version control.
//
// The Worker isolates sql.js from the main thread: an endless query does not
// freeze the tab, and the page can stop it (audit EXE-02).
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
  // The "browser" variant of sql.js, which requests sql-wasm-browser.wasm
  // (copied by copy-sql-wasm.mjs).
  platform: "browser",
  target: ["es2020"],
  minify: true,
  logLevel: "warning",
});

console.log("[build-sql-worker] worker SQL -> public/sql/sql-worker.js");
