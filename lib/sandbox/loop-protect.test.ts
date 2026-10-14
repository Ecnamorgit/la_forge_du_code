import { describe, it, expect } from "vitest";

import {
  LOOP_INTERRUPTED_MESSAGE,
  guardLoops,
  guardHtmlScripts,
} from "./loop-protect";

/** Exécute le code protégé comme le bac à sable : dans une fonction. */
const execute = (code: string, timeoutMs = 50) =>
  new Function(guardLoops(code, { timeoutMs }))();

describe("protegerBoucles", () => {
  it.each([
    ["while", "let x = true; while (x) {}"],
    ["while sans accolades", "let x = true; while (x) x = true;"],
    ["do…while", "do {} while (true);"],
    ["for", "for (;;) {}"],
    ["for sans accolades", "for (let i = 0; i >= 0; i++) i = 0;"],
    ["boucle imbriquée", "for (let i = 0; i < 10; i++) { while (true) {} }"],
    ["boucle étiquetée", "externe: while (true) { continue externe; }"],
    ["boucle dans une fonction", "function f() { while (true) {} } f();"],
  ])("interrompt une boucle sans fin (%s)", (_label, code) => {
    expect(() => execute(code)).toThrow(LOOP_INTERRUPTED_MESSAGE);
  });

  it("interrompt une boucle for…of sur un itérable infini", () => {
    const code = "function* sansFin() { while (true) yield 1; } for (const x of sansFin()) {}";
    expect(() => execute(code)).toThrow(LOOP_INTERRUPTED_MESSAGE);
  });

  it("laisse une boucle qui se termine donner son résultat", () => {
    const code = "let s = 0; for (let i = 1; i <= 100; i++) { s += i; } return s;";
    expect(execute(code, 3000)).toBe(5050);
  });

  it("laisse une boucle for…in fonctionner", () => {
    const code = "const cles = []; for (const k in { a: 1, b: 2 }) cles.push(k); return cles.join(',');";
    expect(execute(code, 3000)).toBe("a,b");
  });

  it("ne touche pas un code sans boucle", () => {
    const code = 'console.log("while (true) {}");';
    expect(guardLoops(code)).toBe(code);
  });

  it("rend tel quel un code qui ne se lit pas", () => {
    const code = "while (true {";
    expect(guardLoops(code)).toBe(code);
  });

  it("protège les scripts en ligne d'un document HTML", () => {
    const html = "<body><h1>Base</h1><script>for (;;) {}</script></body>";
    const guarded = guardHtmlScripts(html);
    expect(guarded).toContain("<h1>Base</h1>");
    expect(guarded).toContain("__gardeBoucle__();");
  });

  it("laisse les scripts externes et non JavaScript d'un document HTML", () => {
    const html =
      '<script src="/a.js"></script><script type="application/json">{"while": true}</script>';
    expect(guardHtmlScripts(html)).toBe(html);
  });

  it("protège un script de type text/javascript", () => {
    const html = '<script type="text/javascript">while (true) {}</script>';
    expect(guardHtmlScripts(html)).toContain("__gardeBoucle__();");
  });

  it("repart de zéro après chaque traitement synchrone", async () => {
    const code = guardLoops("for (let i = 0; i < 3; i++) {}", { timeoutMs: 20 });
    const compiled = new Function(code);
    compiled();
    await new Promise((resolve) => setTimeout(resolve, 60));
    // Plus de 20 ms se sont écoulées, mais c'est un nouveau traitement.
    expect(() => compiled()).not.toThrow();
  });
});
