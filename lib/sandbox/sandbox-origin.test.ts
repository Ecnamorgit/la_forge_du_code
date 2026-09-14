import { describe, it, expect } from "vitest";

import { sandboxOriginFor } from "./sandbox-origin";

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
