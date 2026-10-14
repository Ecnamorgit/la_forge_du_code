import { describe, expect, it } from "vitest";

import { buildCsp, cspDirectives, scriptSrc, directiveTokens } from "./csp";

const NONCE = "abc123==";
const SANDBOX = "https://bac-a-sable.laforgeducode.fr";
/** Options for a production request. */
const PROD = { nonce: NONCE, sandboxOrigin: SANDBOX };

/** Failure message: explains why `script-src` must stay strict. */
const WHY =
  "Learner code runs from a dedicated origin (/bac-a-sable*, " +
  "lib/sandbox/sandbox-response.ts), which alone carries the permissive CSP. " +
  "script-src must therefore stay at nonce + 'strict-dynamic', without 'unsafe-inline' " +
  "or 'unsafe-eval'. See docs/audit-securite/corrections/EXE-03.md.";

describe("CSP — script-src (production)", () => {
  const script = () => directiveTokens(cspDirectives(PROD), "script-src");

  it("carries the request nonce", () => {
    expect(script(), WHY).toContain(`'nonce-${NONCE}'`);
  });

  it("carries 'strict-dynamic'", () => {
    expect(script(), WHY).toContain("'strict-dynamic'");
  });

  it("carries 'wasm-unsafe-eval' (sql.js in a Worker)", () => {
    // WebAssembly only, not eval: removing it would break the SQL curriculum.
    expect(script(), WHY).toContain("'wasm-unsafe-eval'");
  });

  it("does NOT carry 'unsafe-inline' — the core of finding EXE-03", () => {
    expect(script(), WHY).not.toContain("'unsafe-inline'");
  });

  it("does NOT carry 'unsafe-eval' in production", () => {
    expect(script(), WHY).not.toContain("'unsafe-eval'");
  });
});

describe("CSP — script-src (development)", () => {
  it("adds 'unsafe-eval' in dev (React uses it for debugging)", () => {
    const dev = directiveTokens(cspDirectives({ ...PROD, isDev: true }), "script-src");
    expect(dev).toContain("'unsafe-eval'");
    // but never 'unsafe-inline', even in dev.
    expect(dev).not.toContain("'unsafe-inline'");
  });

  it("scriptSrc only adds 'unsafe-eval' when isDev", () => {
    expect(scriptSrc(PROD)).not.toContain("'unsafe-eval'");
    expect(scriptSrc({ ...PROD, isDev: true })).toContain("'unsafe-eval'");
  });
});

describe("CSP — framing of previews", () => {
  it("frame-src only allows 'self' and the request's sandbox origin", () => {
    const frame = directiveTokens(cspDirectives(PROD), "frame-src");
    expect(frame).toEqual(["'self'", SANDBOX]);
  });

  it("in production, no development origin leaks into frame-src", () => {
    const csp = buildCsp(PROD);
    expect(csp).not.toContain("localhost");
    expect(csp).not.toContain("127.0.0.1");
  });

  it("locally, frame-src carries the other local host, not the subdomain", () => {
    const frame = directiveTokens(
      cspDirectives({ nonce: NONCE, sandboxOrigin: "http://127.0.0.1:3000" }),
      "frame-src"
    );
    expect(frame).toEqual(["'self'", "http://127.0.0.1:3000"]);
  });

  it("the application itself cannot be framed", () => {
    const anc = directiveTokens(cspDirectives(PROD), "frame-ancestors");
    expect(anc).toEqual(["'none'"]);
  });
});

describe("buildCsp", () => {
  it("emits a string with the nonce interpolated", () => {
    const csp = buildCsp(PROD);
    expect(csp).toContain(`'nonce-${NONCE}'`);
    expect(csp).toContain("script-src");
  });
});

describe("directiveTokens", () => {
  const directives = cspDirectives(PROD);

  it("isolates a directive's tokens without its name", () => {
    expect(directiveTokens(directives, "object-src")).toEqual(["'none'"]);
  });

  it("keeps style-src apart from script-src", () => {
    // style-src keeps 'unsafe-inline'; the script-src test above must
    // not turn green because of its presence in style-src.
    expect(directiveTokens(directives, "style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("does not confuse a directive with another sharing its prefix", () => {
    // `script-src-elem` starts with `script-src`: asking for one must
    // never return the other's tokens.
    expect(directiveTokens(directives, "script-src-elem")).toEqual([]);
  });
});
