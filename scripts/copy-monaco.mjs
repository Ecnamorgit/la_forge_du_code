// Copies the Monaco assets (min/vs) into public/monaco/vs to self-host them
// instead of loading them from the jsdelivr CDN (CF-16). Run via predev /
// prebuild; the assets are not under version control.
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
