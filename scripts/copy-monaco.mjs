// Copie les assets Monaco (min/vs) dans public/monaco/vs pour les self-héberger
// au lieu de les charger depuis le CDN jsdelivr (CF-16). Exécuté via predev /
// prebuild ; les assets ne sont pas versionnés.
import { cp, rm, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "node_modules", "monaco-editor", "min", "vs");
const destDir = path.join(root, "public", "monaco");
const dest = path.join(destDir, "vs");

try {
  await access(src);
} catch {
  console.error("[copy-monaco] node_modules/monaco-editor introuvable — lance `pnpm install`.");
  process.exit(1);
}

await rm(destDir, { recursive: true, force: true });
await cp(src, dest, { recursive: true });
console.log("[copy-monaco] assets Monaco copiés -> public/monaco/vs");
