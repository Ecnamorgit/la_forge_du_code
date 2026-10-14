import { describe, it, expect } from "vitest";

import { appOriginsForSandbox, requestOrigin, sandboxOriginFor } from "./sandbox-origin";

describe("sandboxOriginFor", () => {
  it("switches localhost to 127.0.0.1, same port", () => {
    expect(sandboxOriginFor("http://localhost:3000")).toBe("http://127.0.0.1:3000");
  });

  it("switches 127.0.0.1 to localhost", () => {
    expect(sandboxOriginFor("http://127.0.0.1:3000")).toBe("http://localhost:3000");
  });

  it("prefixes bac-a-sable. on the production domain", () => {
    expect(sandboxOriginFor("https://www.laforgeducode.fr")).toBe(
      "https://bac-a-sable.laforgeducode.fr"
    );
  });

  it("strips www. without doubling it", () => {
    expect(sandboxOriginFor("https://laforgeducode.fr")).toBe(
      "https://bac-a-sable.laforgeducode.fr"
    );
  });

  it("is a different origin from the application's", () => {
    for (const app of ["http://localhost:3000", "https://www.laforgeducode.fr"]) {
      expect(sandboxOriginFor(app)).not.toBe(new URL(app).origin);
    }
  });
});

describe("appOriginsForSandbox (inverse, for frame-ancestors)", () => {
  it("in production, allows the bare domain and its www. form", () => {
    expect(appOriginsForSandbox("https://bac-a-sable.laforgeducode.fr")).toEqual([
      "https://laforgeducode.fr",
      "https://www.laforgeducode.fr",
    ]);
  });

  it("locally, allows only the other local host", () => {
    expect(appOriginsForSandbox("http://127.0.0.1:3000")).toEqual(["http://localhost:3000"]);
    expect(appOriginsForSandbox("http://localhost:3000")).toEqual(["http://127.0.0.1:3000"]);
  });

  it("never mixes production and local", () => {
    const prod = appOriginsForSandbox("https://bac-a-sable.laforgeducode.fr").join(" ");
    expect(prod).not.toContain("localhost");
    expect(prod).not.toContain("127.0.0.1");
  });

  it("is consistent with sandboxOriginFor in both directions", () => {
    for (const app of ["http://localhost:3000", "https://www.laforgeducode.fr"]) {
      expect(appOriginsForSandbox(sandboxOriginFor(app))).toContain(app);
    }
  });

  it("returns an empty array for an unparsable origin", () => {
    expect(appOriginsForSandbox("pas une url")).toEqual([]);
  });
});

describe("requestOrigin", () => {
  const req = (url: string, headers: Record<string, string>) => ({ url, headers: new Headers(headers) });

  it("behind a proxy, reads x-forwarded-host and x-forwarded-proto", () => {
    expect(
      requestOrigin(
        req("http://interne:3000/learn", {
          host: "interne:3000",
          "x-forwarded-host": "www.laforgeducode.fr",
          "x-forwarded-proto": "https",
        })
      )
    ).toBe("https://www.laforgeducode.fr");
  });

  it("without a proxy, reads host and the URL's protocol", () => {
    expect(requestOrigin(req("http://localhost:3000/x", { host: "localhost:3000" }))).toBe(
      "http://localhost:3000"
    );
  });

  it("keeps only the first host of a list", () => {
    expect(
      requestOrigin(req("https://a/", { "x-forwarded-host": "www.laforgeducode.fr, autre" }))
    ).toBe("https://www.laforgeducode.fr");
  });

  it("with no header at all, falls back to the URL", () => {
    expect(requestOrigin(req("https://www.laforgeducode.fr/x", {}))).toBe(
      "https://www.laforgeducode.fr"
    );
  });
});
