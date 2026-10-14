import { describe, expect, it } from "vitest";

import { buildPreviewDocument } from "./preview-document";
import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";

/**
 * React preview document served from the dedicated origin (audit EXE-03). It
 * inherits nothing from the parent: it learns its origin instead of hardcoding
 * it, and loads its runtime through a relative URL.
 */
describe("buildPreviewDocument", () => {
  const html = buildPreviewDocument();

  it("sets up a mount container", () => {
    expect(html).toContain('id="root"');
  });

  it("loads the runtime through a RELATIVE URL on the dedicated origin", () => {
    // The document has a real origin: the relative URL resolves against the
    // dedicated origin, the only one its CSP allows for scripts.
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]!);
    expect(srcs).toContain("/react-runtime/runtime.js");
    for (const src of srcs) {
      expect(src.startsWith("http"), `absolute src found: ${src}`).toBe(false);
    }
  });

  it("hardcodes no parent origin: it learns it at runtime", () => {
    expect(html).toContain('parent.postMessage(msg, parentOrigin || "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("only talks to the parent and rejects other origins once learned", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("inserts a line break before the injected return", () => {
    // Without it, learner code ending with a `//` comment swallows the
    // `return`: the component is reported as not found even though it is correct.
    expect(html).toContain(String.raw`\n; return typeof`);
  });

  it("validates the component name with the SAME regex as the parent", () => {
    // Injected through JSON.stringify, never copied, so the two
    // regexes cannot drift apart.
    expect(html).toContain(JSON.stringify(PREVIEW_MOUNT_NAME_RE.source));
  });

  it("installs error safety nets outside the render cycle", () => {
    expect(html).toContain("onerror");
    expect(html).toContain("unhandledrejection");
  });

  it("reads the message from the error object in window.onerror", () => {
    // The bundle is loaded cross-origin relative to the iframe's opaque
    // origin: exceptions reported while it runs become
    // "Script error." with no detail. The error object is the only useful path.
    expect(html).toMatch(/onerror\s*=\s*function\s*\([^)]*error[^)]*\)/);
    expect(html).toContain("error.message");
  });

  it("derives the React globals instead of listing them", () => {
    expect(html).toContain("Object.keys(React)");
    for (const hook of ["useState", "useRef", "useContext", "useMemo", "useEffect"]) {
      expect(html, `hook ${hook} hard-coded in the list`).not.toContain(`"${hook}"`);
      expect(html, `hook ${hook} hard-coded in the list`).not.toContain(`'${hook}'`);
    }
  });

  it("produces a syntactically valid inline script", () => {
    // Catches an interpolation that would produce invalid JS. An unescaped
    // backtick in the template literal breaks module compilation instead:
    // this file then fails as soon as it loads.
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
