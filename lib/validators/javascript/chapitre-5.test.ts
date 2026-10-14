import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 5 — objects, properties, string methods, this.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 5 — step 1 (declare an object)", () => {
  const validate = validators[0];

  const CODE = `const pilote = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(pilote);`;

  it("passes a three-property object printed to the console", () => {
    expect(validate(CODE, ctx(['{ name: "Cadet", level: 5, ship: "NEB-01" }'])).ok).toBe(
      true
    );
  });

  it("rejects a two-property object", () => {
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote);`;
    expect(validate(code, ctx(['{ name: "Cadet", level: 5 }'])).ok).toBe(false);
  });

  it("rejects an object declared but never printed", () => {
    // Targeted failure: the declaration is right, but the output is missing.
    expect(validate(CODE, ctx([])).ok).toBe(false);
  });

  it("rejects a variable not named pilote", () => {
    const code = `const cadet = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(cadet);`;
    expect(validate(code, ctx(['{ name: "Cadet" }'])).ok).toBe(false);
  });
});

describe("JS chapter 5 — step 2 (read and modify)", () => {
  const validate = validators[1];

  const CODE = `const pilote = { name: "Cadet", level: 5, ship: "NEB-01" };
console.log(pilote.name);
pilote.level = 8;
console.log(pilote);`;

  it("passes a dot read followed by an assignment", () => {
    expect(validate(CODE, ctx(["Cadet", '{ name: "Cadet", level: 8 }'])).ok).toBe(true);
  });

  it("rejects a bracket read", () => {
    // Targeted failure: the step teaches dot notation.
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote["name"]);
pilote.level = 8;
console.log(pilote);`;
    expect(validate(code, ctx(["Cadet", "{ level: 8 }"])).ok).toBe(false);
  });

  it("rejects a level set to a value other than 8", () => {
    const code = `const pilote = { name: "Cadet", level: 5 };
console.log(pilote.name);
pilote.level = 9;
console.log(pilote);`;
    expect(validate(code, ctx(["Cadet", "{ level: 9 }"])).ok).toBe(false);
  });
});

describe("JS chapter 5 — step 3 (string methods)", () => {
  const validate = validators[2];

  const CODE = `const code = "nebula-7";
console.log(code.toUpperCase());
console.log(code.length);`;

  it("passes toUpperCase and length", () => {
    expect(validate(CODE, ctx(["NEBULA-7", "8"])).ok).toBe(true);
  });

  it("rejects a hard-coded uppercase string", () => {
    // Targeted failure: the output is right, but the method was not used.
    const code = `console.log("NEBULA-7");
console.log("nebula-7".length);`;
    expect(validate(code, ctx(["NEBULA-7", "8"])).ok).toBe(false);
  });

  it("rejects a missing length", () => {
    const code = `const code = "nebula-7";
console.log(code.toUpperCase());
console.log(code.length);`;
    expect(validate(code, ctx(["NEBULA-7"])).ok).toBe(false);
  });
});

describe("JS chapter 5 — step 4 (method and this)", () => {
  const validate = validators[3];

  const CODE = `const pilote = {
  name: "Cadet",
  greet() { return "Salut " + this.name; }
};
console.log(pilote.greet());`;

  it("passes a method that uses this and marks the final step", () => {
    const r = validate(CODE, ctx(["Salut Cadet"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a method that ignores this", () => {
    // Targeted failure: the output is right, but the name is hard-coded.
    const code = `const pilote = {
  name: "Cadet",
  greet() { return "Salut Cadet"; }
};
console.log(pilote.greet());`;
    expect(validate(code, ctx(["Salut Cadet"])).ok).toBe(false);
  });

  it("rejects a function outside the object", () => {
    const code = `const pilote = { name: "Cadet" };
function saluer(p) { return "Salut " + p.name; }
console.log(saluer(pilote));`;
    expect(validate(code, ctx(["Salut Cadet"])).ok).toBe(false);
  });
});
