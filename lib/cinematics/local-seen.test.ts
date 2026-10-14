import { describe, expect, it } from "vitest";

import { parseSeenIds } from "./local-seen";

describe("parseSeenIds", () => {
  it("reads a valid array of ids", () => {
    expect(parseSeenIds(JSON.stringify(["html:intro", "html:chapter:chapitre-1"]))).toEqual([
      "html:intro",
      "html:chapter:chapitre-1",
    ]);
  });

  it("rejects anything that is not an array of strings", () => {
    for (const raw of [null, "", "{", "42", JSON.stringify({ a: 1 }), JSON.stringify([1, 2]), JSON.stringify(["ok", 3])]) {
      expect(parseSeenIds(raw)).toEqual([]);
    }
  });

  it("deduplicates", () => {
    expect(parseSeenIds(JSON.stringify(["a", "a", "b"]))).toEqual(["a", "b"]);
  });
});
