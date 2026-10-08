import { describe, expect, it } from "vitest";

import { PREVIEW_MOUNT_NAME_RE, parsePreviewMessage } from "./react-preview";

// Le document de l'iframe est testé dans preview-document.test.ts.

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
