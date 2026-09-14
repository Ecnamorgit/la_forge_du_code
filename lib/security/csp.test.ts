import { describe, expect, it } from "vitest";

import { buildCsp, cspDirectives, scriptSrc, tokensDeDirective } from "./csp";

const NONCE = "abc123==";

/**
 * Message affiché à qui casse ce test. Le constat EXE-03 a permis de retirer
 * `'unsafe-inline'` / `'unsafe-eval'` de `script-src` en servant l'exécution du
 * code des apprenants depuis une origine dédiée. Les réintroduire ré-ouvrirait
 * la faille pour tout le site.
 */
const POURQUOI =
  "Le code des apprenants s'exécute depuis une origine dédiée (/bac-a-sable*, " +
  "lib/sandbox/sandbox-response.ts), qui porte seule la CSP permissive. " +
  "script-src doit donc rester à nonce + 'strict-dynamic', sans 'unsafe-inline' " +
  "ni 'unsafe-eval'. Voir docs/audit-securite/corrections/EXE-03.md.";

describe("CSP — script-src (production)", () => {
  const script = () => tokensDeDirective(cspDirectives({ nonce: NONCE }), "script-src");

  it("porte le nonce de la requête", () => {
    expect(script(), POURQUOI).toContain(`'nonce-${NONCE}'`);
  });

  it("porte 'strict-dynamic'", () => {
    expect(script(), POURQUOI).toContain("'strict-dynamic'");
  });

  it("porte 'wasm-unsafe-eval' (sql.js dans un Worker)", () => {
    // WebAssembly seule, pas eval : retirer casserait le cursus SQL.
    expect(script(), POURQUOI).toContain("'wasm-unsafe-eval'");
  });

  it("ne porte PAS 'unsafe-inline' — le cœur du constat EXE-03", () => {
    expect(script(), POURQUOI).not.toContain("'unsafe-inline'");
  });

  it("ne porte PAS 'unsafe-eval' en production", () => {
    expect(script(), POURQUOI).not.toContain("'unsafe-eval'");
  });
});

describe("CSP — script-src (développement)", () => {
  it("ajoute 'unsafe-eval' en dev (React l'utilise pour le débogage)", () => {
    const dev = tokensDeDirective(cspDirectives({ nonce: NONCE, isDev: true }), "script-src");
    expect(dev).toContain("'unsafe-eval'");
    // mais jamais 'unsafe-inline', même en dev.
    expect(dev).not.toContain("'unsafe-inline'");
  });

  it("scriptSrc n'ajoute 'unsafe-eval' que si isDev", () => {
    expect(scriptSrc({ nonce: NONCE })).not.toContain("'unsafe-eval'");
    expect(scriptSrc({ nonce: NONCE, isDev: true })).toContain("'unsafe-eval'");
  });
});

describe("CSP — encadrement des aperçus", () => {
  it("frame-src autorise l'origine dédiée du bac à sable", () => {
    const frame = tokensDeDirective(cspDirectives({ nonce: NONCE }), "frame-src");
    expect(frame).toContain("https://bac-a-sable.laforgeducode.fr");
    expect(frame).toContain("http://127.0.0.1:3000");
  });

  it("l'application elle-même ne peut pas être encadrée", () => {
    const anc = tokensDeDirective(cspDirectives({ nonce: NONCE }), "frame-ancestors");
    expect(anc).toEqual(["'none'"]);
  });
});

describe("buildCsp", () => {
  it("émet une chaîne avec le nonce interpolé", () => {
    const csp = buildCsp({ nonce: NONCE });
    expect(csp).toContain(`'nonce-${NONCE}'`);
    expect(csp).toContain("script-src");
  });
});

describe("tokensDeDirective", () => {
  const directives = cspDirectives({ nonce: NONCE });

  it("isole les tokens d'une directive sans son nom", () => {
    expect(tokensDeDirective(directives, "object-src")).toEqual(["'none'"]);
  });

  it("isole style-src de script-src", () => {
    // style-src garde 'unsafe-inline' ; le test de script-src ci-dessus ne
    // doit pas passer au vert grâce à cette présence dans style-src.
    expect(tokensDeDirective(directives, "style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("ne confond pas une directive avec une autre au préfixe commun", () => {
    // `script-src-elem` commence par `script-src` : demander l'une ne doit
    // jamais renvoyer les tokens de l'autre.
    expect(tokensDeDirective(directives, "script-src-elem")).toEqual([]);
  });
});
