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

  it("acquitte le rendu depuis un effet monte, pas apres root.render", () => {
    // La proximite avec root.render est la MAUVAISE propriete a verifier : React
    // 19 ne rend pas de facon synchrone, il planifie. Un accuse poste juste
    // apres root.render partirait avant que le composant de l'apprenant ait
    // tourne une seule fois, et desarmerait le chien de garde precisement dans
    // le cas qu'il doit attraper (une boucle infinie).
    //
    // Ce qui compte : l'accuse part d'un useEffect, donc apres le commit.
    expect(html).toContain("preview:rendered");
    expect(html).toMatch(/React\.useEffect\([\s\S]{0,120}preview:rendered/);

    // Et il n'est PAS emis dans la foulee de root.render.
    const apresRender = html.slice(html.indexOf("root.render("));
    const finDuRender = apresRender.slice(0, apresRender.indexOf("} catch"));
    expect(finDuRender).not.toContain("preview:rendered");
  });

  it("transmet le nonce du rendu a l'accuse", () => {
    // Sans nonce, l'accuse du rendu n desarmerait la surveillance du rendu n+1.
    expect(html).toContain("nonce: props.nonce");
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

  it("accepte rendered avec son nonce", () => {
    expect(parsePreviewMessage(evt({ type: "preview:rendered", nonce: 7 }), source)).toEqual({
      type: "rendered",
      nonce: 7,
    });
  });

  it("rejette rendered sans nonce exploitable", () => {
    // Un accuse sans identifiant desarmerait n'importe quelle surveillance.
    expect(parsePreviewMessage(evt({ type: "preview:rendered" }), source)).toBeNull();
    expect(
      parsePreviewMessage(evt({ type: "preview:rendered", nonce: "7" }), source)
    ).toBeNull();
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

describe("buildPreviewSrcdoc — garde-fous du protocole de rendu", () => {
  const html = buildPreviewSrcdoc(ORIGIN);

  it("monte reellement la Sonde dans l'arbre rendu", () => {
    // Definir la Sonde sans l'inclure dans root.render passerait les autres
    // tests : aucun accuse ne partirait jamais et le chien de garde se
    // declencherait sur chaque rendu, meme reussi.
    expect(html).toContain("React.createElement(Sonde");
  });

  it("exige un nonce sur la demande de rendu entrante", () => {
    expect(html).toContain('typeof data.nonce !== "number"');
  });
});
