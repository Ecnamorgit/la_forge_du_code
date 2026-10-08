// Bundle React et le client ReactDOM en un fichier chargeable par <script src>
// depuis l'iframe d'aperçu React. Exécuté via predev / prebuild ; la sortie
// n'est pas versionnée.
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "scripts", "react-runtime-entry.mjs");
const outdir = path.join(root, "public", "react-runtime");
const outfile = path.join(outdir, "runtime.js");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  // React lit process.env.NODE_ENV à l'exécution : sans ce define, le bundle
  // embarque le code de développement et plante sur `process`.
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

console.log("[build-react-runtime] runtime React bundle -> public/react-runtime/runtime.js");
