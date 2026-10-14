// Copies the sql.js WebAssembly files into public/sql, where the SQL engine
// requests them (lib/sandbox/run-sql.ts). Run via predev / prebuild; the
// output is not under version control and follows the installed sql.js version.
//
// The browser bundler picks the "browser" variant of sql.js, which
// requests `sql-wasm-browser.wasm`; `sql-wasm.wasm` serves the default
// variant. Both are therefore copied (audit EXE-07).
import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "sql.js", "dist");
const targetDir = path.join(root, "public", "sql");

await mkdir(targetDir, { recursive: true });
for (const file of ["sql-wasm.wasm", "sql-wasm-browser.wasm"]) {
  await copyFile(path.join(source, file), path.join(targetDir, file));
}

console.log("[copy-sql-wasm] sql-wasm.wasm + sql-wasm-browser.wasm -> public/sql/");
