// Bundles React and the ReactDOM client into one file loadable via <script src>
// from the React preview iframe. Run via predev / prebuild; the output
// is not under version control.
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
  // React reads process.env.NODE_ENV at runtime: without this define, the bundle
  // ships the development code and crashes on `process`.
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

console.log("[build-react-runtime] runtime React bundle -> public/react-runtime/runtime.js");
