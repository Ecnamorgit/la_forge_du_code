import { describe, expect, it } from "vitest";

import { detecterBoucleInfinie, messageBoucleInfinie } from "./loop-guard";

describe("detecterBoucleInfinie", () => {
  it("attrape les formes litterales courantes", () => {
    expect(detecterBoucleInfinie("while (true) {}")).toBe("while (true)");
    expect(detecterBoucleInfinie("while(true){}")).toBe("while (true)");
    expect(detecterBoucleInfinie("while (1) {}")).toBe("while (1)");
    expect(detecterBoucleInfinie("for (;;) {}")).toBe("for (;;)");
    expect(detecterBoucleInfinie("for ( ; ; ) {}")).toBe("for (;;)");
    expect(detecterBoucleInfinie("for (let i = 0; true; i++) {}")).toBe("for (… ; true ; …)");
  });

  it("attrape la boucle nichee dans un composant", () => {
    const code = `function Reacteur() {
  while (true) {
    console.log("bloque");
  }
  return React.createElement("div", null, "jamais atteint");
}`;
    expect(detecterBoucleInfinie(code)).toBe("while (true)");
  });

  it("laisse passer une boucle qui se termine", () => {
    expect(detecterBoucleInfinie("for (let i = 0; i < 3; i++) {}")).toBeNull();
    expect(detecterBoucleInfinie("while (n > 0) { n--; }")).toBeNull();
    expect(detecterBoucleInfinie("items.map(function (x) { return x; })")).toBeNull();
  });

  it("ne se laisse pas piéger par une chaine de caracteres", () => {
    // Refuser de deployer parce que l'apprenant AFFICHE le texte "while (true)"
    // serait pire que le probleme qu'on evite.
    expect(detecterBoucleInfinie('console.log("while (true)")')).toBeNull();
    expect(detecterBoucleInfinie("const s = 'for (;;)';")).toBeNull();
    expect(detecterBoucleInfinie("const s = `while (1)`;")).toBeNull();
  });

  it("attrape la boucle meme si une chaine en contient une autre ailleurs", () => {
    const code = 'console.log("for (;;)"); while (true) {}';
    expect(detecterBoucleInfinie(code)).toBe("while (true)");
  });

  it("accepte du code vide", () => {
    expect(detecterBoucleInfinie("")).toBeNull();
  });
});

describe("messageBoucleInfinie", () => {
  it("nomme la forme detectee et explique la consequence", () => {
    const msg = messageBoucleInfinie("while (true)");
    expect(msg).toContain("while (true)");
    expect(msg).toMatch(/fige/i);
    expect(msg).toMatch(/condition d'arr[eê]t/i);
  });
});

describe("detecterBoucleInfinie — commentaires", () => {
  it("ne se laisse pas piéger par un commentaire", () => {
    // Refuser de deployer parce que l'apprenant MENTIONNE une boucle dans un
    // commentaire serait absurde.
    expect(detecterBoucleInfinie("// evite le while (true)\nconst a = 1;")).toBeNull();
    expect(detecterBoucleInfinie("/* pas de for (;;) ici */\nconst a = 1;")).toBeNull();
  });

  it("attrape la boucle meme si un commentaire en mentionne une", () => {
    expect(detecterBoucleInfinie("// pas de for (;;)\nwhile (true) {}")).toBe("while (true)");
  });
});
