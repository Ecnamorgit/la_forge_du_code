import { describe, expect, it } from "vitest";

import {
  PREVIEW_MOUNT_NAME_RE,
  buildPreviewSrcdoc,
  parsePreviewMessage,
} from "./react-preview";

const ORIGIN = "https://exemple.test";

describe("buildPreviewSrcdoc", () => {
  const html = buildPreviewSrcdoc(ORIGIN);

  it("charge le runtime par URL ABSOLUE", () => {
    expect(html).toContain(`${ORIGIN}/react-runtime/runtime.js`);
  });

  it("n'utilise aucune URL relative pour un script", () => {
    // Dans un document srcdoc la base est about:srcdoc : une src relative ne
    // resout rien. Ce test verrouille l'erreur la plus facile a commettre.
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]!);
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      expect(src.startsWith("http"), `src relative trouvee : ${src}`).toBe(true);
    }
  });

  it("cible l'origine du parent pour ses postMessage", () => {
    expect(html).toContain(JSON.stringify(ORIGIN));
  });

  it("installe un conteneur de montage", () => {
    expect(html).toContain('id="racine"');
  });

  it("installe les filets d'erreur hors cycle de rendu", () => {
    expect(html).toContain("onerror");
    expect(html).toContain("unhandledrejection");
  });

  it("emet preview:rendered juste apres root.render", () => {
    // Signal de succes necessaire au chien de garde du parent (ReactPreview) :
    // sans lui, un rendu reussi et un rendu fige dans une boucle infinie sont
    // indiscernables de l'exterieur.
    const renderIdx = html.indexOf("root.render(");
    const renderedIdx = html.indexOf('"preview:rendered"');
    expect(renderIdx).toBeGreaterThan(-1);
    expect(renderedIdx).toBeGreaterThan(renderIdx);
  });

  it("derive les globales de React au lieu de les enumerer", () => {
    expect(html).toContain("Object.keys(React)");
  });
});

describe("parsePreviewMessage", () => {
  const source = {} as Window;
  const evt = (data: unknown, from: Window | null = source) =>
    ({ data, source: from, origin: "null" }) as unknown as MessageEvent;

  it("accepte ready", () => {
    expect(parsePreviewMessage(evt({ type: "preview:ready" }), source)).toEqual({
      type: "ready",
    });
  });

  it("accepte rendered", () => {
    expect(parsePreviewMessage(evt({ type: "preview:rendered" }), source)).toEqual({
      type: "rendered",
    });
  });

  it("accepte une erreur portee", () => {
    const m = parsePreviewMessage(
      evt({ type: "preview:error", kind: "runtime", message: "boom" }),
      source
    );
    expect(m).toEqual({ type: "error", kind: "runtime", message: "boom" });
  });

  it("rejette un message d'une autre source", () => {
    expect(parsePreviewMessage(evt({ type: "preview:ready" }, {} as Window), source)).toBeNull();
  });

  it("rejette un type inconnu", () => {
    expect(parsePreviewMessage(evt({ type: "autre" }), source)).toBeNull();
  });

  it("rejette un kind d'erreur inconnu", () => {
    expect(
      parsePreviewMessage(evt({ type: "preview:error", kind: "bidon", message: "x" }), source)
    ).toBeNull();
  });

  it("rejette une charge malformee sans lever", () => {
    expect(parsePreviewMessage(evt(null), source)).toBeNull();
    expect(parsePreviewMessage(evt("texte"), source)).toBeNull();
    expect(parsePreviewMessage(evt({ type: "preview:error" }), source)).toBeNull();
  });
});

describe("PREVIEW_MOUNT_NAME_RE", () => {
  it("accepte un identifiant de composant", () => {
    expect(PREVIEW_MOUNT_NAME_RE.test("Reacteur")).toBe(true);
    expect(PREVIEW_MOUNT_NAME_RE.test("App")).toBe(true);
    expect(PREVIEW_MOUNT_NAME_RE.test("_Interne$1")).toBe(true);
  });

  it("rejette ce qui pourrait casser le corps de fonction", () => {
    expect(PREVIEW_MOUNT_NAME_RE.test("App; alert(1)")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("1App")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("Mon Composant")).toBe(false);
  });
});

describe("buildPreviewSrcdoc — garde-fous ajoutes apres revue", () => {
  const html = buildPreviewSrcdoc(ORIGIN);

  it("insere un saut de ligne avant le return injecte", () => {
    // Sans ca, un code d'apprenant finissant par un commentaire `//` avale le
    // `return` : le composant est declare introuvable alors qu'il est correct.
    // Le srcdoc porte la sequence a DEUX caracteres `\` puis `n` : c'est le
    // code de l'iframe qui la transforme en vrai saut de ligne au moment de
    // construire le corps evalue.
    expect(html).toContain(String.raw`\n; return typeof`);
  });

  it("valide le nom du composant avant de l'interpoler", () => {
    // PREVIEW_MOUNT_NAME_RE existait mais n'etait jamais applique : un nom
    // invalide produisait une SyntaxError opaque au lieu d'un message clair.
    // La source est injectee via JSON.stringify, donc ses antislashs sont
    // echappes dans le srcdoc. On compare a la meme forme, ce qui verifie du
    // meme coup que les deux expressions ne peuvent pas diverger.
    expect(html).toContain(JSON.stringify(PREVIEW_MOUNT_NAME_RE.source));
  });

  it("recupere le message de l'objet error dans window.onerror", () => {
    // Le bundle est charge cross-origin : les exceptions signalees pendant son
    // execution sont remplacees par "Script error." sans details. L'objet
    // error est alors le seul chemin vers un message utilisable.
    expect(html).toMatch(/onerror\s*=\s*function\s*\([^)]*error[^)]*\)/);
    expect(html).toContain("error.message");
  });

  it("n'enumere aucun hook en dur a cote de la derivation", () => {
    // Une liste ecrite a la main AJOUTEE a cote de Object.keys(React) passerait
    // le test de derivation : ces litteraux sont sa signature. On couvre les
    // deux styles de guillemets et plusieurs hooks, sinon la garde ne tient que
    // pour la forme exacte qu'on a imaginee.
    for (const hook of ["useState", "useRef", "useContext", "useMemo", "useEffect"]) {
      expect(html, `hook ${hook} enumere en dur`).not.toContain(`"${hook}"`);
      expect(html, `hook ${hook} enumere en dur`).not.toContain(`'${hook}'`);
    }
  });

  it("produit un script inline syntaxiquement valide", () => {
    // Ce que ce test attrape reellement : une interpolation qui produirait du JS
    // invalide dans le script assemble.
    //
    // Ce qu'il n'attrape PAS, malgre l'intuition : un backtick non echappe dans
    // un commentaire du template literal. Celui-la est une erreur de syntaxe
    // TypeScript dans le module lui-meme, donc ce fichier de test echoue au
    // chargement avant qu'aucune assertion ne tourne. C'est arrive deux fois sur
    // ce fichier ; le signal est un echec de transformation, pas ce test.
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) {
      expect(() => new Function(s)).not.toThrow();
    }
  });
});
