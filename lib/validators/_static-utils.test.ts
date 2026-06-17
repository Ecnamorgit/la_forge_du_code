import { describe, it, expect } from "vitest";
import { stripLineComments, countMatches, pass, fail } from "./_static-utils";

describe("stripLineComments", () => {
  it("retire les commentaires de ligne entière", () => {
    const code = "// instruction pédagogique\nconst x = 1;";
    const out = stripLineComments(code, "//");
    expect(out).not.toContain("instruction");
    expect(out).toContain("const x = 1;");
  });

  it("préserve un commentaire en fin de ligne (URL intacte)", () => {
    const code = "const u = 'https://exemple.fr'; // ok";
    expect(stripLineComments(code, "//")).toContain("https://exemple.fr");
  });

  it("gère d'autres marqueurs de commentaire (# et --)", () => {
    expect(stripLineComments("# titre\nSELECT 1", "#")).toContain("SELECT 1");
    expect(stripLineComments("-- comm\nSELECT 1", "--")).not.toContain("comm");
  });
});

describe("countMatches", () => {
  it("compte toutes les occurrences", () => {
    expect(countMatches("a a a", /a/)).toBe(3);
  });

  it("fonctionne même si le flag global n'est pas fourni", () => {
    expect(countMatches("<p></p><p></p>", /<p>/)).toBe(2);
  });

  it("renvoie 0 quand le motif est absent", () => {
    expect(countMatches("rien", /<div>/)).toBe(0);
  });
});

describe("pass / fail", () => {
  it("fail renvoie ok=false avec le message", () => {
    expect(fail("nope")).toEqual({ ok: false, msg: "nope" });
  });

  it("pass renvoie ok=true et la liste d'objectifs", () => {
    expect(pass("bien", ["o1", "o2"])).toMatchObject({
      ok: true,
      msg: "bien",
      objList: ["o1", "o2"],
    });
  });

  it("pass final ajoute final:true", () => {
    expect(pass("fin", ["o1"], true)).toMatchObject({ final: true });
  });
});
