import { describe, expect, it } from "vitest";

import { transformJsx } from "./jsx-transform";

describe("transformJsx", () => {
  it("transforme du JSX en appels React.createElement", async () => {
    const r = await transformJsx("const a = <div>salut</div>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.createElement");
    expect(r.js).not.toContain("<div>");
  });

  it("transforme un composant complet avec hooks", async () => {
    const code = `function Reacteur() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Poussee : {n}</button>;
}`;
    const r = await transformJsx(code);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.createElement");
    expect(r.js).toContain("useState");
  });

  it("transforme un fragment court", async () => {
    const r = await transformJsx("const a = <><span/></>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.Fragment");
  });

  it("porte l'erreur au lieu de lever, sur du JSX casse", async () => {
    const r = await transformJsx("const a = <div>pas ferme;");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.length).toBeGreaterThan(0);
  });

  it("porte l'erreur sur une syntaxe JS invalide", async () => {
    const r = await transformJsx("function ( {{{");
    expect(r.ok).toBe(false);
  });

  it("accepte du code vide sans lever", async () => {
    const r = await transformJsx("");
    expect(r.ok).toBe(true);
  });
});
