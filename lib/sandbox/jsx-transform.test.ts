import { describe, expect, it } from "vitest";

import { transformJsx } from "./jsx-transform";

describe("transformJsx", () => {
  it("transforms JSX into React.createElement calls", async () => {
    const r = await transformJsx("const a = <div>salut</div>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.createElement");
    expect(r.js).not.toContain("<div>");
  });

  it("transforms a full component with hooks", async () => {
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

  it("transforms a short fragment", async () => {
    const r = await transformJsx("const a = <><span/></>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.Fragment");
  });

  it("returns the error instead of throwing, on broken JSX", async () => {
    const r = await transformJsx("const a = <div>pas ferme;");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.length).toBeGreaterThan(0);
  });

  it("returns the error on invalid JS syntax", async () => {
    const r = await transformJsx("function ( {{{");
    expect(r.ok).toBe(false);
  });

  it("accepts empty code without throwing", async () => {
    const r = await transformJsx("");
    expect(r.ok).toBe(true);
  });
});
