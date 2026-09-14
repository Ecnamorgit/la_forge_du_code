// Copie les fichiers WebAssembly de sql.js dans public/sql, la ou le moteur SQL
// les reclame (lib/sandbox/run-sql.ts). Execute via predev / prebuild, a cote
// de copy-monaco.mjs. La sortie n'est pas versionnee (cf. .gitignore) : elle
// suit toujours la version de sql.js installee.
//
// Les deux variantes sont copiees. Le bundler du navigateur choisit
// `sql-wasm-browser.js` (condition « browser » des exports de sql.js), qui
// reclame `sql-wasm-browser.wasm` ; `sql-wasm.wasm` sert la variante par
// defaut. N'heberger que le second a casse le cursus SQL (constat EXE-07).
import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "sql.js", "dist");
const cible = path.join(root, "public", "sql");

await mkdir(cible, { recursive: true });
for (const fichier of ["sql-wasm.wasm", "sql-wasm-browser.wasm"]) {
  await copyFile(path.join(source, fichier), path.join(cible, fichier));
}

console.log("[copy-sql-wasm] sql-wasm.wasm + sql-wasm-browser.wasm -> public/sql/");
