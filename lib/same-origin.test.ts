import { describe, it, expect } from "vitest";

import { crossOriginRefusal, isCrossOriginRequest } from "./same-origin";

const makeRequest = (headers: Record<string, string>) =>
  new Request("http://interne:3000/api/me/visit", { method: "POST", headers });

describe("isCrossOriginRequest", () => {
  it("accepts the same origin", () => {
    expect(
      isCrossOriginRequest(makeRequest({ origin: "https://www.laforgeducode.fr", host: "www.laforgeducode.fr" }))
    ).toBe(false);
  });

  it("compares against x-forwarded-host before host, as behind Vercel", () => {
    const req = makeRequest({
      origin: "https://www.laforgeducode.fr",
      host: "interne:3000",
      "x-forwarded-host": "www.laforgeducode.fr",
    });
    expect(isCrossOriginRequest(req)).toBe(false);
  });

  it("rejects another origin", () => {
    expect(
      isCrossOriginRequest(makeRequest({ origin: "https://piege.example", host: "www.laforgeducode.fr" }))
    ).toBe(true);
  });

  it("rejects a subdomain, which SameSite would let through", () => {
    expect(
      isCrossOriginRequest(
        makeRequest({ origin: "https://bac-a-sable.laforgeducode.fr", host: "www.laforgeducode.fr" })
      )
    ).toBe(true);
  });

  it("rejects the opaque 'null' origin of a sandboxed iframe", () => {
    expect(isCrossOriginRequest(makeRequest({ origin: "null", host: "www.laforgeducode.fr" }))).toBe(true);
  });

  it("falls back to Sec-Fetch-Site without an Origin header", () => {
    expect(isCrossOriginRequest(makeRequest({ "sec-fetch-site": "cross-site" }))).toBe(true);
    expect(isCrossOriginRequest(makeRequest({ "sec-fetch-site": "same-site" }))).toBe(true);
    expect(isCrossOriginRequest(makeRequest({ "sec-fetch-site": "same-origin" }))).toBe(false);
  });

  it("lets a non-browser client through, without Origin or Sec-Fetch-Site", () => {
    expect(isCrossOriginRequest(makeRequest({}))).toBe(false);
  });
});

describe("crossOriginRefusal", () => {
  it("responds 403 to another origin", async () => {
    const res = crossOriginRefusal(makeRequest({ origin: "https://piege.example", host: "www.laforgeducode.fr" }));
    expect(res?.status).toBe(403);
  });

  it("returns nothing for the same origin", () => {
    expect(
      crossOriginRefusal(makeRequest({ origin: "https://www.laforgeducode.fr", host: "www.laforgeducode.fr" }))
    ).toBeNull();
  });
});
