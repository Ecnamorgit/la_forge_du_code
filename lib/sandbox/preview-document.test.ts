import { describe, expect, it } from "vitest";

import { buildPreviewDocument } from "./preview-document";
import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";

/**
 * Document d'aperçu React servi depuis l'origine dédiée (audit EXE-03). Il
 * n'hérite de rien du parent : il apprend son origine au lieu de la figer, et
 * charge son runtime par URL relative.
 */
describe("buildPreviewDocument", () => {
  const html = buildPreviewDocument();

  it("installe un conteneur de montage", () => {
    expect(html).toContain('id="racine"');
  });

  it("charge le runtime par URL RELATIVE sur l'origine dédiée", () => {
    // Le document a une vraie origine : l'URL relative résout contre l'origine
    // dédiée, seule autorisée par sa CSP pour les scripts.
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]!);
    expect(srcs).toContain("/react-runtime/runtime.js");
    for (const src of srcs) {
      expect(src.startsWith("http"), `src absolue trouvée : ${src}`).toBe(false);
    }
  });

  it("ne fige aucune origine de parent : il l'apprend au runtime", () => {
    expect(html).toContain('parent.postMessage(msg, parentOrigin || "*")');
    expect(html).toContain("parentOrigin = event.origin");
  });

  it("n'adresse qu'au parent et refuse les autres origines une fois apprise", () => {
    expect(html).toContain("event.source !== parent");
    expect(html).toContain("event.origin !== parentOrigin");
  });

  it("insère un saut de ligne avant le return injecté", () => {
    // Sans ça, un code d'apprenant finissant par un commentaire `//` avale le
    // `return` : le composant est déclaré introuvable alors qu'il est correct.
    expect(html).toContain(String.raw`\n; return typeof`);
  });

  it("valide le nom du composant avec la MÊME expression que le parent", () => {
    // Injectée via JSON.stringify, jamais recopiée, pour que les deux
    // expressions ne puissent pas diverger.
    expect(html).toContain(JSON.stringify(PREVIEW_MOUNT_NAME_RE.source));
  });

  it("installe les filets d'erreur hors cycle de rendu", () => {
    expect(html).toContain("onerror");
    expect(html).toContain("unhandledrejection");
  });

  it("récupère le message de l'objet error dans window.onerror", () => {
    // Le bundle est chargé cross-origin par rapport à l'origine opaque de
    // l'iframe : les exceptions signalées pendant son exécution deviennent
    // "Script error." sans détail. L'objet error est le seul chemin utile.
    expect(html).toMatch(/onerror\s*=\s*function\s*\([^)]*error[^)]*\)/);
    expect(html).toContain("error.message");
  });

  it("dérive les globales de React au lieu de les énumérer", () => {
    expect(html).toContain("Object.keys(React)");
    for (const hook of ["useState", "useRef", "useContext", "useMemo", "useEffect"]) {
      expect(html, `hook ${hook} énuméré en dur`).not.toContain(`"${hook}"`);
      expect(html, `hook ${hook} énuméré en dur`).not.toContain(`'${hook}'`);
    }
  });

  it("produit un script inline syntaxiquement valide", () => {
    // Attrape une interpolation qui produirait du JS invalide. Un backtick non
    // échappé dans le template literal casse, lui, la compilation du module :
    // ce fichier échoue alors dès le chargement.
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
