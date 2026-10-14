import { describe, it, expect } from "vitest";
import { stripLineComments, countMatches, pass, fail } from "./_static-utils";

describe("stripLineComments", () => {
  it("removes full-line comments", () => {
    const code = "// instruction pédagogique\nconst x = 1;";
    const out = stripLineComments(code, "//");
    expect(out).not.toContain("instruction");
    expect(out).toContain("const x = 1;");
  });

  it("keeps an end-of-line comment (URL left intact)", () => {
    const code = "const u = 'https://exemple.fr'; // ok";
    expect(stripLineComments(code, "//")).toContain("https://exemple.fr");
  });

  it("handles other comment markers (# and --)", () => {
    expect(stripLineComments("# titre\nSELECT 1", "#")).toContain("SELECT 1");
    expect(stripLineComments("-- comm\nSELECT 1", "--")).not.toContain("comm");
  });
});

describe("countMatches", () => {
  it("counts every occurrence", () => {
    expect(countMatches("a a a", /a/)).toBe(3);
  });

  it("works even when the global flag is not provided", () => {
    expect(countMatches("<p></p><p></p>", /<p>/)).toBe(2);
  });

  it("returns 0 when the pattern is absent", () => {
    expect(countMatches("rien", /<div>/)).toBe(0);
  });
});

describe("pass / fail", () => {
  it("fail returns ok=false with the message", () => {
    expect(fail("nope")).toEqual({ ok: false, msg: "nope" });
  });

  it("pass returns ok=true and the list of objectives", () => {
    expect(pass("bien", ["o1", "o2"])).toMatchObject({
      ok: true,
      msg: "bien",
      objList: ["o1", "o2"],
    });
  });

  it("final pass adds final:true", () => {
    expect(pass("fin", ["o1"], true)).toMatchObject({ final: true });
  });
});
