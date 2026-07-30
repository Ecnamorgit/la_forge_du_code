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
