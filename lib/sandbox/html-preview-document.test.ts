import { describe, expect, it } from "vitest";

import { buildHtmlPreviewDocument } from "./html-preview-document";

describe("buildHtmlPreviewDocument", () => {
  const html = buildHtmlPreviewDocument();

  it("renders the HTML in a nested sandboxed iframe", () => {
    // The nested scene inherits the shell's permissive CSP, not the
    // site's.
    expect(html).toContain('id="scene"');
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).toContain("scene.srcdoc = data.html");
  });

  it("hardcodes no parent origin: it learns it at runtime", () => {
    expect(html).toContain('parent.postMessage({ type: "html:ready" }, "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("only accepts messages from the parent, and rejects any origin other than the learned one", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("only accepts the html:render type with a string html", () => {
    expect(html).toContain('data.type !== "html:render"');
    expect(html).toContain('typeof data.html !== "string"');
  });

  it("produces a syntactically valid inline script", () => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
