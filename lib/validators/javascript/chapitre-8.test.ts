import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 8 — events: click, delegation, input, submission.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 8 — step 1 (listen for a click)", () => {
  const validate = validators[0];

  const CODE = `const bouton = document.querySelector("button");
bouton.addEventListener("click", () => console.log("PEW"));
bouton.click();
bouton.click();`;

  it("passes a listener fired twice", () => {
    expect(validate(CODE, ctx(["PEW", "PEW"])).ok).toBe(true);
  });

  it("rejects a single firing", () => {
    // Targeted failure: the step asks to prove that the listener fires again.
    expect(validate(CODE, ctx(["PEW"])).ok).toBe(false);
  });

  it("rejects an onclick property, without addEventListener", () => {
    const code = `const bouton = document.querySelector("button");
bouton.onclick = () => console.log("PEW");
bouton.click();
bouton.click();`;
    expect(validate(code, ctx(["PEW", "PEW"])).ok).toBe(false);
  });
});

describe("JS chapter 8 — step 2 (identify the source)", () => {
  const validate = validators[1];

  const CODE = `document.querySelectorAll("button").forEach((b) => {
  b.addEventListener("click", (e) => console.log(e.target.id));
});
document.getElementById("b2").click();`;

  it("passes a click on b2 that logs its id", () => {
    expect(validate(CODE, ctx(["b2"])).ok).toBe(true);
  });

  it("rejects an output that is not the clicked id", () => {
    expect(validate(CODE, ctx(["b1"])).ok).toBe(false);
  });

  it("rejects a missing click listener", () => {
    const code = `console.log("b2");`;
    expect(validate(code, ctx(["b2"])).ok).toBe(false);
  });
});

describe("JS chapter 8 — step 3 (track the input)", () => {
  const validate = validators[2];

  const CODE = `const champ = document.querySelector("input");
champ.addEventListener("input", (e) => console.log("Salut " + e.target.value));
champ.value = "Luna";
champ.dispatchEvent(new Event("input"));`;

  it("passes an input listener that echoes the typed value", () => {
    expect(validate(CODE, ctx(["Salut Luna"])).ok).toBe(true);
  });

  it("rejects a click listener instead of input", () => {
    // Targeted failure: it is not the same event, nor the same moment.
    const code = `const champ = document.querySelector("input");
champ.addEventListener("click", () => console.log("Salut Luna"));
champ.click();`;
    expect(validate(code, ctx(["Salut Luna"])).ok).toBe(false);
  });

  it("rejects an output that does not echo the input", () => {
    expect(validate(CODE, ctx(["Salut"])).ok).toBe(false);
  });
});

describe("JS chapter 8 — step 4 (controlled submission)", () => {
  const validate = validators[3];

  const CODE = `const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Code : secret");
});
form.dispatchEvent(new Event("submit"));`;

  it("passes an intercepted submit and marks the final step", () => {
    const r = validate(CODE, ctx(["Code : secret"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a submit without preventDefault", () => {
    // Targeted failure: without it, the page reloads and the JS is useless.
    const code = `const form = document.querySelector("form");
form.addEventListener("submit", () => console.log("Code : secret"));
form.dispatchEvent(new Event("submit"));`;
    expect(validate(code, ctx(["Code : secret"])).ok).toBe(false);
  });

  it("rejects a click listener instead of submit", () => {
    const code = `const bouton = document.querySelector("button");
bouton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Code : secret");
});
bouton.click();`;
    expect(validate(code, ctx(["Code : secret"])).ok).toBe(false);
  });
});
