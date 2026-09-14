import type { NextConfig } from "next";

// La CSP n'est PLUS posée ici : elle est à nonce (unique par requête), donc
// générée par `proxy.ts` (constat EXE-03). Ne restent ici que les en-têtes de
// sécurité à valeur fixe.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Don't advertise the framework version (minor info-leak hardening).
  poweredByHeader: false,
  async headers() {
    // Le bac à sable (`app/bac-a-sable/route.ts`) est exclu : il pose lui-même
    // sa CSP permissive et son `frame-ancestors`, incompatibles avec les
    // en-têtes stricts du reste du site (constat EXE-03).
    return [{ source: "/((?!bac-a-sable).*)", headers: securityHeaders }];
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
