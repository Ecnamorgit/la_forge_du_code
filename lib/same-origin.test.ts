import { describe, it, expect } from "vitest";

import { crossOriginRefusal, isCrossOriginRequest } from "./same-origin";

const requete = (headers: Record<string, string>) =>
  new Request("http://interne:3000/api/me/visit", { method: "POST", headers });

describe("isCrossOriginRequest", () => {
  it("accepte la même origine", () => {
    expect(
      isCrossOriginRequest(requete({ origin: "https://www.laforgeducode.fr", host: "www.laforgeducode.fr" }))
    ).toBe(false);
  });

  it("compare à x-forwarded-host avant host, comme derrière Vercel", () => {
    const req = requete({
      origin: "https://www.laforgeducode.fr",
      host: "interne:3000",
      "x-forwarded-host": "www.laforgeducode.fr",
    });
    expect(isCrossOriginRequest(req)).toBe(false);
  });

  it("refuse une autre origine", () => {
    expect(
      isCrossOriginRequest(requete({ origin: "https://piege.example", host: "www.laforgeducode.fr" }))
    ).toBe(true);
  });

  it("refuse un sous-domaine, que SameSite laisserait passer", () => {
    expect(
      isCrossOriginRequest(
        requete({ origin: "https://bac-a-sable.laforgeducode.fr", host: "www.laforgeducode.fr" })
      )
    ).toBe(true);
  });

  it("refuse l'origine opaque « null » d'une iframe sandboxée", () => {
    expect(isCrossOriginRequest(requete({ origin: "null", host: "www.laforgeducode.fr" }))).toBe(true);
  });

  it("se rabat sur Sec-Fetch-Site sans en-tête Origin", () => {
    expect(isCrossOriginRequest(requete({ "sec-fetch-site": "cross-site" }))).toBe(true);
    expect(isCrossOriginRequest(requete({ "sec-fetch-site": "same-site" }))).toBe(true);
    expect(isCrossOriginRequest(requete({ "sec-fetch-site": "same-origin" }))).toBe(false);
  });

  it("laisse passer un client hors navigateur, sans Origin ni Sec-Fetch-Site", () => {
    expect(isCrossOriginRequest(requete({}))).toBe(false);
  });
});

describe("crossOriginRefusal", () => {
  it("répond 403 à une autre origine", async () => {
    const res = crossOriginRefusal(requete({ origin: "https://piege.example", host: "www.laforgeducode.fr" }));
    expect(res?.status).toBe(403);
  });

  it("ne répond rien à la même origine", () => {
    expect(
      crossOriginRefusal(requete({ origin: "https://www.laforgeducode.fr", host: "www.laforgeducode.fr" }))
    ).toBeNull();
  });
});
