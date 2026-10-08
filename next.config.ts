import type { NextConfig } from "next";

// En-têtes de sécurité à valeur fixe. La CSP, à nonce, est posée par `proxy.ts`.
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
  // N'annonce pas le framework dans les réponses.
  poweredByHeader: false,
  async headers() {
    // Le bac à sable pose lui-même sa CSP permissive et son `frame-ancestors`,
    // incompatibles avec ces en-têtes (audit EXE-03).
    return [{ source: "/((?!bac-a-sable).*)", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["@monaco-editor/react"],
    // Cache de compilation Turbopack conservé dans .next entre deux exécutions
    // (actif par défaut en dev depuis Next 16.1, optionnel pour le build).
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
