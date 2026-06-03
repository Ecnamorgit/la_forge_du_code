import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * Tuned for this app's runtime needs:
 * - Monaco is loaded from the jsdelivr CDN by @monaco-editor/react (no local
 *   loader override), and spins up its tokenizer in blob: web workers.
 * - Next.js injects inline bootstrap/hydration scripts and Tailwind inline
 *   styles, hence 'unsafe-inline'. 'unsafe-eval' covers Monaco + Next.
 * - The lesson runner executes student code inside srcdoc/blob iframes.
 *
 * Only enforced in production: dev needs eval + ws: for HMR/React Refresh.
 * Tighten later with per-request nonces if you drop 'unsafe-inline'.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' blob:",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

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
  // CSP is prod-only to avoid breaking the dev server (HMR uses eval + ws:).
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
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
    return [{ source: "/:path*", headers: securityHeaders }];
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
