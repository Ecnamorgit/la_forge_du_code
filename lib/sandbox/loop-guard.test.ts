import { describe, expect, it } from "vitest";

import { detectInfiniteLoop, infiniteLoopMessage } from "./loop-guard";

describe("detecterBoucleInfinie", () => {
  it("attrape les formes litterales courantes", () => {
    expect(detectInfiniteLoop("while (true) {}")).toBe("while (true)");
    expect(detectInfiniteLoop("while(true){}")).toBe("while (true)");
    expect(detectInfiniteLoop("while (1) {}")).toBe("while (1)");
    expect(detectInfiniteLoop("for (;;) {}")).toBe("for (;;)");
    expect(detectInfiniteLoop("for ( ; ; ) {}")).toBe("for (;;)");
    expect(detectInfiniteLoop("for (let i = 0; true; i++) {}")).toBe("for (… ; true ; …)");
  });

  it("attrape la boucle nichee dans un composant", () => {
    const code = `function Reacteur() {
  while (true) {
    console.log("bloque");
  }
  return React.createElement("div", null, "jamais atteint");
}`;
    expect(detectInfiniteLoop(code)).toBe("while (true)");
  });

  it("laisse passer une boucle qui se termine", () => {
    expect(detectInfiniteLoop("for (let i = 0; i < 3; i++) {}")).toBeNull();
    expect(detectInfiniteLoop("while (n > 0) { n--; }")).toBeNull();
    expect(detectInfiniteLoop("items.map(function (x) { return x; })")).toBeNull();
  });

  it("ne se laisse pas piéger par une chaine de caracteres", () => {
    expect(detectInfiniteLoop('console.log("while (true)")')).toBeNull();
    expect(detectInfiniteLoop("const s = 'for (;;)';")).toBeNull();
    expect(detectInfiniteLoop("const s = `while (1)`;")).toBeNull();
  });

  it("attrape la boucle meme si une chaine en contient une autre ailleurs", () => {
    const code = 'console.log("for (;;)"); while (true) {}';
    expect(detectInfiniteLoop(code)).toBe("while (true)");
  });

  it("accepte du code vide", () => {
    expect(detectInfiniteLoop("")).toBeNull();
  });
});

describe("messageBoucleInfinie", () => {
  it("nomme la forme detectee et explique la consequence", () => {
    const msg = infiniteLoopMessage("while (true)");
    expect(msg).toContain("while (true)");
    expect(msg).toMatch(/fige/i);
    expect(msg).toMatch(/condition d'arr[eê]t/i);
  });
});

describe("detecterBoucleInfinie — commentaires", () => {
  it("ne se laisse pas piéger par un commentaire", () => {
    expect(detectInfiniteLoop("// evite le while (true)\nconst a = 1;")).toBeNull();
    expect(detectInfiniteLoop("/* pas de for (;;) ici */\nconst a = 1;")).toBeNull();
  });

  it("attrape la boucle meme si un commentaire en mentionne une", () => {
    expect(detectInfiniteLoop("// pas de for (;;)\nwhile (true) {}")).toBe("while (true)");
  });
});
