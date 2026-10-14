import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapter 7 — DOM manipulation.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapter 7 — step 1 (create and insert)", () => {
  const validate = validators[0];

  const CODE = `const bloc = document.createElement("div");
bloc.textContent = "Centre de commande";
document.body.appendChild(bloc);
console.log(document.body.innerHTML);`;

  it("passes a creation followed by an insertion", () => {
    expect(validate(CODE, ctx(["<div>Centre de commande</div>"])).ok).toBe(true);
  });

  it("rejects innerHTML written directly, without createElement", () => {
    // Targeted failure: the rendering is identical, but the taught method is missing.
    const code = `document.body.innerHTML = "<div>Centre de commande</div>";
console.log(document.body.innerHTML);`;
    expect(validate(code, ctx(["<div>Centre de commande</div>"])).ok).toBe(false);
  });

  it("rejects an element created but never inserted", () => {
    const code = `const bloc = document.createElement("div");
bloc.textContent = "Centre de commande";
console.log(bloc.outerHTML);`;
    expect(validate(code, ctx(["<div>Centre de commande</div>"])).ok).toBe(false);
  });
});

describe("JS chapter 7 — step 2 (mission list)", () => {
  const validate = validators[1];

  const CODE = `const ul = document.createElement("ul");
["A", "B", "C"].forEach((t) => {
  const li = document.createElement("li");
  li.textContent = t;
  ul.appendChild(li);
});
document.body.appendChild(ul);
console.log(document.querySelectorAll("li").length);`;

  it("passes a ul with three li counted in the console", () => {
    expect(validate(CODE, ctx(["3"])).ok).toBe(true);
  });

  it("rejects a count other than three", () => {
    expect(validate(CODE, ctx(["2"])).ok).toBe(false);
  });

  it("rejects a list built with innerHTML", () => {
    const code = `document.body.innerHTML = "<ul><li>A</li><li>B</li><li>C</li></ul>";
console.log(document.querySelectorAll("li").length);`;
    expect(validate(code, ctx(["3"])).ok).toBe(false);
  });
});

describe("JS chapter 7 — step 3 (class and content)", () => {
  const validate = validators[2];

  it("passes a className change", () => {
    const code = `const bloc = document.querySelector("div");
bloc.className = "alerte";
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(validate(code, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("accepts classList.add as equivalent", () => {
    const code = `const bloc = document.querySelector("div");
bloc.classList.add("alerte");
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(validate(code, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("rejects a text change without touching the class", () => {
    // Targeted failure: the step is about the class as much as the content.
    const code = `const bloc = document.querySelector("div");
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(validate(code, ctx(["ALERTE"])).ok).toBe(false);
  });
});

describe("JS chapter 7 — step 4 (traverse the DOM)", () => {
  const validate = validators[3];

  const CODE = `document.querySelectorAll("span").forEach((s) => console.log(s.textContent));`;

  it("passes a traversal that logs three spans and marks the final step", () => {
    const r = validate(CODE, ctx(["A", "B", "C"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects an incomplete traversal", () => {
    expect(validate(CODE, ctx(["A", "B"])).ok).toBe(false);
  });

  it("rejects a plain querySelector, which only takes the first one", () => {
    const code = `console.log(document.querySelector("span").textContent);`;
    expect(validate(code, ctx(["A", "B", "C"])).ok).toBe(false);
  });
});
