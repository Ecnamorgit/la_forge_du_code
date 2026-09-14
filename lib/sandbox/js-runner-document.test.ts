import { describe, expect, it } from "vitest";

import { buildJsRunnerDocument } from "./js-runner-document";

/**
 * Le document d'exécution JavaScript servi depuis l'origine dédiée (constat
 * EXE-03), qui remplace le `srcdoc` inline de `run-js.ts`. Ses invariants de
 * sûreté sont ceux de l'ancien srcdoc, plus ceux propres à un document
 * autonome : il apprend l'origine du parent au lieu de la figer, et n'exécute
 * que du code reçu de `parent`.
 */
describe("buildJsRunnerDocument", () => {
  const html = buildJsRunnerDocument();

  it("ne fige aucune origine de parent : il l'apprend au runtime", () => {
    expect(html).toContain('parent.postMessage(msg, parentOrigin || "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("n'accepte que les messages du parent, et refuse une autre origine apprise", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("n'exécute que le type sandbox:run avec un code chaîne", () => {
    expect(html).toContain('data.type !== "sandbox:run"');
    expect(html).toContain('typeof data.code !== "string"');
  });

  it("borne le nombre et la taille des logs", () => {
    expect(html).toContain("MAX_LOGS");
    expect(html).toContain("MAX_LINE");
  });

  it("exécute le code dans un new Function à console et localStorage factices", () => {
    expect(html).toContain('new Function');
    expect(html).toContain('"console"');
    expect(html).toContain('"localStorage"');
  });

  it("diffère la réponse pour laisser le travail async vider ses logs", () => {
    expect(html).toContain("sandbox:result");
    expect(html).toMatch(/setTimeout\(function \(\) \{[\s\S]*sandbox:result/);
  });

  it("produit un script inline syntaxiquement valide", () => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
