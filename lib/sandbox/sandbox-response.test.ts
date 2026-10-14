import { describe, expect, it } from "vitest";

import { sandboxCsp, sandboxResponse } from "./sandbox-response";

const makeRequest = (url: string, headers: Record<string, string>) => ({
  url,
  headers: new Headers(headers),
});

/** The `frame-ancestors` tokens in a sandbox document's CSP. */
function ancestors(csp: string): string[] {
  const directive = csp.split("; ").find((d) => d.startsWith("frame-ancestors "));
  return directive ? directive.split(/\s+/).slice(1) : [];
}

describe("sandboxCsp — frame-ancestors derived from the request", () => {
  it("in production, only the application (bare and www.) can frame it", () => {
    const csp = sandboxCsp(
      makeRequest("https://bac-a-sable.laforgeducode.fr/bac-a-sable/html", {
        host: "bac-a-sable.laforgeducode.fr",
        "x-forwarded-proto": "https",
      })
    );
    expect(ancestors(csp)).toEqual(["https://laforgeducode.fr", "https://www.laforgeducode.fr"]);
    // No development origin shipped to production.
    expect(csp).not.toContain("localhost");
    expect(csp).not.toContain("127.0.0.1");
  });

  it("locally and in CI, the other local host can frame it", () => {
    const csp = sandboxCsp(
      makeRequest("http://127.0.0.1:3000/bac-a-sable", { host: "127.0.0.1:3000" })
    );
    expect(ancestors(csp)).toEqual(["http://localhost:3000"]);
  });

  it("keeps its permissive execution CSP, isolated from the application's", () => {
    const csp = sandboxCsp(makeRequest("http://127.0.0.1:3000/bac-a-sable", { host: "127.0.0.1:3000" }));
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'");
    expect(csp).toContain("form-action 'none'");
  });

  it("refuses all framing if the request origin is unparsable", () => {
    expect(ancestors(sandboxCsp(makeRequest("pas une url", {})))).toEqual(["'none'"]);
  });
});

describe("sandboxResponse", () => {
  it("serves the document with its CSP, nosniff and no cache", async () => {
    const res = sandboxResponse(
      "<!doctype html><p>ok</p>",
      makeRequest("http://127.0.0.1:3000/bac-a-sable", { host: "127.0.0.1:3000" })
    );
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors http://localhost:3000");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.text()).toContain("<p>ok</p>");
  });
});
