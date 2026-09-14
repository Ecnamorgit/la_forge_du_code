import { describe, it, expect } from "vitest";

import { appOriginsForSandbox, originDeLaRequete, sandboxOriginFor } from "./sandbox-origin";

describe("sandboxOriginFor", () => {
  it("bascule localhost vers 127.0.0.1, même port", () => {
    expect(sandboxOriginFor("http://localhost:3000")).toBe("http://127.0.0.1:3000");
  });

  it("bascule 127.0.0.1 vers localhost", () => {
    expect(sandboxOriginFor("http://127.0.0.1:3000")).toBe("http://localhost:3000");
  });

  it("préfixe bac-a-sable. sur le domaine de production", () => {
    expect(sandboxOriginFor("https://www.laforgeducode.fr")).toBe(
      "https://bac-a-sable.laforgeducode.fr"
    );
  });

  it("retire www. sans le doubler", () => {
    expect(sandboxOriginFor("https://laforgeducode.fr")).toBe(
      "https://bac-a-sable.laforgeducode.fr"
    );
  });

  it("est une origine différente de celle de l'application", () => {
    for (const app of ["http://localhost:3000", "https://www.laforgeducode.fr"]) {
      expect(sandboxOriginFor(app)).not.toBe(new URL(app).origin);
    }
  });
});

describe("appOriginsForSandbox (inverse, pour frame-ancestors)", () => {
  it("en production, autorise le domaine nu et sa forme www.", () => {
    expect(appOriginsForSandbox("https://bac-a-sable.laforgeducode.fr")).toEqual([
      "https://laforgeducode.fr",
      "https://www.laforgeducode.fr",
    ]);
  });

  it("en local, autorise l'autre hôte local seulement", () => {
    expect(appOriginsForSandbox("http://127.0.0.1:3000")).toEqual(["http://localhost:3000"]);
    expect(appOriginsForSandbox("http://localhost:3000")).toEqual(["http://127.0.0.1:3000"]);
  });

  it("ne mélange jamais production et local", () => {
    const prod = appOriginsForSandbox("https://bac-a-sable.laforgeducode.fr").join(" ");
    expect(prod).not.toContain("localhost");
    expect(prod).not.toContain("127.0.0.1");
  });

  it("est cohérent avec sandboxOriginFor dans les deux sens", () => {
    for (const app of ["http://localhost:3000", "https://www.laforgeducode.fr"]) {
      expect(appOriginsForSandbox(sandboxOriginFor(app))).toContain(app);
    }
  });

  it("rend un tableau vide pour une origine illisible", () => {
    expect(appOriginsForSandbox("pas une url")).toEqual([]);
  });
});

describe("originDeLaRequete", () => {
  const req = (url: string, headers: Record<string, string>) => ({ url, headers: new Headers(headers) });

  it("derrière un proxy, lit x-forwarded-host et x-forwarded-proto", () => {
    expect(
      originDeLaRequete(
        req("http://interne:3000/learn", {
          host: "interne:3000",
          "x-forwarded-host": "www.laforgeducode.fr",
          "x-forwarded-proto": "https",
        })
      )
    ).toBe("https://www.laforgeducode.fr");
  });

  it("sans proxy, lit host et le protocole de l'URL", () => {
    expect(originDeLaRequete(req("http://localhost:3000/x", { host: "localhost:3000" }))).toBe(
      "http://localhost:3000"
    );
  });

  it("ne garde que le premier hôte d'une liste", () => {
    expect(
      originDeLaRequete(req("https://a/", { "x-forwarded-host": "www.laforgeducode.fr, autre" }))
    ).toBe("https://www.laforgeducode.fr");
  });

  it("sans aucun en-tête, se rabat sur l'URL", () => {
    expect(originDeLaRequete(req("https://www.laforgeducode.fr/x", {}))).toBe(
      "https://www.laforgeducode.fr"
    );
  });
});
