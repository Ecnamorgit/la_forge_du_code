import { describe, expect, it } from "vitest";

import { sandboxCsp, sandboxResponse } from "./sandbox-response";

const makeRequest = (url: string, headers: Record<string, string>) => ({
  url,
  headers: new Headers(headers),
});

/** Les tokens de `frame-ancestors` dans la CSP d'un document du bac à sable. */
function ancestors(csp: string): string[] {
  const directive = csp.split("; ").find((d) => d.startsWith("frame-ancestors "));
  return directive ? directive.split(/\s+/).slice(1) : [];
}

describe("cspBacASable — frame-ancestors dérivé de la requête", () => {
  it("en production, seule l'application (nu et www.) peut encadrer", () => {
    const csp = sandboxCsp(
      makeRequest("https://bac-a-sable.laforgeducode.fr/bac-a-sable/html", {
        host: "bac-a-sable.laforgeducode.fr",
        "x-forwarded-proto": "https",
      })
    );
    expect(ancestors(csp)).toEqual(["https://laforgeducode.fr", "https://www.laforgeducode.fr"]);
    // Aucune origine de développement livrée en production.
    expect(csp).not.toContain("localhost");
    expect(csp).not.toContain("127.0.0.1");
  });

  it("en local et en CI, l'autre hôte local peut encadrer", () => {
    const csp = sandboxCsp(
      makeRequest("http://127.0.0.1:3000/bac-a-sable", { host: "127.0.0.1:3000" })
    );
    expect(ancestors(csp)).toEqual(["http://localhost:3000"]);
  });

  it("garde sa CSP permissive d'exécution, isolée de celle de l'application", () => {
    const csp = sandboxCsp(makeRequest("http://127.0.0.1:3000/bac-a-sable", { host: "127.0.0.1:3000" }));
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'");
    expect(csp).toContain("form-action 'none'");
  });

  it("refuse tout encadrement si l'origine de la requête est illisible", () => {
    expect(ancestors(sandboxCsp(makeRequest("pas une url", {})))).toEqual(["'none'"]);
  });
});

describe("reponseBacASable", () => {
  it("émet le document avec sa CSP, nosniff et sans cache", async () => {
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
