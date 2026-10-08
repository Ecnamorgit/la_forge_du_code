import { describe, expect, it } from "vitest";

import { buildHtmlPreviewDocument } from "./html-preview-document";

describe("buildHtmlPreviewDocument", () => {
  const html = buildHtmlPreviewDocument();

  it("rend le HTML dans une iframe imbriquée sandboxée", () => {
    // La scène imbriquée hérite de la CSP permissive de la coquille, pas de
    // celle du site.
    expect(html).toContain('id="scene"');
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).toContain("scene.srcdoc = data.html");
  });

  it("ne fige aucune origine de parent : il l'apprend au runtime", () => {
    expect(html).toContain('parent.postMessage({ type: "html:ready" }, "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("n'accepte que les messages du parent, et refuse une autre origine apprise", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("n'accepte que le type html:render avec un html chaîne", () => {
    expect(html).toContain('data.type !== "html:render"');
    expect(html).toContain('typeof data.html !== "string"');
  });

  it("produit un script inline syntaxiquement valide", () => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
