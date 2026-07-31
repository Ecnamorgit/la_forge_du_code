import { describe, it, expect } from "vitest";
import { SCRIPT_SRC_REQUIS, tokensDeDirective } from "./csp";

/**
 * Message affiché à qui casse ce test. Il sera très probablement en train de
 * faire CF-15 (durcir la CSP) avec des critères d'acceptation écrits avant que
 * l'aperçu React existe. Le message est le livrable : un test qui échoue sans
 * dire pourquoi se contourne.
 */
const POURQUOI =
  "L'aperçu React (lib/sandbox/react-preview.ts) et le sandbox JavaScript " +
  "(lib/sandbox/run-js.ts) en dépendent pour exister — les retirer casse deux " +
  "cursus entiers, pas seulement une option. Lis docs/BRIEF_CSP_GARDE_FOU.md " +
  "avant de toucher à script-src (tâche CF-15, docs/ROADMAP.md).";

describe("CSP — script-src", () => {
  it.each([...SCRIPT_SRC_REQUIS])("conserve %s", (token) => {
    expect(
      tokensDeDirective("script-src"),
      `script-src a perdu ${token}. ${POURQUOI}`
    ).toContain(token);
  });

  it("ne pose pas de nonce sur script-src", () => {
    const nonces = tokensDeDirective("script-src").filter((t) =>
      t.startsWith("'nonce-")
    );

    // Piège non évident : en CSP niveau 3, la présence d'un nonce fait IGNORER
    // 'unsafe-inline' par les navigateurs qui le supportent. Un durcissement
    // par nonces casserait donc le srcdoc même en laissant 'unsafe-inline'
    // littéralement écrit dans la politique — et les trois tests ci-dessus
    // resteraient verts.
    expect(
      nonces,
      `script-src reçoit un nonce (${nonces.join(", ")}), ce qui neutralise ` +
        `'unsafe-inline'. ${POURQUOI}`
    ).toEqual([]);
  });
});

describe("tokensDeDirective", () => {
  it("isole les tokens d'une directive sans son nom", () => {
    expect(tokensDeDirective("object-src")).toEqual(["'none'"]);
  });

  it("isole style-src de script-src, qui partagent 'unsafe-inline'", () => {
    // C'est le cœur du garde-fou : sans isolation, chercher 'unsafe-inline'
    // dans la chaîne entière passerait au vert grâce à style-src, même après
    // son retrait de script-src.
    expect(tokensDeDirective("style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("ne confond pas une directive avec une autre au préfixe commun", () => {
    // `script-src-elem` commence par `script-src` : demander l'une ne doit
    // jamais renvoyer les tokens de l'autre.
    expect(tokensDeDirective("script-src-elem")).toEqual([]);
  });
});
