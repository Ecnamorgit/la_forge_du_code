// Copie les fichiers WebAssembly de sql.js dans public/sql, où le moteur SQL
// les réclame (lib/sandbox/run-sql.ts). Exécuté via predev / prebuild ; la
// sortie n'est pas versionnée et suit la version de sql.js installée.
//
// Le bundler du navigateur choisit la variante « browser » de sql.js, qui
// réclame `sql-wasm-browser.wasm` ; `sql-wasm.wasm` sert la variante par
// défaut. Les deux sont donc copiées (audit EXE-07).
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
