import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 2 — operators and conditions.
 *
 * These validators judge a run: we give them the `logs` the sandbox would
 * have produced. A passing case must therefore be consistent: the submitted
 * code and the output it would actually produce.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 2 — step 1 (arithmetic)", () => {
  const validate = validators[0];

  it("passes a calculation whose console prints 56", () => {
    const code = "const carburant = 80; const conso = 12; console.log(carburant - conso * 2);";
    expect(validate(code, ctx(["56"])).ok).toBe(true);
  });

  it("rejects a hard-coded 56, without an operator", () => {
    // Targeted failure: the output is right, but no calculation took place.
    expect(validate('console.log("56")', ctx(["56"])).ok).toBe(false);
  });

  it("rejects a calculation whose result is not 56", () => {
    const code = "const carburant = 80; const conso = 12; console.log(carburant - conso);";
    expect(validate(code, ctx(["68"])).ok).toBe(false);
  });

  it("reports a runtime error", () => {
    const r = validate("console.log(x - 1)", ctx([], "ReferenceError: x is not defined"));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Erreur d'exécution/);
  });

  it("rejects a missing run context", () => {
    expect(validate("console.log(80 - 12 * 2)").ok).toBe(false);
  });
});

describe("JS chapter 2 — step 2 (comparison)", () => {
  const validate = validators[1];

  it("passes a comparison that prints false", () => {
    expect(validate("console.log(10 > 20)", ctx(["false"])).ok).toBe(true);
  });

  it("rejects a hard-coded false", () => {
    expect(validate('console.log("false")', ctx(["false"])).ok).toBe(false);
  });

  it("rejects a comparison that prints true", () => {
    // Targeted failure: the operator is there, but the expected result is false.
    expect(validate("console.log(20 > 10)", ctx(["true"])).ok).toBe(false);
  });
});

describe("JS chapter 2 — step 3 (if / else)", () => {
  const validate = validators[2];

  const OK = `const niveauBouclier = 25;
if (niveauBouclier < 30) {
  console.log("ALERTE");
} else {
  console.log("OK");
}`;

  it("passes a condition on niveauBouclier that triggers the alert", () => {
    expect(validate(OK, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("rejects a constant condition that ignores the shield", () => {
    // Targeted failure: the output is right but nothing was tested.
    const code = `if (true) { console.log("ALERTE"); } else { console.log("OK"); }`;
    expect(validate(code, ctx(["ALERTE"])).ok).toBe(false);
  });

  it("rejects an if without an else branch", () => {
    const code = `const niveauBouclier = 25;
if (niveauBouclier < 30) { console.log("ALERTE"); }`;
    expect(validate(code, ctx(["ALERTE"])).ok).toBe(false);
  });

  it("rejects a run that prints both branches", () => {
    // Targeted failure: with the shield at 25, only ALERTE must be printed.
    expect(validate(OK, ctx(["ALERTE", "OK"])).ok).toBe(false);
  });
});

describe("JS chapter 2 — step 4 (else if)", () => {
  const validate = validators[3];

  const OK = `const temperature = 72;
if (temperature > 90) {
  console.log("CRITIQUE");
} else if (temperature > 50) {
  console.log("OK");
} else {
  console.log("FROID");
}`;

  it("passes three zones and marks the step as final", () => {
    const r = validate(OK, ctx(["OK"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects only two branches, without else if", () => {
    const code = `const temperature = 72;
if (temperature > 50) { console.log("OK"); } else { console.log("FROID"); }`;
    expect(validate(code, ctx(["OK"])).ok).toBe(false);
  });

  it("rejects an output other than OK", () => {
    expect(validate(OK, ctx(["CRITIQUE"])).ok).toBe(false);
  });

  it("rejects an else if without a final else branch", () => {
    const code = `const temperature = 72;
if (temperature > 90) {
  console.log("CRITIQUE");
} else if (temperature > 50) {
  console.log("OK");
}`;
    const r = validate(code, ctx(["OK"]));
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/else finale/);
  });

  it("accepts a final else glued to the brace", () => {
    const code = OK.replace("} else {", "}else{");
    expect(validate(code, ctx(["OK"])).ok).toBe(true);
  });
});
