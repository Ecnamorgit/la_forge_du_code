import { describe, expect, it } from "vitest";

import { buildJsRunnerDocument } from "./js-runner-document";

/**
 * JavaScript execution document served from the dedicated origin (audit
 * EXE-03): it learns the parent's origin instead of hardcoding it, and only
 * runs code received from `parent`.
 */
describe("buildJsRunnerDocument", () => {
  const html = buildJsRunnerDocument();

  it("hardcodes no parent origin: it learns it at runtime", () => {
    expect(html).toContain('parent.postMessage(msg, parentOrigin || "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("only accepts messages from the parent, and rejects any origin other than the learned one", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("only runs the sandbox:run type with a string code", () => {
    expect(html).toContain('data.type !== "sandbox:run"');
    expect(html).toContain('typeof data.code !== "string"');
  });

  it("caps the number and size of logs", () => {
    expect(html).toContain("MAX_LOGS");
    expect(html).toContain("MAX_LINE");
  });

  it("runs the code in a new Function with fake console and localStorage", () => {
    expect(html).toContain('new Function');
    expect(html).toContain('"console"');
    expect(html).toContain('"localStorage"');
  });

  it("delays the response so async work can flush its logs", () => {
    expect(html).toContain("sandbox:result");
    expect(html).toMatch(/setTimeout\(function \(\) \{[\s\S]*sandbox:result/);
  });

  it("produces a syntactically valid inline script", () => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
