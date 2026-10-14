import { describe, expect, it } from "vitest";

import { detectInfiniteLoop, infiniteLoopMessage } from "./loop-guard";

describe("detectInfiniteLoop", () => {
  it("catches the common literal forms", () => {
    expect(detectInfiniteLoop("while (true) {}")).toBe("while (true)");
    expect(detectInfiniteLoop("while(true){}")).toBe("while (true)");
    expect(detectInfiniteLoop("while (1) {}")).toBe("while (1)");
    expect(detectInfiniteLoop("for (;;) {}")).toBe("for (;;)");
    expect(detectInfiniteLoop("for ( ; ; ) {}")).toBe("for (;;)");
    expect(detectInfiniteLoop("for (let i = 0; true; i++) {}")).toBe("for (… ; true ; …)");
  });

  it("catches a loop nested in a component", () => {
    const code = `function Reacteur() {
  while (true) {
    console.log("bloque");
  }
  return React.createElement("div", null, "jamais atteint");
}`;
    expect(detectInfiniteLoop(code)).toBe("while (true)");
  });

  it("lets a terminating loop through", () => {
    expect(detectInfiniteLoop("for (let i = 0; i < 3; i++) {}")).toBeNull();
    expect(detectInfiniteLoop("while (n > 0) { n--; }")).toBeNull();
    expect(detectInfiniteLoop("items.map(function (x) { return x; })")).toBeNull();
  });

  it("is not fooled by a string literal", () => {
    expect(detectInfiniteLoop('console.log("while (true)")')).toBeNull();
    expect(detectInfiniteLoop("const s = 'for (;;)';")).toBeNull();
    expect(detectInfiniteLoop("const s = `while (1)`;")).toBeNull();
  });

  it("catches the loop even if a string elsewhere contains another one", () => {
    const code = 'console.log("for (;;)"); while (true) {}';
    expect(detectInfiniteLoop(code)).toBe("while (true)");
  });

  it("accepts empty code", () => {
    expect(detectInfiniteLoop("")).toBeNull();
  });
});

describe("infiniteLoopMessage", () => {
  it("names the detected form and explains the consequence", () => {
    const msg = infiniteLoopMessage("while (true)");
    expect(msg).toContain("while (true)");
    expect(msg).toMatch(/fige/i);
    expect(msg).toMatch(/condition d'arr[eê]t/i);
  });
});

describe("detectInfiniteLoop — comments", () => {
  it("is not fooled by a comment", () => {
    expect(detectInfiniteLoop("// evite le while (true)\nconst a = 1;")).toBeNull();
    expect(detectInfiniteLoop("/* pas de for (;;) ici */\nconst a = 1;")).toBeNull();
  });

  it("catches the loop even if a comment mentions one", () => {
    expect(detectInfiniteLoop("// pas de for (;;)\nwhile (true) {}")).toBe("while (true)");
  });
});
