import { describe, it, expect } from "vitest";

import {
  LOOP_INTERRUPTED_MESSAGE,
  guardLoops,
  guardHtmlScripts,
} from "./loop-protect";

/** Runs the guarded code the way the sandbox does: inside a function. */
const execute = (code: string, timeoutMs = 50) =>
  new Function(guardLoops(code, { timeoutMs }))();

describe("guardLoops", () => {
  it.each([
    ["while", "let x = true; while (x) {}"],
    ["while without braces", "let x = true; while (x) x = true;"],
    ["do…while", "do {} while (true);"],
    ["for", "for (;;) {}"],
    ["for without braces", "for (let i = 0; i >= 0; i++) i = 0;"],
    ["nested loop", "for (let i = 0; i < 10; i++) { while (true) {} }"],
    ["labeled loop", "outer: while (true) { continue outer; }"],
    ["loop inside a function", "function f() { while (true) {} } f();"],
  ])("interrupts an infinite loop (%s)", (_label, code) => {
    expect(() => execute(code)).toThrow(LOOP_INTERRUPTED_MESSAGE);
  });

  it("interrupts a for…of loop over an infinite iterable", () => {
    const code = "function* endless() { while (true) yield 1; } for (const x of endless()) {}";
    expect(() => execute(code)).toThrow(LOOP_INTERRUPTED_MESSAGE);
  });

  it("lets a terminating loop return its result", () => {
    const code = "let s = 0; for (let i = 1; i <= 100; i++) { s += i; } return s;";
    expect(execute(code, 3000)).toBe(5050);
  });

  it("lets a for…in loop work", () => {
    const code = "const cles = []; for (const k in { a: 1, b: 2 }) cles.push(k); return cles.join(',');";
    expect(execute(code, 3000)).toBe("a,b");
  });

  it("leaves code without loops untouched", () => {
    const code = 'console.log("while (true) {}");';
    expect(guardLoops(code)).toBe(code);
  });

  it("returns unparsable code unchanged", () => {
    const code = "while (true {";
    expect(guardLoops(code)).toBe(code);
  });

  it("guards the inline scripts of an HTML document", () => {
    const html = "<body><h1>Base</h1><script>for (;;) {}</script></body>";
    const guarded = guardHtmlScripts(html);
    expect(guarded).toContain("<h1>Base</h1>");
    expect(guarded).toContain("__gardeBoucle__();");
  });

  it("leaves external and non-JavaScript scripts of an HTML document alone", () => {
    const html =
      '<script src="/a.js"></script><script type="application/json">{"while": true}</script>';
    expect(guardHtmlScripts(html)).toBe(html);
  });

  it("guards a script of type text/javascript", () => {
    const html = '<script type="text/javascript">while (true) {}</script>';
    expect(guardHtmlScripts(html)).toContain("__gardeBoucle__();");
  });

  it("resets after each synchronous task", async () => {
    const code = guardLoops("for (let i = 0; i < 3; i++) {}", { timeoutMs: 20 });
    const compiled = new Function(code);
    compiled();
    await new Promise((resolve) => setTimeout(resolve, 60));
    // More than 20 ms have passed, but this is a new task.
    expect(() => compiled()).not.toThrow();
  });
});
