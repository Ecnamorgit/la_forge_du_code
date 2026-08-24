import { describe, expect, it } from "vitest";

import { parseSeenIds } from "./local-seen";

describe("parseSeenIds", () => {
  it("lit un tableau d'ids valide", () => {
    expect(parseSeenIds(JSON.stringify(["html:intro", "html:chapter:chapitre-1"]))).toEqual([
      "html:intro",
      "html:chapter:chapitre-1",
    ]);
  });

  it("rejette tout ce qui n'est pas un tableau de chaînes", () => {
    for (const raw of [null, "", "{", "42", JSON.stringify({ a: 1 }), JSON.stringify([1, 2]), JSON.stringify(["ok", 3])]) {
      expect(parseSeenIds(raw)).toEqual([]);
    }
  });

  it("déduplique", () => {
    expect(parseSeenIds(JSON.stringify(["a", "a", "b"]))).toEqual(["a", "b"]);
  });
});
