import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@monaco-editor/react"],
    // Persist Turbopack's compilation cache to .next between runs.
    // - Dev cache is enabled by default on Next 16.1+, but we set it
    //   explicitly to be future-proof.
    // - Build cache is opt-in and dramatically speeds up subsequent `pnpm build`.
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
