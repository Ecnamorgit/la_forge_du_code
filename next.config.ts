import type { NextConfig } from "next";

// Fixed-value security headers. The nonce-based CSP is set by `proxy.ts`.
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
  // Does not advertise the framework in responses.
  poweredByHeader: false,
  async headers() {
    // The sandbox sets its own permissive CSP and `frame-ancestors`,
    // which are incompatible with these headers (audit EXE-03).
    return [{ source: "/((?!bac-a-sable).*)", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["@monaco-editor/react"],
    // Turbopack compilation cache kept in .next between runs
    // (on by default in dev since Next 16.1, opt-in for the build).
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
