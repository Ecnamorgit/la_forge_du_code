import { describe, expect, it } from "vitest";

import { buildHtmlPreviewDocument } from "./html-preview-document";

/**
 * La coquille de l'aperçu HTML servie depuis l'origine dédiée (constat EXE-03),
 * qui remplace le `srcdoc` inline de ChapterWorkspace.
 */
describe("buildHtmlPreviewDocument", () => {
  const html = buildHtmlPreviewDocument();

  it("rend le HTML dans une iframe imbriquée sandboxée", () => {
    // Une scène imbriquée (srcdoc) hérite de la CSP de la coquille (permissive),
    // pas de celle du site : c'est ce qui découple la CSP.
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
